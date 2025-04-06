import { v4 as uuidv4 } from 'uuid'

import { ResourceType } from '../../entities/types'
import { tableIndexName, tableName } from '../../utils/tableName'
import { IndexQueryCondition } from '../../utils/dynamoDbHelper'
import { allEqual } from '../../utils/languageTools'

export type ResourceTypeMock = {
  id: string
  name: string
  content?: ResourceType
  user_id?: string
}

export type TablesType = {
  tableNameSuffix: string
  indexNameSuffix: string
  tableName: string
  indexName: string
  items: ResourceTypeMock[]
}

class ResourceMock {
  table: TablesType

  constructor({
    tableNameSuffix,
    indexNameSuffix,
    items,
  }: {
    tableNameSuffix: string
    indexNameSuffix: string
    items: ResourceTypeMock[]
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
  }: {
    indexNameSuffix: string
    conditions: IndexQueryCondition[]
  }) {
    if (conditions.length < 1 || conditions.length > 2) {
      return []
    }

    if (indexNameSuffix === 'by-name') {
      return this.table.items.filter((item) => {
        return item.name === conditions[0].attrValue
      })
    } else if (indexNameSuffix === 'by-user-id') {
      return this.table.items.filter((item) => {
        return item.user_id === conditions[0].attrValue
      })
    } else if (indexNameSuffix === 'by-user-id-and-name') {
      return this.table.items.filter((item) => {
        const searchResults: boolean[] = []
        conditions.forEach((condition) => {
          if (condition.attrName === 'user_id') {
            searchResults.push(item[condition.attrName] === condition.attrValue)
          }

          if (condition.attrName === 'name') {
            searchResults.push(item[condition.attrName] === condition.attrValue)
          }
        })

        return allEqual(searchResults)
      })
    }

    return []
  }

  async get({ id }: { id: string }): Promise<ResourceTypeMock | undefined> {
    return this.table.items.find((item) => item.id === id)
  }

  async create({ attrs }: { attrs: ResourceType }) {
    const { name, content, user_id } = attrs

    const item: ResourceTypeMock = {
      id: uuidv4(),
      name,
      content,
      user_id,
    }
    this.table.items.push(item)

    return item
  }

  async update({ id, attrs }: { id: string; attrs: ResourceType }) {
    const index = this.table.items.findIndex((item) => item.id === id)
    if (index === -1) {
      return
    }

    const existingItem = this.table.items[index]

    const updatedItem = {
      ...existingItem,
      content: attrs.content,
      id: existingItem.id,
    }
    this.table.items[index] = { ...updatedItem }

    return updatedItem
  }

  async delete({ id }: { id: string }) {
    const index = this.table.items.findIndex((i) => i.id === id)
    if (index === -1) {
      return false
    }

    this.table.items.splice(index, 1)

    return true
  }
}

export default ResourceMock
