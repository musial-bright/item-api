import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { endpoint } from '../config'
import { createItemTable } from './createItemTable'
import { createUserTable } from './createUserTable'

export const dynamoClient = () => {
  return new DynamoDBClient({
    endpoint: endpoint,
  })
}

export const createTables = async () => {
  await createItemTable()
  await createUserTable()
}
