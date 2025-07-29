import { db } from '~/server/utils/db'
import { verifyPassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Требуются логин и пароль'
    })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any

  if (!user || !verifyPassword(password, user.password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Неверный логин или пароль'
    })
  }

  const token = generateToken({ id: user.id, username: user.username })
  
  // Для production используем другой подход
  const isProduction = process.env.NODE_ENV === 'production'
  
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: false, // Поставьте true если используете HTTPS
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })

  // Добавляем заголовок для отладки
  setHeader(event, 'X-Auth-Token', token)

  return { 
    success: true, 
    user: { 
      id: user.id, 
      username: user.username 
    }
  }
})