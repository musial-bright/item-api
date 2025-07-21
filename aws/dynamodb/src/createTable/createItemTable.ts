import { tableNames } from '../config'
import { readCloudFormation } from '../readCloudFormation'
import { createTable } from './createTable'

const Defaults = {
  tableName: tableNames.item,
  indexPrefix: tableNames.item,
}

export const createItemTable = async () => {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  return new Promise((resolve, reject) => {
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

    createTable(tableCF, resolve)
  })
}

