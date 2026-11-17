import { FastifyRequest } from 'fastify'
import { ResourceType } from '../entities/types'

export const orderItems = (request: FastifyRequest, items: ResourceType[]) => {
  const query = request.query as Record<string, string | string[]>
  const order = query._order
  if (!order) {
    return items
  }

  const sortOrder = Array.isArray(order) ? order[0] : order
  const sortOrderParts = sortOrder.split('.')
  const sortKey = sortOrderParts[0]
  const sortDirection = sortOrderParts[1] === 'desc' ? 'desc' : 'asc'

  const sortedItems = items.sort((a, b) => {
    let aValue = a[sortKey]
    let bValue = b[sortKey]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1
    }
    return 0
  })

  return sortedItems
}
