import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

import { ResourceType } from './types'
import { tableName } from '../utils/tableName'
import { envDynamoDbEndpoint } from '../config/envVariables'

class Resource {
  client: DynamoDBClient
  docClient: DynamoDBDocumentClient
  tableName: string

  constructor(tableNameSuffix: string) {
    this.client = new DynamoDBClient({
      endpoint: envDynamoDbEndpoint(),
    })
    this.docClient = DynamoDBDocumentClient.from(this.client)
    this.tableName = tableName({ tableNameSuffix: tableNameSuffix })
  }

  async queryBy({
    indexNameSuffix,
    attributeName,
    attributeValue,
    condition,
  }: {
    indexNameSuffix: string
    attributeName: string
    attributeValue: string
    condition: string
  }): Promise<ResourceType[] | undefined> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: `${this.tableName}-${indexNameSuffix}`,
      KeyConditionExpression: `#attrName ${condition} :attrValue`,
      ExpressionAttributeNames: {
        '#attrName': attributeName,
      },
      ExpressionAttributeValues: {
        ':attrValue': attributeValue,
      },
    })
    const response = await this.docClient.send(command)

    return response.Items
  }

  async get({ id }: { id: string }): Promise<ResourceType | undefined> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    })
    const response = await this.docClient.send(command)

    return response.Item
  }

  async create({ attrs }: { attrs: ResourceType }): Promise<ResourceType> {
    const { name, content, user_id } = attrs

    const item: ResourceType = {
      id: uuidv4(),
      name,
      content,
      user_id,
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    })

    await this.docClient.send(command)

    return item
  }

  async update({
    id,
    attrs,
  }: {
    id: string
    attrs: ResourceType
  }): Promise<ResourceType | undefined> {
    const existingItem = await this.get({ id })
    if (!existingItem) {
      return
    }

    const { content } = attrs

    const updatedItem: ResourceType = {
      ...existingItem,
      content,
      id: existingItem.id as string, // make sure ID stays the same
    }

    const command = new PutCommand({
      TableName: this.tableName,
      Item: updatedItem,
    })

    await this.docClient.send(command)

    return updatedItem
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
      ReturnValues: 'ALL_OLD',
    })

    const response = await this.docClient.send(command)

    return response.Attributes !== undefined
  }
}

export default Resource
