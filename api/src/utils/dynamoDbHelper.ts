export type KeyCondition = '='
export type FilterCondition = '=' | '<>' | '<' | '<=' | '>' | '>='
export type AttrValueType = string | number

export type IndexQueryCondition = {
  attrName: string
  attrValue: AttrValueType
  condition: KeyCondition
}

export type FilterExpression = {
  attrName: string
  attrValue: AttrValueType
  condition: FilterCondition
}

export interface CreateQueryInterface {
  tableName: string
  indexNameSuffix: string
  conditions: IndexQueryCondition[]
  filterExpressions?: FilterExpression[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exclusiveStartKey?: Record<string, any>
  limitUseWithCaution?: number
}

const Defaults = {
  conditions: {
    max: 2,
  },
}

export const createQuery = ({
  tableName,
  indexNameSuffix,
  conditions,
  filterExpressions,
  exclusiveStartKey,
  limitUseWithCaution,
}: CreateQueryInterface) => {
  const expressionAttributeNames: Record<string, string> = {}
  const expressionAttributeValues: Record<string, AttrValueType> = {}

  const selectedConditions = conditions.slice(0, Defaults.conditions.max)
  if (conditions.length > 2) {
    console.warn(
      `createQuery max ${Defaults.conditions.max} conditions allowed:`,
      conditions,
    )
    console.warn('createQuery selected conditions are:', selectedConditions)
  }

  selectedConditions.forEach((indexQueryCondition, index) => {
    expressionAttributeNames[`#attrName${index}`] = indexQueryCondition.attrName
    expressionAttributeValues[`:attrValue${index}`] =
      indexQueryCondition.attrValue
  })

  if (filterExpressions) {
    filterExpressions.forEach((filterExpression, index) => {
      expressionAttributeNames[`#filterAttrName${index}`] =
        filterExpression.attrName
      expressionAttributeValues[`:filterAttrValue${index}`] =
        filterExpression.attrValue
    })
  }

  const queryCommand = {
    TableName: tableName,
    IndexName: `${tableName}-${indexNameSuffix}`,
    KeyConditionExpression: selectedConditions
      .map((condition, index) => {
        return [
          `#attrName${index}`,
          condition.condition,
          `:attrValue${index}`,
        ].join(' ')
      })
      .join(' and '),
    FilterExpression:
      (filterExpressions || [])
        .map((filterExpression, index) => {
          return [
            `#filterAttrName${index}`,
            filterExpression.condition,
            `:filterAttrValue${index}`,
          ].join(' ')
        })
        .join(' and ') || undefined,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ExclusiveStartKey: exclusiveStartKey,
    Limit: limitUseWithCaution,
  }

  return queryCommand
}

export const convertLastEvaluatedKeyToContinuationToken = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastEvaluatedKey: Record<string, any>,
): string => {
  return JSON.stringify(lastEvaluatedKey)
}

export const convertContinuationTokenToLastEvaluatedKey = (
  continuationToken: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | undefined => {
  try {
    return JSON.parse(continuationToken)
  } catch (error) {
    console.error(
      'createContinuationToken() Error parsing continuation token:',
      error,
    )
    return undefined
  }
}
