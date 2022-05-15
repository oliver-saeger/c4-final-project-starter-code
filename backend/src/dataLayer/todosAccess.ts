import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const dbClient = new DocumentClient();
const todoTable = process.env.TODO_TABLE

export class TodosAccess {

  async getTodosPerUser(userId: string) {
    logger.log("Processing event: ", JSON.stringify(event))

    const result = await dbClient.query({
      TableName: todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    return result.Items
  }
}