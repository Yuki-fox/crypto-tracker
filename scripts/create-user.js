const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const readline = require('readline')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'crypto-tracker.db'))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function createUser() {
  try {
    const username = await question('Логин: ')
    const password = await question('Пароль: ')
    
    const hashedPassword = bcrypt.hashSync(password, 10)
    
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    stmt.run(username, hashedPassword)
    
    console.log(`✅ Пользователь "${username}" создан`)
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.error('❌ Пользователь с таким логином уже существует')
    } else {
      console.error('❌ Ошибка:', error.message)
    }
  } finally {
    rl.close()
    db.close()
  }
}

createUser()