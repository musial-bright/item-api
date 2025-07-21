import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { IndexPathResponseType } from './types'
import {
  schemaItemDelete,
  schemaItemGet,
  schemaItemsGet,
  schemaItemPatch,
  schemaItemPost,
} from './itemSchema'
import {
  errorMessages,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors'
import Item from '../entities/Item'
import { getCurrentUser } from '../decorator/currentUser'
import { getFilterExpressions } from '../utils/requestFilter'
import { filterItems } from '../utils/requestOrder'
import { getRequestContinuation } from '../utils/requestContinuation'

const indexPath = '/item/:name'
const idPath = [indexPath, ':id'].join('/')

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get(
    indexPath,
    schemaItemsGet,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        // TODO: message: 'no user'
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { name } = request.params as Record<string, string>

      const filterExpressions = getFilterExpressions(request)
      const continuation = getRequestContinuation(request)

      if (name === '') {
        throw NotFoundError({ message: errorMessages.attrIsEmpty('name') })
      }

      const item = new Item(name)
      const queryResult = await item.queryBy({
        indexNameSuffix: 'by-user-id-and-name',
        conditions: [
          {
            attrName: 'user_id',
            attrValue: currentUser.identifier,
            condition: '=',
          },
          {
            attrName: 'name',
            attrValue: name,
            condition: '=',
          },
        ],
        filterExpressions:
          filterExpressions.length > 0 ? filterExpressions : undefined,
        continuation,
      })

      const sanisanitizedResults = queryResult.items
        ? filterItems(request, queryResult.items).map((result) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { user_id, ...sanisanitizedResult } = result
            return sanisanitizedResult
          })
        : []

      const responsePayload: IndexPathResponseType = {
        results: sanisanitizedResults,
      }
      if (queryResult.continuation) {
        responsePayload.continuation = queryResult.continuation
      }

      return reply.send(responsePayload)
    },
  )

  fastify.get(
    idPath,
    schemaItemGet,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { id, name } = request.params as Record<string, string>

      const item = new Item(name)

      const result = await item.get({ keys: { id } })
      if (!result) {
        throw NotFoundError({ message: errorMessages.notFound })
      }

      if (result.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: errorMessages.forbidden })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...sanisanitizedResult } = result

      return reply.send(sanisanitizedResult)
    },
  )

  fastify.post(
    indexPath,
    schemaItemPost,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { name } = request.params as Record<string, string>
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const body = request.body as Record<string, any>

      const item = new Item(name)
      const result = await item.create({
        attrs: {
          ...body,
          name,
          user_id: currentUser.identifier,
        },
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...sanisanitizedResult } = result

      reply.statusCode = 201

      return reply.send(sanisanitizedResult)
    },
  )

  fastify.patch(
    idPath,
    schemaItemPatch,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { name, id } = request.params as Record<string, string>
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const body = request.body as Record<string, any>

      const item = new Item(name)

      const itemCheck = await item.get({ keys: { id } })
      if (!itemCheck) {
        throw NotFoundError({ message: errorMessages.notFound })
      }
      if (itemCheck.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: errorMessages.forbidden })
      }

      const result = await item.update({
        keys: { id },
        attrs: {
          ...body,
          name: name,
        },
      })

      if (!result) {
        throw NotFoundError({ message: errorMessages.notFound })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...sanisanitizedResult } = result

      return reply.send(sanisanitizedResult)
    },
  )

  fastify.delete(
    idPath,
    schemaItemDelete,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: errorMessages.unauthorized })
      }

      const { id, name } = request.params as Record<string, string>

      const item = new Item(name)

      const itemCheck = await item.get({ keys: { id } })
      if (!itemCheck) {
        throw NotFoundError({ message: errorMessages.notFound })
      }
      if (itemCheck.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: errorMessages.forbidden })
      }

      const result = await item.delete({ keys: { id } })

      if (!result) {
        throw NotFoundError({ message: errorMessages.notFound })
      }

      reply.statusCode = 204

      return reply.send({})
    },
  )
}

export default routes
