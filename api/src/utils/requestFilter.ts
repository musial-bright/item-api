import { FastifyRequest } from 'fastify'
import { FilterCondition, FilterExpression } from './dynamoDbHelper'
import { isNumeric } from './languageTools'

const opCode: Record<string, FilterCondition> = {
  neq: '<>',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  le: '<=',
}

const optCodeToFilterCondition = (code: string): FilterCondition => {
  return opCode[code] || '='
}

export const getFilterExpressions = (
  request: FastifyRequest,
): FilterExpression[] => {
  const filterExpressions: FilterExpression[] = []

  const query = request.query as Record<string, string | string[]>
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('_')) {
      continue
    }

    const dotParts = key.split('.')
    const attrName = dotParts[0]

    const singleValue = Array.isArray(value) ? value[0] : value
    const attrValue: string | number = isNumeric(singleValue)
      ? Number(singleValue)
      : singleValue

    filterExpressions.push({
      attrName,
      attrValue,
      condition: optCodeToFilterCondition(dotParts[1] || '='),
    })
  }

  return filterExpressions
}
