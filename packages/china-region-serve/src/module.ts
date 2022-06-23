import { Module } from '@nestjs/common'

import { BasicController } from './controller/basic.controller'
import { QueryController } from './controller/query.controller'
import { StructController } from './controller/struct.controller'
import { RegionService } from './service/region.service'

/**
 * app module
 */
@Module({
  controllers: [BasicController, QueryController, StructController],
  providers: [RegionService],
})
export class AppModule {}
