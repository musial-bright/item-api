import { v4 as uuidv4 } from 'uuid'

import { ResourceType } from '../../entities/types'

export type ResourceTypeMock = {
  id: string
  name: string
  content?: ResourceType
}

export type TablesType = Array<{
  tableNameSuffix: string
  indexNameSuffix: string
  tableName: string
  indexName: string
  items: ResourceTypeMock[]
}>

class ResourceMock {
  tables: TablesType

  constructor(tables: TablesType) {
    this.tables = tables
  }

  async queryBy({
    indexNameSuffix,
    attributeName,
    attributeValue,
    condition,
  }: {
    indexNameSuffix: string
    attributeName: string
    attributeValue: string
    condition: string
  }) {
    const _unused = [attributeName, attributeValue, condition]
    const table = this.tables.filter(
      (t) => t.indexNameSuffix === indexNameSuffix,
    )[0]
    if (!table) {
      return []
    }

    return table.items
  }

  async get({ id }: { id: string }): Promise<ResourceTypeMock | undefined> {
    let allItems: ResourceTypeMock[] = []
    this.tables.forEach((table) => {
      allItems = [...allItems, ...table.items]
    })

    return allItems.filter((i) => i.id === id)[0]
  }

  async create({ attrs }: { attrs: ResourceType }) {
    const name = attrs.name as string
    const item: ResourceTypeMock = {
      id: uuidv4(),
      content: attrs.content,
      name,
    }

    this.tables.forEach((t) => {
      if (t.tableNameSuffix === name) {
        t.items.push(item)
      }
    })

    return item
  }

  async update({ id, attrs }: { id: string; attrs: ResourceType }) {
    const name = attrs.name as string
    let updatedItem: ResourceTypeMock | undefined

    this.tables.forEach((t) => {
      if (t.tableNameSuffix === name) {
        t.items = t.items.map((i): ResourceTypeMock => {
          if (i.id === id) {
            updatedItem = {
              ...i,
              content: attrs.content,
            }
            return updatedItem
          } else {
            return i
          }
        })
      }
    })

    return updatedItem
  }

  async delete({ id }: { id: string }) {
    let deletedItem = false

    this.tables.map((t) => {
      const index = t.items.findIndex((i) => i.id === id)
      if (index >= 0) {
        t.items.splice(index, 1)
        deletedItem = true
      }

      return t
    })

    return deletedItem
  }
}

export default ResourceMock
