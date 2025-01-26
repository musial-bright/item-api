import awsLambdaFastify from '@fastify/aws-lambda'
import service from './service'

export const handler = awsLambdaFastify(service)
// await service.ready() // might be helpful on AWS lambda
