export type TokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
  user_id?: string
}

export type StoredToken = {
  access_token: string
  expires_in: number
  token_type: string
  ttl: number
  category: string
  name: string
  user_id?: string
}
