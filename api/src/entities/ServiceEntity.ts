import GenericResource from './GenericResource'
import { QueryByResultType, QueryByType } from './types'

class ServiceEntity extends GenericResource {
  constructor() {
    super('service')
  }

  async queryBy({
    indexNameSuffix,
    conditions,
    filterExpressions,
    continuation,
  }: QueryByType): Promise<QueryByResultType> {
    console.error(
      'Service queryBy not supported. Requested ' +
        [indexNameSuffix, conditions, filterExpressions, continuation].join(
          ' ',
        ),
    )

    return {
      items: [],
    }
  }
}

export default ServiceEntity
