import { CreateTableCommand } from '@aws-sdk/client-dynamodb'
import readline from 'node:readline'

import { tableNames } from '../config'
import { dynamoClient } from './createTables'
import { readCloudFormation } from '../readCloudFormation'

const Defaults = {
  tableName: tableNames.item,
  indexPrefix: tableNames.item,
}

export const createItemTable = async () => {
  console.log('createItemTable ...')

  const tableCF = readCloudFormation({
    tableResourceName: 'DynamoDBItems',
    mapping: {
      TableName: Defaults.tableName,
      GlobalSecondaryIndexes: {
        IndexNames: {
          '${FunctionName}-${Environment}-item-by-name': `${Defaults.indexPrefix}-by-name`,
          '${FunctionName}-${Environment}-item-by-user-id': `${Defaults.indexPrefix}-by-user-id`,
          '${FunctionName}-${Environment}-item-by-user-id-and-name': `${Defaults.indexPrefix}-by-user-id-and-name`,
        },
      },
    },
  })
  console.dir(tableCF, { depth: 10, colors: true })
  const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  readLine.question('Create this dynamodb table? [y/N]', async (answer) => {
    let result = undefined
    if (answer.toLowerCase() === 'y') {
      const command = new CreateTableCommand(tableCF)
      result = await dynamoClient().send(command)
      console.log('...creation done.')
    } else {
      console.log('...creation canceled.')
    }

    readLine.close()
    return result
  })
}
