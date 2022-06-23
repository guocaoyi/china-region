/**
 * response
 */
class ResponseBody {
  constructor(T: any) {
    return {
      data: T,
      errorCode: null,
      message: null,
      status: 1,
      success: true,
    }
  }
}

/**
 * err response body
 */
class ErrResponseBody {
  constructor() {
    return {
      data: null,
      success: false,
      status: 5,
      message: '请求错误',
    }
  }
}

/**
 * export
 */
export const Response = (T: any) => new ResponseBody(T)
export const ErrResponse = () => new ErrResponseBody()
