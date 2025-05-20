import createError from 'http-errors'

export const errorMessages = {
  attrIsEmpty: (attr: string) => `'${attr}' is empty`,
  forbidden: 'forbidden',
  notFound: 'not found',
  noUser: 'no user',
  unauthorized: 'unauthorized',
  missingPermission: (permission: string) =>
    `missing permission '${permission}'`,
}

export const NotFoundError = ({ message }: { message?: string | object }) => {
  // CloudFront error pages will override 404
  if (message) {
    return createError(422, 'Not Found', { message })
  } else {
    return createError(422, 'Not Found')
  }
}

export const UnprocessableContentError = ({
  message,
}: {
  message?: string | object
}) => {
  if (message) {
    return createError(422, 'Unprocessable Content', { message })
  } else {
    return createError(422, 'Unprocessable Content')
  }
}

export const UnauthorizedError = ({
  message,
}: {
  message?: string | object
}) => {
  if (message) {
    return createError(401, 'Unauthorized', { message })
  } else {
    return createError(401, 'Unauthorized')
  }
}

export const ForbiddenError = ({ message }: { message: string | object }) => {
  // CloudFront error pages will override 403
  return createError(422, 'Forbidden', { message })
}

export const InternalServerError = ({
  message,
}: {
  message: string | object
}) => {
  return createError(500, 'InternalServerError', { message })
}
