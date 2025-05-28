import { v4 as uuidv4 } from 'uuid'

import { ResourceAttributesType } from './types'
import GenericResource from './GenericResource'

class Item extends GenericResource {
  name: string

  constructor(name: string) {
    super('item')

    this.name = name
  }

  async get({
    keys,
  }: {
    keys: ResourceAttributesType
  }): Promise<ResourceAttributesType | undefined> {
    const item = await super.get({ keys })

    if (item && item.name !== this.name) {
      return undefined
    }

    return item
  }

  async create({ attrs }: { attrs: ResourceAttributesType }) {
    return super.create({
      attrs: {
        ...attrs,
        id: uuidv4(),
        name: this.name,
      },
    })
  }

  async update({
    keys,
    attrs,
  }: {
    keys: ResourceAttributesType
    attrs: ResourceAttributesType
  }) {
    const id = keys.id as string

    return super.update({
      keys: { id },
      attrs: {
        ...attrs,
        id: id,
        name: this.name,
      },
    })
  }

  async delete({ keys }: { keys: ResourceAttributesType }): Promise<boolean> {
    const id = keys.id as string

    return super.delete({ keys: { id } })
  }
}

export default Item
