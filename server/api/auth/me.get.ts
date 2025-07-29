import { getUserFromEvent } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = getUserFromEvent(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Не авторизован'
    })
  }

  return { user }
})