import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import {
  schemaItemDelete,
  schemaItemGet,
  schemaItemPatch,
  schemaItemPost,
} from './myItemSchema'
import {
  errorMessages,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors'
import MyItem from '../entities/MyItem'
import { getCurrentUser } from '../decorator/currentUser'

const path = '/my-item/:name'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get(
    path,
    schemaItemGet,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { name } = request.params as Record<string, string>

      const item = new MyItem(currentUser.identifier, name)

      const result = await item.get()
      if (!result) {
        throw NotFoundError({ message: errorMessages.notFound })
      }

      if (result.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: errorMessages.notFound })
      }

      // eslint-disable-next-line  @typescript-eslint/no-unused-vars
      const { id, ...sanitizedResult } = result

      return reply.send(sanitizedResult)
    },
  )

  fastify.post(
    path,
    schemaItemPost,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { name } = request.params as Record<string, string>
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const body = request.body as Record<string, any>

      const item = new MyItem(currentUser.identifier, name)
      const result = await item.create({
        attrs: {
          ...body,
          name,
          user_id: currentUser.identifier,
        },
      })

      reply.statusCode = 201

      // eslint-disable-next-line  @typescript-eslint/no-unused-vars
      const { id, ...sanitizedResult } = result

      return reply.send(sanitizedResult)
    },
  )

  fastify.patch(
    path,
    schemaItemPatch,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { name } = request.params as Record<string, string>
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const body = request.body as Record<string, any>

      const item = new MyItem(currentUser.identifier, name)

      const itemCheck = await item.get()
      if (!itemCheck) {
        throw NotFoundError({ message: errorMessages.notFound })
      }
      if (itemCheck.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: errorMessages.notFound })
      }

      const result = await item.update({
        attrs: {
          ...body,
          name: name,
        },
      })

      if (!result) {
        throw NotFoundError({ message: errorMessages.notFound })
      }

      // eslint-disable-next-line  @typescript-eslint/no-unused-vars
      const { id, ...sanitizedResult } = result

      return reply.send(sanitizedResult)
    },
  )

  fastify.delete(
    path,
    schemaItemDelete,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { name } = request.params as Record<string, string>

      const item = new MyItem(currentUser.identifier, name)

      const itemCheck = await item.get()
      if (!itemCheck) {
        throw NotFoundError({ message: errorMessages.notFound })
      }
      if (itemCheck.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: errorMessages.notFound })
      }

      const result = await item.delete()

      if (!result) {
        throw NotFoundError({ message: errorMessages.notFound })
      }

      reply.statusCode = 204

      return reply.send({})
    },
  )
}

export default routes
