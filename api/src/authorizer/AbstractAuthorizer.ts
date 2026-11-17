import { IncomingHttpHeaders } from 'http'
import { UserinfoType } from '../decorator/currentUser'

export type AuthorizationResult = {
  success: boolean
  message: string
  userinfo: UserinfoType | undefined
}

abstract class AbstractAuthorizer {
  headers: IncomingHttpHeaders

  constructor(headers: IncomingHttpHeaders) {
    this.headers = headers
  }

  abstract isAuthorized(): Promise<AuthorizationResult>
}

export default AbstractAuthorizer
