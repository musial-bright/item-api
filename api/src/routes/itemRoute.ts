import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { schemaGet, schemaGetAll, schemaPatch, schemaPost } from './itemSchema'
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors'
import { ResourceType } from '../entities/types'
import Item from '../entities/Item'
import { getCurrentUser } from '../decorator/currentUser'

const indexPath = '/item/:name'
const idPath = [indexPath, ':id'].join('/')

type BodyType = { content: ResourceType }

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.get(
    indexPath,
    schemaGetAll,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: 'unauthorized' })
      }

      const { name } = request.params as Record<string, string>

      if (name === '') {
        throw NotFoundError()
      }

      const item = new Item(name)
      const result = await item.queryBy({
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
      })

      return reply.send(result)
    },
  )

  fastify.get(
    idPath,
    schemaGet,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: 'unauthorized' })
      }

      const { id, name } = request.params as Record<string, string>

      const item = new Item(name)

      const result = await item.get({ id })
      if (!result) {
        throw NotFoundError()
      }

      if (result.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: 'item forbidden' })
      }

      return reply.send(result)
    },
  )

  fastify.post(
    indexPath,
    schemaPost,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: 'unauthorized' })
      }

      const { name } = request.params as Record<string, string>
      const { content } = request.body as BodyType

      const item = new Item(name)
      const result = await item.create({
        attrs: {
          name: name,
          content: content,
          user_id: currentUser.identifier,
        },
      })

      reply.statusCode = 201

      return reply.send(result)
    },
  )

  fastify.patch(
    idPath,
    schemaPatch,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: 'unauthorized' })
      }

      const { name, id } = request.params as Record<string, string>
      const { content } = request.body as BodyType

      const item = new Item(name)

      const itemCheck = await item.get({ id })
      if (!itemCheck) {
        throw NotFoundError()
      }
      if (itemCheck.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: 'item forbidden' })
      }

      const result = await item.update({
        id,
        attrs: {
          name: name,
          content: content,
        },
      })

      if (!result) {
        throw NotFoundError()
      }

      return reply.send(result)
    },
  )

  fastify.delete(
    idPath,
    schemaGet,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })
      if (!currentUser || !currentUser.identifier) {
        throw UnauthorizedError({ message: 'unauthorized' })
      }

      const { id, name } = request.params as Record<string, string>

      const item = new Item(name)

      const itemCheck = await item.get({ id })
      if (!itemCheck) {
        throw NotFoundError()
      }
      if (itemCheck.user_id !== currentUser.identifier) {
        throw ForbiddenError({ message: 'item forbidden' })
      }

      const result = await item.delete({ id })

      if (!result) {
        throw NotFoundError()
      }

      reply.statusCode = 204

      return reply.send(undefined)
    },
  )
}

export default routes
