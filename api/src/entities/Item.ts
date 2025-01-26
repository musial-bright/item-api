import { ItemType } from './types'
import Resource from './Resource'

class Item extends Resource {
  name: string

  constructor(name: string) {
    super('item')

    this.name = name
  }

  async create({ attrs }: { attrs: ItemType }) {
    return super.create({
      attrs: {
        ...attrs,
      },
    })
  }

  async update({ id, attrs }: { id: string; attrs: ItemType }) {
    return super.update({
      id,
      attrs: {
        ...attrs,
      },
    })
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    return super.delete({ id })
  }
}

export default Item
