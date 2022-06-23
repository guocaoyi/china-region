import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'

/**
 * 对 全局的错误进行拦截，包装后发送前端，避免中心的问题直接抛到前端
 */
@Catch()
export default class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    response.status(status).json({
      statusCode: exception.getStatus(),
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
