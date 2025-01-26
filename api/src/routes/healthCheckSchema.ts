import { RouteShorthandOptions } from 'fastify'

const schema: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: {
            type: 'object',
            properties: {
              access: {
                type: 'string',
              },
              iam: {
                type: 'string',
              },
            },
          },
          version: {
            type: 'string',
          },
          date: {
            type: 'string',
          },
        },
      },
    },
  },
}

export default schema
