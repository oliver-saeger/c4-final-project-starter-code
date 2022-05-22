import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosPerUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import {createLogger} from "winston";

const logger = createLogger();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const todos = getTodosPerUser(userId);


    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
})

handler.use(
  cors({
    credentials: true
  })
)
