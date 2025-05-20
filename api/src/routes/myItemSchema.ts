import { RouteShorthandOptions } from 'fastify'

const ItemParams = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
}

const ItemsParams = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
}

const schemaItem = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    user_id: {
      type: 'string',
    },
    created_at: {
      type: 'number',
    },
    updated_at: {
      type: 'number',
    },
  },
  required: ['name'],
  additionalProperties: true,
}

export const schemaItemGet: RouteShorthandOptions = {
  schema: {
    params: ItemParams,
    response: {
      '2xx': schemaItem,
    },
  },
}

export const schemaItemsGet: RouteShorthandOptions = {
  schema: {
    params: ItemsParams,
    response: {
      '2xx': {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: schemaItem,
          },
        },
      },
    },
  },
}

export const schemaItemPost: RouteShorthandOptions = {
  schema: {
    params: ItemsParams,
    response: {
      '2xx': schemaItem,
    },
  },
}

export const schemaItemPatch: RouteShorthandOptions = {
  schema: {
    params: ItemParams,
    response: {
      '2xx': schemaItem,
    },
  },
}

export const schemaItemPut: RouteShorthandOptions = {
  schema: {
    params: ItemParams,
    response: {
      '2xx': schemaItem,
    },
  },
}

export const schemaItemDelete: RouteShorthandOptions = {
  schema: {
    params: ItemParams,
    response: {
      '2xx': {},
    },
  },
}
