import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const { symbol, type, price, quantity, date } = await readBody(event)

  const result = db.prepare(`
    UPDATE trades 
    SET symbol = ?, type = ?, price = ?, quantity = ?, date = ?
    WHERE id = ? AND user_id = ?
  `).run(symbol, type, price, quantity, date, id, user.id)

  if (result.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Сделка не найдена'
    })
  }

  return { success: true }
})