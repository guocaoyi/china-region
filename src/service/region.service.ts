import { Injectable } from '@nestjs/common'

import { RegionMapping } from '../dao/region.mapping'
import { IRegion } from '../entity/region'

/**
 * @description 主要处理初始化的数据
 * @author gcy[of1518]
 * @date 2018.7
 */
@Injectable()
export class RegionService {
  private readonly regionMapping: RegionMapping

  constructor() {
    this.regionMapping = new RegionMapping()
  }

  /**
   * @description 查询所有地址
   * @param levels
   * @return regions IRegion[]
   */

  async all(levels: string[]): Promise<IRegion[]> {
    const regions: IRegion[] = await this.regionMapping.all(levels)
    return regions
  }

  /**
   * @description 根据编号查询
   * @param id query
   * @return region IRegion
   */
  async getRegionById(id: string): Promise<IRegion> {
    const region: IRegion = await this.regionMapping.selectRegion('id', id)
    return region
  }

  /**
   * @description 根据名称查询
   * @param name 地区名称
   * @return regions IRegion[]
   */
  async getRegionsByName(name: string): Promise<IRegion[]> {
    const regions: IRegion[] = await this.regionMapping.selectRegions(
      'name',
      name,
    )
    return regions
  }

  /**
   * @description 根据名称和父级编号查询
   * @param name 地区名称
   * @param pid 父级编号
   * @return regions IRegion
   */
  async getRegionsByNameAndPid(name: string, pid: string): Promise<IRegion> {
    const region: IRegion = await this.regionMapping.selectRegionsByNameAndPid(
      name,
      pid,
    )
    return region
  }

  /**
   * @description 根据父级编号查询
   * @param pid query
   * @return regions IRegion[]
   */
  async getRegionsByPid(pid: string): Promise<IRegion[]> {
    const regions: IRegion[] = await this.regionMapping.selectRegions(
      'pid',
      pid,
    )
    return regions
  }

  /**
   * @description 根据父级编号模糊查询
   * @param pid query
   * @return regions IRegion[]
   */
  async getRegionsInPids(pids: string): Promise<IRegion[]> {
    const regions: IRegion[] = await this.regionMapping.selectRegionsInPids(
      pids,
    )
    return regions
  }

  /**
   * @description 根据行政等级查询地址列表信息
   * @param level string
   * @param regions IRegion[]
   */
  async getRegionsByLevel(level: string): Promise<IRegion[]> {
    const regions: IRegion[] = await this.regionMapping.selectRegions2(
      'level',
      level,
    )
    return regions
  }

  /**
   * @description 查询某个区县下的街道、乡镇
   * @param id string
   * @return IRegion[]
   */
  async selectStreetById(id: string): Promise<IRegion[]> {
    const street: IRegion[] = await this.regionMapping.selectStreetsByPid(id)
    return street
  }
}
