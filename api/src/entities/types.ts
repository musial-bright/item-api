import { NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { FilterExpression, IndexQueryCondition } from '../utils/dynamoDbHelper'

export type ResourceAttributesType = Record<string, NativeAttributeValue>

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ResourceType = Record<string, any>

export type ItemType = {
  name: string
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  content: any
  id?: string
  user_id?: string
}

export type QueryByType = {
  indexNameSuffix: string
  conditions: IndexQueryCondition[]
  filterExpressions?: FilterExpression[]
  continuation?: string
  limitUseWithCaution?: number
}

export type QueryByResultType = {
  items: ResourceType[] | undefined
  continuation?: string
}
