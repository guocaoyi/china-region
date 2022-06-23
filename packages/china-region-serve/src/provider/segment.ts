import * as fs from 'fs'
import * as nodejieba from 'nodejieba'
import * as path from 'path'
import * as process from 'process'

import { IRegion } from '../entity/region'
import { db } from './db'

/**
 * nodejieba 实例
 */
export const segment = nodejieba

/**
 * SegmentProvider
 */
export class SegmentProvider {
  private readonly binRoot: string = `${process.cwd()}/bin` // 数据文档目录
  private readonly dicFileName: string = 'region.utf8' // 自定义字典文档
  private env: string = process.env.NODE_ENV
  private readonly weightMap: any = {
    province: 99999,
    city: 9999,
    area: 999,
    street: 998,
  }

  /**
   * 获取数据
   */
  async connect() {
    // 获取数据
    const data: any = await this.getAllRegion()

    // 处理数据
    await this.makeDic(data)
  }

  /**
   * load dic
   */
  async init() {
    nodejieba.load({
      userDict: path.join(this.binRoot, this.dicFileName),
    })
  }

  /**
   * 获取所有 省、市、区、街道、乡镇 数据
   */
  private async getAllRegion() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id,pid,name,level FROM REGION`,
        (err: any, rows: IRegion[]) => {
          if (err) {
            reject(rows)
          }
          resolve(rows)
        },
      )
    })
  }

  /**
   * 制作字典
   * @param data
   */
  async makeDic(data: IRegion[]) {
    const _this = this

    const dicArray: string[] = data.map((e: IRegion) => {
      const weight = _this.weightMap[e.level || '']
      return `${e.name} ${weight} ${e.level}`
    })
    const dicStringify: string = dicArray.join('\n')

    // 保存字典文档
    fs.writeFileSync(
      path.resolve(this.binRoot, this.dicFileName),
      dicStringify,
      {
        encoding: 'utf8',
      },
    )
  }
}
