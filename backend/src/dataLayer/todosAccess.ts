import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {TodoUpdate} from "../models/TodoUpdate";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import UpdateItemInput = DocumentClient.UpdateItemInput;
import QueryInput = DocumentClient.QueryInput;
import PutItemInput = DocumentClient.PutItemInput;
import DeleteItemInput = DocumentClient.DeleteItemInput;

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const dbClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODO_TABLE

export class TodosAccess {

  async getTodosPerUser(userId: string): Promise<TodoItem[]> {
    logger.log("Getting all todos for user: ", userId)

    const params: QueryInput = {
      TableName: todoTable,
      IndexName: process.env.TODOS_CREATED_AT_INDEX,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await dbClient.query(params).promise()
    return result.Items as TodoItem[]
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    const params : PutItemInput = {
      TableName: todoTable,
      Item: todoItem
    }

    const createdItem = await dbClient.put(params).promise()
    return createdItem.Attributes as TodoItem
  }

  async updateTodoItem(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoItem> {
    const params: UpdateItemInput = {
      TableName: todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      },
      ReturnValues: "ALL_NEW"
    }

    const updatedItem = await dbClient.update(params).promise()
    return updatedItem.Attributes as TodoItem
  }

  async deleteTodoItem(userId: string, todoId: string): Promise<void> {
    const params: DeleteItemInput = {
      TableName: todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }

    dbClient.delete(params)
  }
}