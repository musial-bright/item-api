import { tableNames } from '../config'
import { readCloudFormation } from '../readCloudFormation'
import { createTable } from './createTable'

const Defaults = {
  tableName: tableNames.service,
}

export const createServiceTable = async () => {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  return new Promise((resolve, reject) => {
    console.log('createServiceTable ...')

    const tableCF = readCloudFormation({
      tableResourceName: 'DynamoDBService',
      mapping: {
        TableName: Defaults.tableName,
      },
    })

    createTable(tableCF, resolve)
  })
}
