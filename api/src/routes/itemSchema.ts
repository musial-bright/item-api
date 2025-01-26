import { RouteShorthandOptions } from 'fastify'

const schemaContent = {
  type: 'object',
  description: 'Universal content of objects',
  additionalProperties: true,
}

const schemaItem = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    content: schemaContent,
    createdAt: {
      type: 'number',
    },
    updatedAt: {
      type: 'number',
    },
  },
  required: ['id', 'name'],
}

export const schemaGet: RouteShorthandOptions = {
  schema: {
    response: {
      '2xx': {
        type: 'object',
        properties: schemaItem.properties,
      },
    },
  },
}

export const schemaGetAll: RouteShorthandOptions = {
  schema: {
    response: {
      '2xx': {
        type: 'array',
        items: schemaItem,
      },
    },
  },
}

export const schemaPost: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      properties: {
        content: schemaItem.properties.content,
      },
      required: ['content'],
    },
    response: schemaGet.schema?.response,
  },
}
