import { CreateTableCommand } from '@aws-sdk/client-dynamodb'

import { readCloudFromation } from '../readCloudFromation'
import { tableNames } from '../config'
import { dynamoClient } from './createTables'

export const createItemTable = async () => {
  console.log('create table "item" ...')

  const tableCF = readCloudFromation({
    tableResoruceName: 'DynamoDBItems',
    mapping: {
      TableName: tableNames.item,
      GlobalSecondaryIndexes: {
        IndexNames: {
          '${FunctionName}-${Environment}-item-by-name': `${tableNames.item}-item-by-name`,
          '${FunctionName}-${Environment}-item-by-user-id': `${tableNames.item}-item-by-user-id`,
          '${FunctionName}-${Environment}-item-by-user-id-and-name': `${tableNames.item}-item-by-user-id-and-name`,
        },
      },
    },
  })
  const command = new CreateTableCommand(tableCF)

  const response = await dynamoClient().send(command)
  console.log(response)
  console.log('...done')
  return response
}
