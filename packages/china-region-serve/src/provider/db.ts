
import * as cp from 'child_process'
import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import * as process from 'process'
import { verbose, Database, Statement } from 'sqlite3'

import { dubbo } from './dubbo'
import { IRegion } from '../entity/region'
import { aggre, aggreRecursive, flat } from '../utils/format'

interface IStreet{}

/**
 * 这边数据源使用两种
 */
const remoteJs: any = {
  hostname: '../',
  filepath: '/assets/China_Region_Last.js',
  filename: 'region_cache.js',
  lib: 'CHINA_REGION',
}

/**
 * 数据实例
 */
export let db: Database

/**
 * 创建 DB 实例 & 连接 & 完成数据的初始化工作
 */
export class DBProvider {
  private readonly root: string = process.cwd()
  private readonly sourseRoot: string = `${process.cwd()}/bin` // 数据文档目录
  private connectStatus: boolean = false // 数据连接状态
  private env: string = process.env.NODE_ENV

  constructor() {
    const _this = this

    // 文档初始化
    cp.execSync(`rm -rf ${this.sourseRoot}`)
    fs.mkdirSync(this.sourseRoot)

    // 创建|链接数据库&构建实例
    const sqlite = verbose()
    // anonymous 形式的数据是基于内存的，在关闭连接后，所有内容丢失；
    const database = new sqlite.Database(
      `${this.sourseRoot}/region.sqlite`,
      sqlite.OPEN_READWRITE || sqlite.OPEN_CREATE,
    )

    // db#open
    database.on('open', () => {
      _this.connectStatus = true
    })

    /**
     * db#error
     */
    database.on('error', err => {
      console.info('数据库链接错误！', err)
    })

    // 实例引用
    db = database
  }

  /**
   * connect
   */
  async connect() {
    let connectTimes = 10
    await new Promise((resolve, reject) => {
      // 链接成功
      const interval = setInterval(() => {
        if (this.connectStatus && connectTimes > 0) {
          console.info('数据库连接成功！')
          clearInterval(interval)
          resolve()
        } else if (connectTimes <= 0) {
          console.info('数据库连接超时！')
          reject() // 连接超时
        } else {
          connectTimes--
        }
      }, 250)
    })
  }

  /**
   *
   */
  async init() {
    // 初始化数据，读写数据
    const mapper = new DataSourceMapper()
    await mapper.init()
  }

  /**
   * 关闭 db 连接
   */
  destroy() {
    db.close()
  }
}

/**
 * mapper
 */
class DataSourceMapper {
  private readonly sourseRoot: string = `${process.cwd()}/bin` // 数据文档目录

  /**
   * 初始化
   */
  async init() {
    // step1: 创建表
    await this.createTable()

    db.run('BEGIN TRANSACTION')

    // step2: 获取省市区地址
    const region: any = await this.getRegionFromPicFile()
    // 判定文件是否存在，存在即不做修改

    const container: any = aggre(region)
    const request: IRegion[] = container['086']
    aggreRecursive(request, container, ['086'], 0) // 聚合数据
    fs.writeFileSync(
      path.resolve(this.sourseRoot, 'region.struct.json'),
      JSON.stringify(request),
      {
        encoding: 'utf8',
      },
    )
    const flatData = flat(request) // 数据扁平化

    // step3: 省市区地址写入表中
    await this.insertData(flatData)

    // step4: 市、区、县、州、盟、旗 全区处理并写入表中
    const da = flatData
      .filter((d: IRegion) => d.level === 'area')
      .map((d: IRegion) => {
        let name: string = '全区'
        d.name.replace(/(市|区|县|州|盟|旗)$/, m => (name = `全${m || '区'}`))
        return {
          id: `${d.id}000`,
          name,
          pid: d.id,
          level: 'street',
        }
      })
    await this.insertData(da)

    // step5: 获取街道地址;
    const streets: IStreet[] = await this.getStreetFromDubbo()

    // step6: 街道地址写入表中;
    await this.insertData(streets, (r: IStreet) => ({
      id: r.id,
      name: r.name,
      pid: r.regionid,
      level: 'street',
    }))

    db.run('COMMIT TRANSACTION')
  }

  /**
   * 创建表
   */
  private async createTable() {
    await db.run(
      `CREATE TABLE REGION (
        id    CHARACTER(20)   NOT NULL,
        name  VARCHAR(255)    NOT NULL,
        pid   CHARACTER(20)   NOT NULL,
        level CHARACTER(20)   NOT NULL,
        pids  VARCHAR(255)
      );`,
    )
  }

  /**
   * @description 批量写入数据
   * @param region[]
   */
  private async insertData(
    region: Array<IRegion | IStreet>,
    format?: (r: IRegion) => IRegion,
  ) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const stmt: Statement = db.prepare(
          `INSERT INTO REGION(id,pid,name,level,pids) VALUES(?,?,?,?,?);`,
        )
        region.forEach((r: IRegion) => {
          if (format && typeof format === 'function') {
            r = format(r)
          }
          stmt.run(r.id, r.pid, r.name, r.level, r.pids || '')
        })
        stmt.finalize(() => {
          resolve()
        })
      })
      db.on('error', () => {
        reject()
      })
    })
  }

  /**
   * 获取region对象，如果没有则直接下载远程js,缓存到本地
   */
  private async getRegionFromPicFile() {
    return await new Promise((resolve, reject) => {
      if (fs.existsSync(path.join(this.sourseRoot, remoteJs.filename))) {
        // @ts-ignore
        const data: any = require(path.join(this.sourseRoot, remoteJs.filename))
        resolve(data)
        return
      }
      const { hostname, filepath, filename, lib } = remoteJs
      // get and write region file
      const file: fs.WriteStream = fs.createWriteStream(
        path.join(this.sourseRoot, filename),
      )
      const req: http.ClientRequest = http.request(
        {
          hostname,
          path: filepath,
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-javascript',
          },
        },
        (res: http.IncomingMessage) => {
          const { statusCode } = res
          const contentType = res.headers['content-type']
          let error: Error
          if (statusCode !== 200) {
            error = new Error(`Request Failed.\nStatus Code: ${statusCode}`)
          } else if (!/^application\/x-javascript/.test(contentType)) {
            error = new Error(`
            Invalid content-type.\n Expected application/x-javascript but received ${contentType}`)
          }
          if (error) {
            res.resume()
            reject({ error })
          }
          res.setEncoding('utf8')
          // file pipe
          res.pipe(file)
          res.prependOnceListener('end', () => {
            file.write(`\nmodule.exports = ${lib};`) // cmd转es module
            file.end(() => {
              // 读取数据
              // @ts-ignore
              const data: any = require(path.join(
                this.sourseRoot,
                remoteJs.filename,
              ))
              // 删除文档缓存
              resolve(data)
            })
          })
        },
      )
      req.on('error', err => {
        reject(err)
      })
      // 关闭ClientRequest
      req.end()
    })
  }

  /**
   * 获取街道地址
   * @return IStreet[]
   */
  private async getStreetFromDubbo() {
    const response: any = await dubbo.service.RegionProvider.allStreet()
    const {
      res: {
        data: { dataList },
      },
    } = response
    return dataList
  }
}
