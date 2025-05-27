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

export const readCloudFormation = ({
  tableResourceName,
  mapping,
}: {
  tableResourceName: string
  mapping: Mapping
}) => {
  const filePath = path.resolve(
    path.resolve('.'),
    '../cloud-formation/item-api-cf.yaml',
  )
  const doc = yaml.load(fs.readFileSync(filePath, 'utf8')) as CFDynamoDbType

  const itemsTable = doc.Resources[tableResourceName].Properties

  return mapper(itemsTable, mapping)
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const mapper = (itemsTable: any, mapping: Mapping) => {
  if (mapping.TableName) {
    itemsTable.TableName = mapping.TableName
  }

  if (mapping.GlobalSecondaryIndexes) {
    const updatedGlobalIndexes =
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      (itemsTable.GlobalSecondaryIndexes as any[]).map((index: any) => {
        const mappedIndexName =
          mapping.GlobalSecondaryIndexes?.IndexNames[index.IndexName['Fn::Sub']]
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
