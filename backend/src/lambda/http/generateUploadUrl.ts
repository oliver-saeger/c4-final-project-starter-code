import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { AttachmentUtils } from '../../helpers/attachmentUtils'
import { getUserId } from '../utils'
import * as AWS from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)


const dbClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE

const attachmentUtils = new AttachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const uploadUrl = await createAttachmentPresignedUrl(userId, todoId)

    dbClient.update({
      TableName: todoTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUtils.getAttachmentBucketUrl(todoId)
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: uploadUrl
      }),
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
