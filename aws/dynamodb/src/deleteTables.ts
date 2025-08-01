import { DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { endpoint, tableNames } from './config'

const client = new DynamoDBClient({
  endpoint: endpoint,
  credentials: {
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
  },
})

export const deleteItemTable = async (name: string) => {
  console.log(`Delete table "${name}" ...`)
  const command = new DeleteTableCommand({
    TableName: name,
  })

  const response = await client.send(command)
  console.log(response)
  console.log(`... Delete table "${name}" done.`)
  return response
}

export const deleteTables = async () => {
  await deleteItemTable(tableNames.item)
}
