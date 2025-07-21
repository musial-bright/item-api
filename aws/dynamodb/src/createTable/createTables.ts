import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { endpoint } from '../config'
import { createItemTable } from './createItemTable'

export const dynamoClient = () => {
  return new DynamoDBClient({
    endpoint: endpoint,
    credentials: {
      accessKeyId: 'fake',
      secretAccessKey: 'fake',
    },
  })
}

export const createTables = async () => {
  console.log('createTables() ...')
  await createItemTable()
  console.log('...createTables() done.')
}
