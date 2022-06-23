/**
 * level enum
 */
export enum ELevel {
  PROVINCE = 'province',
  CITY = 'city',
  AREA = 'area',
  STREET = 'street',
}

/**
 * Tag
 */
export interface ITag {
  word: string
  tag: string
}

/**
 * IRegion
 */
export interface IRegion {
  id: string // 编号
  name: string // 姓名
  pid?: string // 父级编号
  level?: string // 行政级别
  pids?: string // 父级编号链
}

/**
 * IRegion
 */
export interface IRegionColl {
  id: string // 编号
  name: string // 姓名
  children?: IRegion[] // 子级
}

/**
 * IAddress
 */
export interface IAddress {
  provinceId?: string // 省编号
  province?: string // 省名称
  cityId?: string // 市编号
  city?: string // 市名称
  areaId?: string // 区县编号
  area?: string // 区县名称
  streetId?: string // 街道编号
  street?: string // 街道名称
  regionId: string // 该地区编号（最小一级：三级）
  regionCode?: string // 该地区编号（最小一级：四级）
  address?: string // 详细地址（不包含四级）
  detail?: string // 详细地址（包含四级）
}
