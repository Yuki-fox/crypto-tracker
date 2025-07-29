import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  
  console.log('Creating trade for user:', user?.id, 'Body:', body)
  
  const { symbol, type, price, quantity, date, parent_trade_id } = body

  if (!symbol || !type || !price || !quantity || !date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Все поля обязательны'
    })
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Не авторизован'
    })
  }

  try {
    const result = db.prepare(`
      INSERT INTO trades (user_id, symbol, type, price, quantity, date, parent_trade_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, symbol, type, price, quantity, date, parent_trade_id || null)

    console.log('Trade created with id:', result.lastInsertRowid, 'parent_trade_id:', parent_trade_id)
    return { success: true, id: result.lastInsertRowid }
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при сохранении в базу данных'
    })
  }
})