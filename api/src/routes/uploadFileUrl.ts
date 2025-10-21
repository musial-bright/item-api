import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { schemaPost } from './uploadFileUrlSchema'
import {
  generateSignedUploadUrl,
  GenerateSignedUploadUrlConfig,
} from '../service/S3FileService'

const indexPath = '/upload-file-url'

const publicReadPaths = ['email-download']

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const routes = async (fastify: FastifyInstance, _options: any) => {
  fastify.post(
    indexPath,
    schemaPost,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { path, filename, content_type } = request.body as Record<
        string,
        string
      >

      const options: GenerateSignedUploadUrlConfig = {
        publicRead: publicReadPaths.includes(path),
      }

      const { downloadUrl, uploadUrl, ttl } = await generateSignedUploadUrl({
        path,
        filename,
        contentType: content_type,
        options,
      })

      const result: {
        upload_file_url: string
        ttl: number
        download_file_url?: string
      } = {
        upload_file_url: uploadUrl,
        ttl,
      }

      if (downloadUrl) {
        result['download_file_url'] = downloadUrl
      }

      reply.send(result)
    },
  )
}

export default routes
