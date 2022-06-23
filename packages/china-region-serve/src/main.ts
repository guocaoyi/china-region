import { NestFactory } from '@nestjs/core'

import { AppModule } from './module'
import { DubboProvider } from './provider/dubbo'
import { DBProvider } from './provider/db'
import { SegmentProvider } from './provider/segment'

/**
 * app runner
 */
const bootstrat = async () => {
  // 创建 nest 实例
  const app = await NestFactory.create(AppModule)

  // 创建&连接 Dubbo
  const dubboProvider = new DubboProvider()
  await dubboProvider.connect()

  // 创建&连接 DB
  const dbProvider = new DBProvider()
  await dbProvider.connect()
  await dbProvider.init()

  // 分词加载字典
  const segmentProvider = new SegmentProvider()
  await segmentProvider.connect()
  await segmentProvider.init()

  /**
   * 跨域处理
   * @todo 这里减少 headers 的兼容，后续会只支持 Authorization
   */
  app.enableCors({
    origin: (undefined, cb) => cb(null, true),
    methods: 'GET,POST,OPTION',
    allowedHeaders: [
      'Platform',
      'systemId',
      'adminid',
      'Accept',
      'Charset',
      'Content-Type',
      'reqId',
      'Sign',
      'Authorization',
      'X-IM-UserType',
      'D2pAuthorization',
      'X-IM-Token',
      'Platform-No',
    ],
    optionsSuccessStatus: 204,
    credentials: true,
    maxAge: 3600,
  })

  // 监听端口 3000
  await app.listen(3000)
}

bootstrat()
