export type Condition = '='

const Defaults = {
  conditions: {
    max: 2,
  },
}

export type IndexQueryCondition = {
  attrName: string
  attrValue: string
  condition: Condition
}

export interface CreateQueryInterface {
  tableName: string
  indexNameSuffix: string
  conditions: IndexQueryCondition[]
}

export const createQuery = ({
  tableName,
  indexNameSuffix,
  conditions,
}: CreateQueryInterface) => {
  const expressionAttributeNames: Record<string, string> = {}
  const expressionAttributeValues: Record<string, string> = {}

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
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }

  return queryCommand
}
