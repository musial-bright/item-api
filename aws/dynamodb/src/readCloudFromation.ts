import path from 'path'
import fs from 'fs-extra'
import yaml from 'js-yaml'

type CFDynamoDbType = {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  Parameters: any
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  Resources: any
}

export type Mapping = {
  TableName?: string
  GlobalSecondaryIndexes?: {
    IndexNames: Record<string, string>
  }
}

export const readCloudFromation = ({ tableResoruceName, mapping }: { tableResoruceName: string; mapping: Mapping }) => {
  const filePath = path.resolve(path.resolve('.'), '../cloud-formation/item-api-cf.yaml')
  const doc = yaml.load(fs.readFileSync(filePath, 'utf8')) as CFDynamoDbType

  const itemsTable = doc.Resources[tableResoruceName].Properties

  return mapper(itemsTable, mapping)
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const mapper = (itemsTable: any, mapping: Mapping) => {
  if (mapping.TableName) {
    itemsTable.TableName = mapping.TableName
  }

  if (mapping.GlobalSecondaryIndexes) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const updatedGlobalIndexes = (itemsTable.GlobalSecondaryIndexes as any[]).map((index: any) => {
      const mappedIndexName = mapping.GlobalSecondaryIndexes?.IndexNames[index.IndexName['Fn::Sub']]
      if (mappedIndexName) {
        return {
          ...index,
          IndexName: mappedIndexName,
        }
      }

      return index
    })

    itemsTable.GlobalSecondaryIndexes = updatedGlobalIndexes
  }

  return itemsTable
}
