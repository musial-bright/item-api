import { FastifyRequest } from 'fastify'

export const getRequestContinuation = (
  request: FastifyRequest,
): string | undefined => {
  const query = request.query as Record<string, string | string[]>

  const continuationRaw = query._continuation
  const continuation = Array.isArray(continuationRaw)
    ? continuationRaw[0]
    : continuationRaw

  return continuation
}
