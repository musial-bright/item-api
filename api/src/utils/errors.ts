import createError from 'http-errors'

export const NotFoundError = () => {
  return createError(404, 'Not Found')
}

export const UnprocessableContentError = () => {
  return createError(422, 'Unprocessable Content')
}

export const UnauthorizedError = () => {
  return createError(401, 'Unauthorized')
}
