#!/bin/bash

# Имя для архива с датой
BACKUP_NAME="crypto-tracker-clean-$(date +%Y%m%d-%H%M%S)"

# Создаем временную директорию
mkdir -p ~/backups/$BACKUP_NAME

# Копируем только нужные файлы
echo "Копирование файлов проекта..."

# Копируем структуру папок и файлы
cp -r components ~/backups/$BACKUP_NAME/
cp -r pages ~/backups/$BACKUP_NAME/
cp -r server ~/backups/$BACKUP_NAME/
cp -r layouts ~/backups/$BACKUP_NAME/
cp -r composables ~/backups/$BACKUP_NAME/
cp -r middleware ~/backups/$BACKUP_NAME/
cp -r assets ~/backups/$BACKUP_NAME/
cp -r scripts ~/backups/$BACKUP_NAME/
cp -r plugins ~/backups/$BACKUP_NAME/ 2>/dev/null || true

# Копируем конфигурационные файлы
cp package.json ~/backups/$BACKUP_NAME/
cp nuxt.config.ts ~/backups/$BACKUP_NAME/
cp app.vue ~/backups/$BACKUP_NAME/
cp nitro.config.ts ~/backups/$BACKUP_NAME/ 2>/dev/null || true
cp tsconfig.json ~/backups/$BACKUP_NAME/ 2>/dev/null || true

# Создаем .env.example
echo "JWT_SECRET=your-secret-key-change-me" > ~/backups/$BACKUP_NAME/.env.example

# Создаем .gitignore
cat > ~/backups/$BACKUP_NAME/.gitignore << 'EOF'
# Nuxt
.nuxt
.output
.nitro
dist

# Dependencies
node_modules

# Database
*.db
*.sqlite
*.sqlite3

# Environment
.env
.env.*

# Logs
*.log

# OS
.DS_Store
EOF

# Создаем README
cat > ~/backups/$BACKUP_NAME/README.md << 'EOF'
# Crypto Tracker

## Установка
1. npm install
2. Скопируйте .env.example в .env и измените JWT_SECRET
3. npm run user:create (создать пользователя)
4. npm run dev (запустить)
EOF

echo "Создание архива..."
cd ~/backups
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME/

echo "✅ Готово! Чистая копия сохранена в:"
echo "   Папка: ~/backups/$BACKUP_NAME/"
echo "   Архив: ~/backups/$BACKUP_NAME.tar.gz"