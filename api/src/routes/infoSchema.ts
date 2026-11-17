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
              changelog: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    version: {
                      type: 'string',
                    },
                    features: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: {
                            type: 'string',
                          },
                          description: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export default schema
