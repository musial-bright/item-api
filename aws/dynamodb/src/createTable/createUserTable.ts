import { CreateTableCommand } from '@aws-sdk/client-dynamodb'

import { tableNames } from '../config'
import { dynamoClient } from './createTables'

export const createUserTable = async () => {
  console.log('create table "user" ...')
  const command = new CreateTableCommand({
    TableName: tableNames.user,
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
      {
        AttributeName: 'email',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: `${tableNames.user}-by-email`,
        KeySchema: [
          {
            AttributeName: 'email',
            KeyType: 'HASH',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    BillingMode: 'PROVISIONED', // or 'PAY_PER_REQUEST'
  })

  const response = await dynamoClient().send(command)
  console.log(response)
  console.log('...done')
  return response
}
