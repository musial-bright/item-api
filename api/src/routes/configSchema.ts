import { RouteShorthandOptions } from 'fastify'

const configResponseSchema = {
  type: 'object',
  properties: {
    itemLimits: {
      type: 'object',
      properties: {
        maxItemsPerUser: {
          type: 'number',
        },
      },
    },
  },
}

export const schemaConfigGet: RouteShorthandOptions = {
  schema: {
    response: {
      '2xx': configResponseSchema,
    },
  },
}

export const schemaConfigPatch: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      properties: {
        itemLimits: {
          type: 'object',
          properties: {
            maxItemsPerUser: {
              type: 'number',
              minimum: 1,
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    response: {
      '2xx': configResponseSchema,
    },
  },
}
