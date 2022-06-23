import * as fs from 'fs'
import * as path from 'path'
import * as process from 'process'
import { Controller, Get, Query, Param } from '@nestjs/common'

import { RegionService } from '../service/region.service'
import { Response } from '../entity/response'
import { IRegion, IRegionColl } from '../entity/region'

/**
 * @description 查询控制器
 * @author gcy[of1518]
 * @date 2018.07
 */
@Controller('api')
export class QueryController {
  private readonly sourseRoot: string = `${process.cwd()}/bin` // 数据文档目录
  private readonly queryDeep = ['province', 'city', 'area', 'street']

  constructor(private readonly regionService: RegionService) { }

  /**
   * @description 根据编号查询地址信息
   * @param q id
   * @return region IRegion
   */
  @Get('/region/id')
  async getRegionById(@Query() { q: id }: any) {
    const region: IRegion = await this.regionService.getRegionById(id)
    return Response(region)
  }

  /**
   * @description 根据地区名称查询地址信息
   * @param q name
   * @return regions IRegion[]
   */
  @Get('/region/name')
  async getRegionsByName(@Query() { q: name }: any) {
    const regions: IRegion[] = await this.regionService.getRegionsByName(name)
    return Response(regions)
  }

  /**
   * @description 根据父级编号查询地址信息
   * @param q pid
   * @return regions IRegion[]
   */
  @Get('/region/pid')
  async getRegionsByPid(@Query() { q: pid }: any) {
    const regions: IRegion[] = await this.regionService.getRegionsByPid(pid)
    return Response(regions)
  }

  /**
   * @description 根据父级编号查询地址信息
   * @query q pids
   * @return regions IRegion[]
   */
  @Get('/region/pids')
  async getRegionsByPids(@Query() query: any) {
    const { q: pids } = query
    const regions: IRegion[] = await this.regionService.getRegionsInPids(pids)
    return Response(regions)
  }

  /**
   * @description 根据地区行政级别查询地址信息
   * @query q query
   */
  @Get('/region/level')
  async getRegionsByLevel(@Query() { q }: any) {
    const rows: any = await this.regionService.getRegionsByLevel(q)
    return Response(rows)
  }

  /**
   * @description 查询所有街道地址（包含街道编号）
   * @param structure 'flat','tree' 数据结构：扁平、树形
   * @return IRegionColl
   */
  @Get('/street')
  async allStreets(@Query() query: any) {
    const { struct = 'flat' } = query
    let result: any
    const streets: IRegion[] = await this.regionService.getRegionsByLevel(
      'street',
    )

    // 数据封装，树状结构
    if (struct === 'tree') {
      const map = {}
      streets.forEach((s: IRegion) => {
        if (!(s.pid in map)) {
          map[s.pid] = []
        }
        map[s.pid].push({ id: s.pid, name: s.name })
      })
      result = map
    } else {
      result = streets
    }
    return Response(result)
  }

  /**
   * @description 查询所有街道地址（包含街道编号）
   * @param structure 'flat','tree' 数据结构：扁平、树形
   * @return IRegionColl
   */
  @Get('/v1/street')
  async allStreets2() {
    let result: any
    const streets: IRegion[] = await this.regionService.getRegionsByLevel(
      'street',
    )

    const map = {}
    streets.forEach((s: IRegion) => {
      if (!(s.pid in map)) {
        map[s.pid] = []
      }
      map[s.pid].push(s.name)
    })
    result = map
    return Response(result)
  }

  /**
   * @description 查询某个区域或者县城的街道、乡镇
   * @param aredId
   * @returns result {pid:string,vlues:string[]}
   */
  @Get('/street/:areaId')
  async streetById(@Param() params: any) {
    const { areaId } = params
    const data: any = await this.regionService.selectStreetById(areaId)
    const result: any = {}
    result.pid = areaId
    result.value = (data || []).map((s: any) => s.name).join(',')
    return Response(result)
  }

  /**
   * @description 查询某个区域或者县城的街道、乡镇(带街道编号)
   * @param areaId 地址编号
   * @returns Promise<ResponseBody<[{id:'',name:''}]>>
   */
  @Get('/streets/:areaId')
  async streetsById(@Param() params: any) {
    const { areaId } = params
    const data = await this.regionService.selectStreetById(areaId)
    return Response(data)
  }

  /**
   * @param structure 'flat','tree' 数据结构：扁平、树形
   * @param deep 1,2,3,4 查询深度
   */
  @Get('/region/:structure/:deep')
  async allRegions(@Param() { structure = 'flat', deep = 1 }) {
    const level: string[] = this.queryDeep.slice(0, deep)
    const regions: IRegion[] = await this.regionService.all(level)
    return Response(regions)
  }

  /**
   * 兼容老接口书，改接口即将废弃
   * @return IRegionColl
   */
  @Get('/region')
  async all() {
    const str = fs.readFileSync(
      path.resolve(this.sourseRoot, 'region.struct.json'),
      {
        encoding: 'utf8',
      },
    )
    return Response(JSON.parse(str || '[]'))
  }
}
