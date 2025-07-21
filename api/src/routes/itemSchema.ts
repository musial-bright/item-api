import { RouteShorthandOptions } from 'fastify'

const ItemParams = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    id: {
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
    id: {
      type: 'string',
    },
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
    created_at_iso: {
      type: 'string',
    },
    updated_at_iso: {
      type: 'string',
    },
  },
  required: ['id', 'name'],
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
    querystring: {
      type: 'object',
      properties: {
        _continuation: {
          type: 'string',
          description:
            'Optional continuation token for pagination, e.g. "_continuation=eyJrZXkiOiJ2YWx1ZSJ9"',
        },
        _order: {
          type: 'string',
          description: 'Optional order by field, e.g. "_order=title.asc"',
        },
      },
    },
    response: {
      '2xx': {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: schemaItem,
          },
          continuation: {
            type: 'string',
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
