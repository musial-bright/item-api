import { UserinfoType } from '../decorator/currentUser'
import { getUserInfo } from '../service/iam/jrIamService'
import { getAuthorizationToken, prepareServiceParam } from '../utils/iamHelper'
import AbstractAuthorizer, { AuthorizationResult } from './AbstractAuthorizer'

class JrAuthorizer extends AbstractAuthorizer {
  async isAuthorized(): Promise<AuthorizationResult> {
    const token = getAuthorizationToken(this.headers)
    const params = prepareServiceParam(this.headers)

    const userInfo = await getUserInfo(token, params)

    let message = ''
    try {
      message = JSON.stringify(userInfo.data)
    } catch (e) {
      console.error('authorizationGuard() error:', e)
    }

    return {
      success: userInfo.statusCode === 200,
      message,
      userinfo: userInfo.data as UserinfoType,
    }
  }
}

export default JrAuthorizer
