import {
  QueryByResultType,
  QueryByType,
  ResourceAttributesType,
  ResourceType,
} from '../../entities/types'
import { tableIndexName, tableName } from '../../utils/tableName'
import { AttrValueType } from '../../utils/dynamoDbHelper'
import { getValidDate } from '../../utils/languageTools'

const convertValue = (value: AttrValueType): string | number | Date => {
  let convertedValue: string | number | Date = value
  if (typeof value === 'string') {
    const validDate = getValidDate(value)
    if (validDate) {
      convertedValue = validDate
    }
  }

  return convertedValue
}

export type TablesType = {
  tableNameSuffix: string
  indexNameSuffix: string
  tableName: string
  indexName: string
  items: ResourceType[]
}

class GenericResourceMock {
  table: TablesType

  constructor({
    tableNameSuffix,
    indexNameSuffix,
    items,
  }: {
    tableNameSuffix: string
    indexNameSuffix: string
    items: ResourceType[]
  }) {
    this.table = {
      tableName: tableName({ tableNameSuffix: tableNameSuffix }),
      tableNameSuffix: tableNameSuffix,
      indexName: tableIndexName({
        tableNameSuffix: tableNameSuffix,
        indexNameSuffix: indexNameSuffix,
      }),
      indexNameSuffix: indexNameSuffix,
      items,
    }
  }

  async queryBy({
    indexNameSuffix,
    conditions,
    filterExpressions,
  }: QueryByType): Promise<QueryByResultType> {
    if (conditions.length < 1 || conditions.length > 2) {
      return { items: [] }
    }

    let results: ResourceType[] = []

    if (indexNameSuffix === 'by-name') {
      results = this.table.items.filter((item) => {
        return item.name === conditions[0].attrValue
      })
    } else if (indexNameSuffix === 'by-user-id') {
      results = this.table.items.filter((item) => {
        return item.user_id === conditions[0].attrValue
      })
    } else if (indexNameSuffix === 'by-user-id-and-name') {
      results = this.table.items.filter((item) => {
        const searchResults: boolean[] = []
        conditions.forEach((condition) => {
          if (condition.attrName === 'user_id') {
            searchResults.push(item[condition.attrName] === condition.attrValue)
          }

          if (condition.attrName === 'name') {
            searchResults.push(item[condition.attrName] === condition.attrValue)
          }
        })

        return searchResults.every((element) => element === true)
      })
    }

    for (const filterExpression of filterExpressions || []) {
      const attrValue = convertValue(filterExpression.attrValue)

      if (filterExpression.condition === '>') {
        results = results.filter((item) => {
          const itemValue = convertValue(item[filterExpression.attrName])
          return itemValue > attrValue
        })
      } else if (filterExpression.condition === '>=') {
        results = results.filter((item) => {
          const itemValue = convertValue(item[filterExpression.attrName])
          return itemValue >= attrValue
        })
      } else if (filterExpression.condition === '<') {
        results = results.filter((item) => {
          const itemValue = convertValue(item[filterExpression.attrName])
          return itemValue < attrValue
        })
      } else if (filterExpression.condition === '<=') {
        results = results.filter((item) => {
          const itemValue = convertValue(item[filterExpression.attrName])
          return itemValue <= attrValue
        })
      } else if (filterExpression.condition === '=') {
        results = results.filter((item) => {
          const itemValue = convertValue(item[filterExpression.attrName])
          return itemValue === attrValue
        })
      }
    }

    return {
      items: results,
    }
  }

  async get({
    keys,
  }: {
    keys: ResourceAttributesType
  }): Promise<ResourceAttributesType | undefined> {
    return this.table.items.find((item) => {
      const searchResults: boolean[] = []
      Object.keys(keys).forEach((key) => {
        searchResults.push(item[key] === keys[key])
      })

      return searchResults.every((element) => element === true)
    })
  }

  async create({
    attrs,
  }: {
    attrs: ResourceAttributesType
  }): Promise<ResourceAttributesType> {
    const id = attrs.id as string
    if (id) {
      const existingItem = await this.get({ keys: { id } })
      if (existingItem) {
        return existingItem
      }
    }

    const createdAt = new Date()
    const item: ResourceType = {
      ...attrs,
      created_at: createdAt.getTime(),
      updated_at: createdAt.getTime(),
      created_at_iso: createdAt.toISOString(),
      updated_at_iso: createdAt.toISOString(),
    }

    this.table.items.push(item)

    return item
  }

  async update({
    keys,
    attrs,
  }: {
    keys: ResourceAttributesType
    attrs: ResourceAttributesType
  }): Promise<ResourceAttributesType | undefined> {
    const index = this.table.items.findIndex((item) => {
      const searchResults: boolean[] = []
      Object.keys(keys).forEach((key) => {
        searchResults.push(item[key] === keys[key])
      })

      return searchResults.every((element) => element === true)
    })
    if (index === -1) {
      return
    }

    const existingItem = this.table.items[index]

    const updatedAt = new Date()
    const updatedItem = {
      ...existingItem,
      ...attrs,
      updated_at: updatedAt.getTime(),
      updated_at_iso: updatedAt.toISOString(),
    }
    this.table.items[index] = { ...updatedItem }

    return updatedItem
  }

  async delete({ keys }: { keys: ResourceAttributesType }): Promise<boolean> {
    const index = this.table.items.findIndex((item) => {
      const searchResults: boolean[] = []
      Object.keys(keys).forEach((key) => {
        searchResults.push(item[key] === keys[key])
      })

      return searchResults.every((element) => element === true)
    })
    if (index === -1) {
      return false
    }

    this.table.items.splice(index, 1)

    return true
  }
}

export default GenericResourceMock
