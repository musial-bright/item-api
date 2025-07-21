import { CreateTableCommand } from '@aws-sdk/client-dynamodb'
import readline from 'node:readline'

import { dynamoClient } from './createTables'

export const createTable = (
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  tableCF: any,
  resolve: (value: unknown) => void,
) => {
  console.log('createServiceTable ...')
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
    // return result
    resolve(result)
  })
}
