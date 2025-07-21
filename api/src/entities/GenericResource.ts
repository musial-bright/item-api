import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'

import {
  QueryByResultType,
  QueryByType,
  ResourceAttributesType,
  ResourceType,
} from './types'
import { tableName } from '../utils/tableName'
import { envDynamoDbEndpoint, envDynamoDbRegion } from '../config/envVariables'
import {
  convertContinuationTokenToLastEvaluatedKey,
  convertLastEvaluatedKeyToContinuationToken,
  createQuery,
} from '../utils/dynamoDbHelper'

class GenericResource {
  client: DynamoDBClient
  docClient: DynamoDBDocumentClient
  tableName: string

  constructor(tableNameSuffix: string) {
    this.client = new DynamoDBClient({
      endpoint: envDynamoDbEndpoint(),
      region: envDynamoDbRegion(),
      // Comment in for local testing if your .aws/credentials has no [default]
      // Alternativally you can use this in .aws/credentials
      // [default]
      //   aws_access_key_id=fake
      //   aws_secret_access_key=fake
      // credentials: {
      //   accessKeyId: 'fake',
      //   secretAccessKey: 'fake',
      // },
    })
    this.docClient = DynamoDBDocumentClient.from(this.client)
    this.tableName = tableName({ tableNameSuffix: tableNameSuffix })
  }

  /**
   * Query the resource via an index by given conditions and filter expressions.
   * This method is intended to be overridden by subclasses.
   *
   * @param param0
   *  `indexNameSuffix` is the suffix of the index name to query, i.e. `by-user-id-and-name`.
   *  `conditions` contain one or two `IndexQueryCondition`s.
   *  `filterExpressions` are optional filter expressions to apply to the query.
   *  `continuation` is an optional continuation token for pagination.
   *  `limitUseWithCaution` is a parameter that should be used with caution
   *    because it is not the same as in SQL.
   * @returns
   */
  async queryBy({
    indexNameSuffix,
    conditions,
    filterExpressions,
    continuation,
    limitUseWithCaution,
  }: QueryByType): Promise<QueryByResultType> {
    const queryCommand = createQuery({
      tableName: this.tableName,
      indexNameSuffix,
      conditions,
      filterExpressions,
      exclusiveStartKey: continuation
        ? convertContinuationTokenToLastEvaluatedKey(continuation)
        : undefined,
      limitUseWithCaution,
    })

    const command = new QueryCommand(queryCommand)
    const response = await this.docClient.send(command)

    const result: QueryByResultType = {
      items: response.Items,
    }

    if (response.LastEvaluatedKey) {
      result.continuation = convertLastEvaluatedKeyToContinuationToken(
        response.LastEvaluatedKey,
      )
    }

    return result
  }

  async get({
    keys,
  }: {
    keys: ResourceAttributesType
  }): Promise<ResourceAttributesType | undefined> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: keys,
    })
    const response = await this.docClient.send(command)

    return response.Item
  }

  async create({
    attrs,
  }: {
    attrs: ResourceAttributesType
  }): Promise<ResourceAttributesType> {
    const createdAt = new Date()
    const item: ResourceType = {
      ...attrs,
      created_at: createdAt.getTime(),
      updated_at: createdAt.getTime(),
      created_at_iso: createdAt.toISOString(),
      updated_at_iso: createdAt.toISOString(),
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    })

    await this.docClient.send(command)

    return item
  }

  async update({
    keys,
    attrs,
  }: {
    keys: ResourceAttributesType
    attrs: ResourceAttributesType
  }): Promise<ResourceAttributesType | undefined> {
    const existingItem = await this.get({ keys })
    if (!existingItem) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, created_at_iso, user_id, name, ...restAttrs } =
      attrs

    const updatedAt = new Date()
    const updatedItem: ResourceAttributesType = {
      ...existingItem,
      ...restAttrs,
      created_at: existingItem.created_at || updatedAt.getTime(),
      created_at_iso: existingItem.created_at_iso || updatedAt.toISOString(),
      updated_at: updatedAt.getTime(),
      updated_at_iso: updatedAt.toISOString(),
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: updatedItem,
    })

    await this.docClient.send(command)

    return updatedItem
  }

  async delete({ keys }: { keys: ResourceAttributesType }): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: keys,
      ReturnValues: 'ALL_OLD',
    })

    const response = await this.docClient.send(command)

    return response.Attributes !== undefined
  }
}

export default GenericResource
