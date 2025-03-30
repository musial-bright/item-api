import { FastifyRequest } from 'fastify'

export type UserinfoType = {
  aud: string[]
  email: string
  email_verified: boolean
  exp: number
  iat: number
  iss: string
  name: string
  picture: string
  sub: string
  account_id: string
  account_permissions: string[]
  team_ids: string[]
  instance_permissions: Record<string, string[]>
}

export type CurrentUserType = {
  identifier: string | undefined
  userinfo: UserinfoType | undefined
}

export const currentUser: CurrentUserType = {
  identifier: undefined,
  userinfo: undefined,
}

export const getCurrentUser = ({ request }: { request: FastifyRequest }) => {
  return request.currentUser
}
