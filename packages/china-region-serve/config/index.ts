import * as process from 'process'
import * as fs from 'fs'
import * as path from 'path'

export interface DubboConfig {
  name?: string
  zookeeper?: string
}

export interface IConfig {
  dubbo?: DubboConfig
}

let map: IConfig = {}
const filemap: { [T: string]: string } = {
  test0: './config.test0.json',
}

map = JSON.parse(
  fs.readFileSync(
    path.join(
      process.cwd(),
      'config',
      filemap[process.env.NODE_ENV] || './config.default.json',
    ),
    { encoding: 'utf8' },
  ),
)

export const config: IConfig = map
