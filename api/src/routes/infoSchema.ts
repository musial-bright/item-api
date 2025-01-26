import { RouteShorthandOptions } from 'fastify'

const schema: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          info: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              version: {
                type: 'string',
              },
              copyright: {
                type: 'string',
              },
              date: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
}

export default schema
