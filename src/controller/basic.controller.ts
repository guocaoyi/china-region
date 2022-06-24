import { Controller, Get } from '@nestjs/common'

/**
 * @description basic
 * @author yalda
 * @date 2018.07
 */
@Controller()
export class BasicController {
  /**
   * @description 接口健康检查
   * @mapped /check
   */
  @Get('/check')
  check() {
    return 'ok!'
  }
}
