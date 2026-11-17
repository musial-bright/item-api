import { envApiKeyAuth } from '../config/envVariables'
import AbstractAuthorizer, { AuthorizationResult } from './AbstractAuthorizer'

/**
 * Development only authorizer: grants access via a static API key.
 * Not intended for staging/production use.
 */
class ApiKeyAuthorizer extends AbstractAuthorizer {
  async isAuthorized(): Promise<AuthorizationResult> {
    const apiKeyAuth = envApiKeyAuth()
    if (!apiKeyAuth) {
      return {
        success: false,
        message: 'no auth key configured',
        userinfo: undefined,
      }
    }

    const authorized = apiKeyAuth === this.headers.authorization
    return {
      success: authorized,
      message: authorized ? '' : 'not authorized',
      userinfo: undefined,
    }
  }
}

export default ApiKeyAuthorizer
