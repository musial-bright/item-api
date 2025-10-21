import { RouteShorthandOptions } from 'fastify'

export const schemaPost: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
        },
        filename: {
          type: 'string',
        },
        content_type: {
          type: 'string',
        },
      },
      required: ['path', 'filename', 'content_type'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          download_file_url: {
            type: 'string',
          },
          upload_file_url: {
            type: 'string',
          },
          ttl: {
            type: 'number',
          },
        },
        required: ['upload_file_url', 'ttl'],
      },
    },
  },
}
