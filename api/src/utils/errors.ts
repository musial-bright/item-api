import createError from 'http-errors'

export const NotFoundError = ({ message }: { message?: string }) => {
  // CloudFront error pages will override 404
  if (message) {
    return createError(404, 'Not Found', { message })
  } else {
    return createError(404, 'Not Found')
  }
}

export const UnprocessableContentError = ({
  message,
}: {
  message?: string
}) => {
  if (message) {
    return createError(422, 'Unprocessable Content', { message })
  } else {
    return createError(422, 'Unprocessable Content')
  }
}

export const UnauthorizedError = ({ message }: { message?: string }) => {
  if (message) {
    return createError(401, 'Unauthorized', { message })
  } else {
    return createError(401, 'Unauthorized')
  }
}

export const ForbiddenError = ({ message }: { message: string }) => {
  // CloudFront error pages will override 403
  return createError(403, 'Forbidden', { message })
}

export const InternalServerError = ({ message }: { message: string }) => {
  return createError(500, 'InternalServerError', { message })
}

// Scrivito + Lambda Function URL + CloudFront version:

// export const NotFoundError = ({ message }: { message?: string }) => {
//   // CloudFront error pages will override 404
//   if (message) {
//     return createError(422, 'Not Found', { message })
//   } else {
//     return createError(422, 'Not Found')
//   }
// }

// export const UnprocessableContentError = ({
//   message,
// }: {
//   message?: string
// }) => {
//   if (message) {
//     return createError(422, 'Unprocessable Content', { message })
//   } else {
//     return createError(422, 'Unprocessable Content')
//   }
// }

// export const UnauthorizedError = ({ message }: { message?: string }) => {
//   if (message) {
//     return createError(401, 'Unauthorized', { message })
//   } else {
//     return createError(401, 'Unauthorized')
//   }
// }

// export const ForbiddenError = ({ message }: { message: string }) => {
//   // CloudFront error pages will override 403
//   return createError(422, 'Forbidden', { message })
// }

// export const InternalServerError = ({ message }: { message: string }) => {
//   return createError(500, 'InternalServerError', { message })
// }
