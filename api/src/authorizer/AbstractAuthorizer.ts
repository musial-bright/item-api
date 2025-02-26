import { IncomingHttpHeaders } from 'http'

abstract class AbstractAuthorizer {
  headers: IncomingHttpHeaders

  constructor(headers: IncomingHttpHeaders) {
    this.headers = headers
  }

  abstract isAuthroized(): boolean
}

export default AbstractAuthorizer
