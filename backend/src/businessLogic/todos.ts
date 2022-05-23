import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const todosAccess = new TodosAccess()
const attachmentsUtils = new AttachmentUtils()
const logger = createLogger('todos')

export async function getTodosPerUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosPerUser(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4();
  const uploadUrl = attachmentsUtils.getAttachmentBucketUrl(todoId)

  const newTodoItem: TodoItem = {
    todoId: todoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest,
    attachmentUrl: uploadUrl
  }

  logger.info('Storing new Todo: ' + newTodoItem)
  return todosAccess.createTodoItem(newTodoItem);
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoItem> {
  logger.info('Update Todo Item: ', {userId: userId, todoId: todoId, updateTodoRequest: updateTodoRequest})
  return todosAccess.updateTodoItem(userId, todoId, updateTodoRequest);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  logger.info('Storing new Todo: ', {userId: userId, todoId: todoId})
  return todosAccess.deleteTodoItem(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  logger.info('Create new pre-signed upload url for: ', {userId: userId, todoId: todoId})
  return attachmentsUtils.createAttachmentPresignedUrl(userId, todoId)
}