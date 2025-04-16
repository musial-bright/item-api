import { v4 as uuidv4 } from 'uuid'

import { ItemType, ResourceAttributesType } from './types'
import GenericResource from './GenericResource'

class Item extends GenericResource {
  name: string

  constructor(name: string) {
    super('item')

    this.name = name
  }

  async create({ attrs }: { attrs: ItemType }) {
    return super.create({
      attrs: {
        ...attrs,
        id: uuidv4(),
      },
    })
  }

  async update({
    keys,
    attrs,
  }: {
    keys: ResourceAttributesType
    attrs: ItemType
  }) {
    const id = keys.id as string

    return super.update({
      keys: { id },
      attrs: {
        ...attrs,
        id: id,
      },
    })
  }

  async delete({ keys }: { keys: ResourceAttributesType }): Promise<boolean> {
    const id = keys.id as string

    return super.delete({ keys: { id } })
  }
}

export default Item
