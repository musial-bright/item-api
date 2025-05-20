import { ResourceAttributesType } from './types'
import GenericResource from './GenericResource'

export const IdPartSeparator = '--'

class MyItem extends GenericResource {
  userId: string
  name: string

  constructor(userId: string, name: string) {
    super('item')

    this.userId = userId
    this.name = name
  }

  async get(): Promise<ResourceAttributesType | undefined> {
    return super.get({
      keys: {
        id: [this.userId, this.name].join(IdPartSeparator),
      },
    })
  }

  async create({ attrs }: { attrs: ResourceAttributesType }) {
    const id = [this.userId, this.name].join(IdPartSeparator)
    const name = this.name
    const user_id = this.userId

    return super.create({
      attrs: {
        ...attrs,
        id,
        name,
        user_id,
      },
    })
  }

  async update({ attrs }: { attrs: ResourceAttributesType }) {
    const id = [this.userId, this.name].join(IdPartSeparator)
    const name = this.name
    const user_id = this.userId

    return super.update({
      keys: { id },
      attrs: {
        ...attrs,
        id,
        name,
        user_id,
      },
    })
  }

  async delete(): Promise<boolean> {
    const id = [this.userId, this.name].join(IdPartSeparator)

    return super.delete({ keys: { id } })
  }
}

export default MyItem
