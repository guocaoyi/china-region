import { IRegion } from '../entity/region'
import { db } from '../provider/db'

/**
 * @description Region Mapping
 * @author gcy[of1518]
 * @date 2019.03.12
 */
export class RegionMapping {
  /**
   * @description 查询多级行政级别的地址
   * @param levels 行政级别
   */
  async all(levels: string[]): Promise<IRegion[]> {
    const result: any = await new Promise((resolve, reject) => {
      db.on('trace', sql => {
        console.info(sql)
      })
      db.all(
        `
        SELECT id,name,pid FROM REGION r
        WHERE r.level in (${levels.map(l => JSON.stringify(l)).join(',')})
        `,
        (err, datas: IRegion[]) => {
          if (err) {
            reject(err)
          }
          resolve(datas)
        },
      )
    })
    return result
  }

  /**
   * @description 查询符合条件的单个地址
   * @param field 列名
   * @param query 查询值
   * @return Promise<IRegion>
   */
  async selectRegion(field: string = 'id', query: string): Promise<IRegion> {
    const result: any = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM REGION r WHERE r.${field} = "${query}"`,
        (err, data: IRegion) => {
          if (err) {
            reject(err)
          }
          resolve(data)
        },
      )
    })
    return result
  }

  /**
   * @description 查询符合条件的地址
   * @param field 列名
   * @param query 查询值
   * @return Promise<IRegion[]>
   */
  async selectRegions(
    field: string = 'name',
    query: string,
  ): Promise<IRegion[]> {
    const result: any = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM REGION r WHERE r.${field} = "${query}"`,
        (err, datas: IRegion[]) => {
          if (err) {
            reject(err)
          }
          resolve(datas)
        },
      )
    })
    return result
  }

  /**
   * @description 查询符合条件的地址
   * @param field 列名
   * @param query 查询值
   * @return Promise<IRegion[]>
   */
  async selectRegions2(
    field: string = 'name',
    query: string,
  ): Promise<IRegion[]> {
    const result: any = await new Promise((resolve, reject) => {
      db.all(
        `SELECT name,pid FROM REGION r WHERE r.${field} = "${query}"`,
        (err, datas: IRegion[]) => {
          if (err) {
            reject(err)
          }
          resolve(datas)
        },
      )
    })
    return result
  }

  /**
   * @description 根据父级编号模糊查询
   * @param query 查询值
   * @return Promise<IRegion[]>
   */
  async selectRegionsInPids(query: string): Promise<IRegion[]> {
    const result: any = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM REGION r WHERE r.pids like "%${query}%"`,
        (err, datas: IRegion[]) => {
          if (err) {
            reject(err)
          }
          resolve(datas)
        },
      )
    })
    return result
  }

  /**
   * @description 根据父级编号查询街道地址列表
   * @param name 地区名称
   * @param pid 父级编号
   * @return Promise<IRegion[]>
   */
  async selectRegionsByNameAndPid(name: string, pid: string): Promise<IRegion> {
    const result: any = await new Promise((resolve, reject) => {
      db.get(
        `
        SELECT id,name FROM REGION r 
        WHERE r.name = '${name}' AND r.pid="${pid}"
        `,
        (err, data: IRegion) => {
          if (err) {
            reject(err)
          }
          resolve(data)
        },
      )
    })
    return result
  }

  /**
   * @description 根据父级编号查询街道地址列表
   * @param query pid query
   * @return Promise<IRegion[]>
   */
  async selectStreetsByPid(query: string): Promise<IRegion[]> {
    const result: any = await new Promise((resolve, reject) => {
      db.all(
        `
        SELECT id,name,pid FROM REGION r 
        WHERE r.level = 'street' AND r.pid="${query}"
        `,
        (err, datas: IRegion[]) => {
          if (err) {
            reject(err)
          }
          resolve(datas)
        },
      )
    })
    return result
  }
}
