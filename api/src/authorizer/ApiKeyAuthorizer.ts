import { envApiKeyAuth } from '../config/envVariables'
import AbstractAuthorizer from './AbstractAuthorizer'

class ApiKeyAuthorizer extends AbstractAuthorizer {
  isAuthroized() {
    const apiKeyAuth = envApiKeyAuth()
    if (!apiKeyAuth) {
      return true
    }

    return apiKeyAuth === this.headers.authorization
  }
}

export default ApiKeyAuthorizer
