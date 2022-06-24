import { Body, Controller, Get, Post, Query } from '@nestjs/common'

import { ITag, IAddress, IRegion } from '../entity/region'
import { Response, ErrResponse } from '../entity/response'
import { segment } from '../provider/segment'
import { RegionService } from '../service/region.service'

/**
 * @description 分词处理控制器
 * @author yalda
 * @date 2019.03
 */
@Controller('api')
export class StructController {
  constructor(private readonly regionService: RegionService) {}

  /**
   * 分词 get
   * @param query {q:''}
   * @return Address IAddress
   */
  @Get('/region/struct')
  async struct(@Query() { q }: any) {
    const result: any = await this.segmentAddress(q)
    return Response(result)
  }

  /**
   * 分词 post
   * @param body {q:''}
   * @return Address IAddress
   */
  @Post('/region/struct')
  async $struct(@Body() { q }: any) {
    const result: IAddress = await this.segmentAddress(q)
    return Response(result)
  }

  /**
   * 批量分词 post
   * @param body { list: Array<string> }
   * @return Array<IAddress>;
   */
  @Post('/region/stuctList')
  async stuctList(@Body() { list }: IStuctListBody) {
    // 限制批量解析最大数量
    const PARSE_MAX_LIMIT = 50
    if (Array.isArray(list) && list.length < PARSE_MAX_LIMIT) {
      const data = await Promise.all(list.map(str => this.segmentAddress(str)))
      return Response(data)
    } else {
      return ErrResponse()
    }
  }

  /**
   * 分词
   * @private
   * @param words string
   * @return Address IAddress
   */
  private async segmentAddress(words: string): Promise<IAddress> {
    const segments: ITag[] = segment.tag(words)
    const address: IAddress = {
      provinceId: '',
      province: '',
      cityId: '',
      city: '',
      areaId: '',
      area: '',
      streetId: '',
      street: '',
      regionCode: '', // 该地区编号（最小一级：四级）
      regionId: '', // 该地区编号（最小一级：三级）
      address: '', // 详细地址（不包含四级）
      detail: '', // 详细地址（包含四级）
    }

    let tag_break: string
    segments.forEach((t: any): void => {
      if (/^province|city|area|street/g.test(t.tag)) {
        tag_break = t.tag
      }
    })

    for (let i = 0; i < segments.length; i++) {
      const t = segments[i]
      let req: IRegion
      if (/(province)$/.test(t.tag) && !!t.word) {
        req = await this.regionService.getRegionsByNameAndPid(t.word, '086')
        address.provinceId = req ? req.id : ''
        address.province = req ? req.name : ''
      } else if (/(city)$/.test(t.tag) && !!t.word && !!address.provinceId) {
        req = await this.regionService.getRegionsByNameAndPid(
          t.word,
          address.provinceId,
        )
        address.cityId = req ? req.id : ''
        address.city = req ? req.name : ''
      } else if (/(area)$/.test(t.tag) && !!t.word && !!address.cityId) {
        req = await this.regionService.getRegionsByNameAndPid(
          t.word,
          address.cityId,
        )
        address.areaId = req ? req.id : ''
        address.area = req ? req.name : ''
      } else if (/(street)$/.test(t.tag) && !!t.word && address.areaId) {
        req = await this.regionService.getRegionsByNameAndPid(
          t.word,
          address.areaId,
        )
        if (req && req.id) {
          address.streetId = req.id
          address.street = req.name
        } else {
          address.address += t.word
        }
        address.detail += t.word
      } else {
        address.address += t.word
        address.detail += t.word
      }
      if (tag_break === t.tag) {
        segments.splice(0, i + 1)
        break
      }
    }

    address.address += segments.reduce(
      (pre: ITag, next: ITag): any => pre + next.word,
      '',
    )
    address.detail += address.address

    address.regionCode = address.streetId
    address.regionId = address.areaId || address.cityId || address.provinceId

    return address
  }
}

interface IStuctListBody {
  list: Array<string>
}
