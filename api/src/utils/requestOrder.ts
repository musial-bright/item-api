import { FastifyRequest } from 'fastify'
import { ResourceType } from '../entities/types'

export const filterItems = (request: FastifyRequest, items: ResourceType[]) => {
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
    if (a[sortKey] < b[sortKey]) {
      return sortDirection === 'asc' ? -1 : 1
    }
    if (a[sortKey] > b[sortKey]) {
      return sortDirection === 'asc' ? 1 : -1
    }
    return 0
  })

  return sortedItems
}
