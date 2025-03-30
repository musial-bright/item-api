import createError from 'http-errors'

export const NotFoundError = () => {
  return createError(404, 'Not Found')
}

export const UnprocessableContentError = () => {
  return createError(422, 'Unprocessable Content')
}

export const UnauthorizedError = ({ message }: { message: string }) => {
  return createError(401, 'Unauthorized', { message })
}

export const InternalServerError = ({ message }: { message: string }) => {
  return createError(500, 'InternalServerError', { message })
}
