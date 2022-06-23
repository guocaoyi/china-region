/**
 * 聚合对象
 * @param region region
 */
export const aggre = region => {
  const container: any = {} // 集合
  Object.keys(region).map(r => {
    const [label, pid] = region[r]
    const subRegion: any = { id: r, label, pids: '' }
    if (!(pid in container)) {
      container[pid] = []
    }
    container[pid].push(subRegion)
  })
  return container
}

/**
 * 聚合递归
 * @param {*} value
 */
export const aggreRecursive = (
  regions: Array<any>,
  container: any,
  pids: string[],
  deep: number,
) => {
  if (regions && regions.length > 0) {
    return regions.map((subRegions: any) => {
      const { id } = subRegions
      pids.push(id)
      const children = aggreRecursive(container[id], container, pids, ++deep)
      --deep
      pids.pop()
      subRegions.pid = pids[deep]
      subRegions.pids = pids.join(',')
      subRegions.level = ['province', 'city', 'area'][deep]
      if (!!children) subRegions.children = children
      return subRegions
    })
  }
}

/**
 * 扁平解构数据
 */
export const flat = (region: Array<any>) => {
  let container: Array<any> = []
  region.forEach(r => {
    container = flatRecursive(r, container)
  })
  return container
}

/**
 * 解构递归
 * @param request request
 */
export const flatRecursive = (region: any, container?: Array<any>) => {
  const { id, label, pid, level, children, pids } = region
  container.push({
    id,
    name: label,
    pid,
    level,
    pids,
  })
  if (children && children.length > 0) {
    children.forEach(c => {
      container = this.flatRecursive(c, container)
    })
  }
  return container
}
