import { Context } from 'aws-lambda'
import awsLambdaFastify from '@fastify/aws-lambda'

import service from './service'

const proxy = awsLambdaFastify(service)

export const handler = (event: unknown, context: Context) =>
  proxy(event, context)
