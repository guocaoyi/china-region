import { writeFileSync } from 'fs'
import { resolve } from 'path'

interface IRegionHashMap {
  [T: string]: [string, string | number]
}

type IRegionArray = [string, string] | [string, string, string[]]

interface IRegionMap {
  label: string;
  value: string | number;
  children?: IRegionMap[]
}

/**
 * transform
 * @author gcy[of1518]
 */
export class Transform {
  private adapter:
    | Transform['listToArrayTree']
    | Transform['listToObjectiveTree']
    | Transform['arrayTreeToList']
    | Transform['hashMapToList']
  private filename: string
  private data: any // 未转义数据
  private cache: any // 已转义数据

  /**
   * 空间复杂度:O(2n)
   * 时间复杂度:O(2n)
   *
   * from
   *
   * '110000': ['北京', '086'],
   * '110100': ['北京市', '110000'],
   * '110101': ['东城区', '110100'],
   * '110102': ['西城区', '110100'],
   *
   * to
   *
   * {
   *   label: '北京',
   *   value: '110000',
   *   children: [{
   *     label: '北京市',
   *     value: '110000',
   *     children: [
   *       {
   *         label: '东城区',
   *         value: '110101',
   *       },
   *       {
   *         label: '西城区',
   *         value: '110102',
   *       },
   *       ...
   *     ]
   *   }]
   * },
   * ...
   */
  private listToObjectiveTree(regionMap: IRegionArray[]) {
    const map: IRegionMap[] = [{
      label: '中国',
      value: '086',
      children: [],
    }]
    const mapIndex: { [K: string]: string } = {
      '086': '0',
    }

    /**
     * 1.排序 -> 2.遍历 -> 3.创建 id index 索引
     */
    Object
      .keys(regionMap)
      .sort()
      .forEach((reginId: string) => {
        if (reginId === '086') return
        const [label, parentId] = regionMap[reginId]
        // 已排序，默认 parentId 均存在 mapIndex 中
        const pIndex = mapIndex[parentId]
        const pPath = pIndex.split(',').map(i => `[${i}]`).join('.children')
        // tslint:disable-next-line:no-eval
        const pcollection: IRegionMap = eval(`map${pPath}`)

        // 判断 parent 是否有 children
        if (!('children' in pcollection)) {
          pcollection.children = []
        }
        let len = pcollection.children.push({
          label,
          value: reginId,
        })
        // 记录当前 index 位置，用于子项插入值
        mapIndex[reginId] = mapIndex[parentId] + `,${--len}`
      })
    this.cache = map[0].children
    return this
  }

  /**
   * 空间复杂度:O(2n)
   * 时间复杂度:O(2n)
   * from
   *
   * '110000': ['北京', '086'],
   * '110100': ['北京市', '110000'],
   * '110101': ['东城区', '110100'],
   * '110102': ['西城区', '110100'],
   *
   * to
   *
   * [
   *    "北京",110000,[
   *      "北京市", 110100,[
   *        ["东城区", 110101],
   *        ["西城区", 110102],
   *        ...
   *      ]
   *    ],
   * ],
   * [...]
   */
  private listToArrayTree(regionMap: IRegionArray[]) {
    const map: IRegionArray[] = [[
      '中国', '086', [],
    ]]
    const mapIndex: { [K: string]: string } = {
      '086': '0',
    }

    /**
     * 1.排序 -> 2.遍历 -> 3.创建 id index 索引
     */
    Object
      .keys(regionMap)
      .sort()
      .forEach((reginId: string) => {
        if (reginId === '086') return
        const [label, parentId] = regionMap[reginId]
        // 已排序，默认 parentId 均存在 mapIndex 中
        const pIndex = mapIndex[parentId]
        const pPath = pIndex.split(',').map(i => `[${i}]`).join('[2]')
        // tslint:disable-next-line:no-eval
        const pcollection: IRegionMap = eval(`map${pPath}`)

        // 判断 parent 是否有 children
        if (!pcollection[2]) {
          pcollection[2] = []
        }
        let len = pcollection[2].push([label, Number(reginId)])
        // 记录当前 index 位置，用于子项插入值
        mapIndex[reginId] = mapIndex[parentId] + `,${--len}`
      })
    this.cache = map[0][2]
    return this
  }

  /**
   * from
   *
   * [
   *    "北京",110000,[
   *      "北京市", 110100,[
   *        ["东城区", 110101],
   *        ["西城区", 110102],
   *        ...
   *      ]
   *    ],
   * ],
   * [...]
   *
   * to
   *
   * '110000': ['北京', '086'],
   * '110100': ['北京市', '110000'],
   * '110101': ['东城区', '110100'],
   * '110102': ['西城区', '110100'],
   */
  private arrayTreeToList(regionArrays: IRegionArray[], sort?: boolean) {
    const map: IRegionHashMap = {}
    const itera = (regionMap: IRegionArray[], parentId: string | number) => {
      regionMap.forEach((m: IRegionArray) => {
        const [label, value] = m
        const children: any = m[2]
        map[value] = [label, parentId]
        if (children && children.length > 0) {
          itera(children, value)
        }
      })
    }
    itera(regionArrays, '086')
    this.cache = map
    return this
  }

  /**
   * from
   *
   * {
   *   label: '北京',
   *   value: '110000',
   *   children: [{
   *     label: '北京市',
   *     value: '110000',
   *     children: [
   *       {
   *         label: '东城区',
   *         value: '110101',
   *       },
   *       {
   *         label: '西城区',
   *         value: '110102',
   *       },
   *       ...
   *     ]
   *   }]
   * },
   * ...
   *
   * to
   *
   * '110000': ['北京', '086'],
   * '110100': ['北京市', '110000'],
   * '110101': ['东城区', '110100'],
   * '110102': ['西城区', '110100'],
   */
  private hashMapToList(regionMaps: IRegionMap[], sort?: boolean) {
    const map: IRegionHashMap = {}
    const itera = (regionMap: IRegionMap[], parentId: string | number) => {
      regionMap.forEach((m: IRegionMap) => {
        const { label, value, children } = m
        map[Number(value)] = [label, Number(parentId)]
        if (children && children.length > 0) {
          itera(children, value)
        }
      })
    }
    itera(regionMaps, '086')
    this.cache = map
    return this
  }

  /**
   * adapter 适配器
   * @param method string
   */
  public setMode(method:
    | 'listToArrayTree'
    | 'listToObjectiveTree'
    | 'arrayTreeToList'
    | 'hashMapToList') {

    this.adapter = this[method].bind(this)
    return this
  }

  /**
   * 读取文件
   * @param filename 文件名
   */
  read(filename: string) {
    this.filename = filename
    const { default: data } = require(resolve(__dirname, filename))

    this.data = data
    return this
  }

  /**
   * 开始转数据
   */
  trans() {
    this.adapter.call(this, this.data)
    return this
  }

  /**
   * 写文件
   */
  write(filename?: string, defined?: string) {
    writeFileSync(
      resolve(__dirname, filename || this.filename),
      defined + JSON.stringify(this.cache),
      { encoding: 'utf8' },
    )
    return this
  }
}
