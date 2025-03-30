import { envApiKeyAuth } from '../config/envVariables'
import AbstractAuthorizer, { AuthorizationResult } from './AbstractAuthorizer'

class ApiKeyAuthorizer extends AbstractAuthorizer {
  async isAuthroized(): Promise<AuthorizationResult> {
    const apiKeyAuth = envApiKeyAuth()
    if (!apiKeyAuth) {
      return {
        success: false,
        message: 'no auth key configured',
      }
    }

    const authroized = apiKeyAuth === this.headers.authorization
    return {
      success: authroized,
      message: authroized ? '' : 'not authorized',
    }
  }
}

export default ApiKeyAuthorizer
