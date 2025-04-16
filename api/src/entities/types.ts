import { NativeAttributeValue } from '@aws-sdk/lib-dynamodb'

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
