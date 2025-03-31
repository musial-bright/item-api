import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { schemaGet, schemaGetAll, schemaPatch, schemaPost } from './itemSchema'
import { NotFoundError } from '../utils/errors'
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
      const { name } = request.params as Record<string, string>

      // TODO: const currentUser = getCurrentUser({ request })

      const item = new Item(name)
      const result = await item.queryBy({
        indexNameSuffix: 'by-name',
        attributeName: 'name',
        attributeValue: name,
        condition: '=',
      })

      // TODO: introduce filter for now

      return reply.send(result)
    },
  )

  fastify.get(
    idPath,
    schemaGet,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })

      const { id, name } = request.params as Record<string, string>

      const item = new Item(name)

      const result = await item.get({ id })
      if (!result) {
        throw NotFoundError()
      }

      return reply.send(result)
    },
  )

  fastify.post(
    indexPath,
    schemaPost,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const currentUser = getCurrentUser({ request })

      const { name } = request.params as Record<string, string>
      const { content } = request.body as BodyType

      const item = new Item(name)
      const result = await item.create({
        attrs: {
          name: name,
          content: content,
          user_id: currentUser?.identifier,
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

      const { name, id } = request.params as Record<string, string>
      const { content } = request.body as BodyType

      const item = new Item(name)
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

      const { id, name } = request.params as Record<string, string>

      const item = new Item(name)
      // TODO: provide user_id
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
