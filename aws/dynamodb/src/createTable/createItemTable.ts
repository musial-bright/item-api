import { CreateTableCommand } from '@aws-sdk/client-dynamodb'

import { tableNames } from '../config'
import { dynamoClient } from './createTables'

export const createItemTable = async () => {
  console.log('create table "item" ...')
  const command = new CreateTableCommand({
    TableName: tableNames.item,
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
      {
        AttributeName: 'name',
        AttributeType: 'S',
      },
      {
        AttributeName: 'user_id',
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
        IndexName: `${tableNames.item}-by-name`,
        KeySchema: [
          {
            AttributeName: 'name',
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
      {
        IndexName: `${tableNames.item}-by-user-id`,
        KeySchema: [
          {
            AttributeName: 'user_id',
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
      {
        IndexName: `${tableNames.item}-by-user-id-and-name`,
        KeySchema: [
          {
            AttributeName: 'user_id',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'name',
            KeyType: 'RANGE',
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
