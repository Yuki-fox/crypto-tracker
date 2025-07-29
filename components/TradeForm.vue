<template>
  <div class="card">
    <div class="card-header">
      <h2>{{ editingPosition ? '📊 Закрыть позицию' : '🚀 Открыть позицию' }}</h2>
      <div v-if="editingPosition" class="badge badge-primary">
        {{ editingPosition.symbol }}
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="successMessage" class="message message-success">
        ✨ {{ successMessage }}
      </div>
    </transition>
    
    <!-- Форма для новой позиции -->
    <form v-if="!editingPosition" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Валюта</label>
        <select v-model="form.symbol" class="select" required>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="XRP">Ripple (XRP)</option>
        </select>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Цена покупки (USDT)</label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.000001"
            class="input"
            placeholder="0.00"
            required
          />
          <button 
            type="button" 
            @click="insertCurrentPrice('buy')" 
            class="price-insert-btn"
            :disabled="loadingPrice"
          >
            {{ loadingPrice ? 'Загрузка...' : 'Вставить текущую цену' }}
          </button>
        </div>
        
        <div class="form-group">
          <label>Количество</label>
          <input
            v-model.number="form.quantity"
            type="number"
            step="0.000001"
            class="input"
            placeholder="0.00"
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <label>Дата и время</label>
        <input
          v-model="form.date"
          type="datetime-local"
          class="input"
          required
        />
      </div>
      
      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Сохранение...' : 'Открыть позицию' }}
      </button>
    </form>
    
    <!-- Форма для закрытия позиции -->
    <div v-else>
      <div class="info-box">
        <div class="info-row">
          <span>Куплено:</span>
          <strong>{{ editingPosition.buyQuantity || 0 }} × ${{ (editingPosition.buyPrice || 0).toFixed(2) }}</strong>
        </div>
        <div class="info-row">
          <span>Остаток:</span>
          <strong class="text-accent">{{ editingPosition.remainingQuantity || 0 }} {{ editingPosition.symbol }}</strong>
        </div>
      </div>
      
      <form @submit.prevent="handleSell">
        <div class="form-row">
          <div class="form-group">
            <label>Цена продажи (USDT)</label>
            <input
              v-model.number="sellForm.price"
              type="number"
              step="0.000001"
              class="input"
              placeholder="0.00"
              required
            />
            <button 
              type="button" 
              @click="insertCurrentPrice('sell')" 
              class="price-insert-btn"
              :disabled="loadingPrice"
            >
              {{ loadingPrice ? 'Загрузка...' : 'Вставить текущую цену' }}
            </button>
          </div>
          
          <div class="form-group">
            <label>Количество (макс: {{ editingPosition.remainingQuantity || 0 }})</label>
            <input
              v-model.number="sellForm.quantity"
              type="number"
              step="0.000001"
              :max="editingPosition.remainingQuantity || 0"
              class="input"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Дата продажи</label>
          <input
            v-model="sellForm.date"
            type="datetime-local"
            class="input"
            required
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-success" :disabled="loading">
            {{ loading ? 'Сохранение...' : 'Продать' }}
          </button>
          <button @click="cancelEdit" type="button" class="btn btn-secondary">
            Отмена
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['added', 'updated'])
const editingPosition = ref(null)
const successMessage = ref('')
const loading = ref(false)
const loadingPrice = ref(false)

// Форма для новой позиции
const form = ref({
  symbol: 'BTC',
  type: 'buy',
  price: null,
  quantity: null,
  date: new Date().toISOString().slice(0, 16)
})

// Форма для продажи
const sellForm = ref({
  price: null,
  quantity: null,
  date: new Date().toISOString().slice(0, 16)
})

// Функция для получения и вставки текущей цены
const insertCurrentPrice = async (type) => {
  loadingPrice.value = true
  try {
    // Определяем символ в зависимости от типа операции
    const symbol = type === 'buy' ? form.value.symbol : editingPosition.value.symbol
    
    // Получаем текущую цену
    const response = await $fetch(`/api/prices?symbols=${symbol}`)
    const price = response[symbol]
    
    if (price) {
      // Вставляем цену в соответствующее поле
      if (type === 'buy') {
        form.value.price = price
      } else {
        sellForm.value.price = price
      }
    } else {
      alert('Не удалось получить текущую цену')
    }
  } catch (error) {
    console.error('Ошибка при получении цены:', error)
    alert('Ошибка при получении цены')
  } finally {
    loadingPrice.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/trades', {
      method: 'POST',
      body: { 
        ...form.value, 
        type: 'buy' 
      }
    })
    
    if (response && response.success) {
      showSuccess('Позиция открыта')
      emit('added')
      resetForm()
    }
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
    alert('Ошибка: ' + (error.data?.statusMessage || error.message || 'Неизвестная ошибка'))
  } finally {
    loading.value = false
  }
}

const handleSell = async () => {
  if (!editingPosition.value || !editingPosition.value.id) {
    alert('Ошибка: не выбрана позиция')
    return
  }
  
  if (!sellForm.value.price || !sellForm.value.quantity) {
    alert('Заполните все поля')
    return
  }
  
  if (sellForm.value.quantity > (editingPosition.value.remainingQuantity || 0)) {
    alert('Количество не может быть больше остатка')
    return
  }
  
  loading.value = true
  try {
    // Создаем сделку продажи
    const sellResponse = await $fetch('/api/trades', {
      method: 'POST',
      body: {
        symbol: editingPosition.value.symbol,
        type: 'sell',
        price: sellForm.value.price,
        quantity: sellForm.value.quantity,
        date: sellForm.value.date,
        parent_trade_id: editingPosition.value.id
      }
    })
    
    if (!sellResponse || !sellResponse.success) {
      throw new Error('Ошибка при создании продажи')
    }
    
    // Если продано не все, создаем новую позицию с остатком
    const remaining = (editingPosition.value.remainingQuantity || 0) - sellForm.value.quantity
    if (remaining > 0) {
      const remainingResponse = await $fetch('/api/trades', {
        method: 'POST',
        body: {
          symbol: editingPosition.value.symbol,
          type: 'buy',
          price: editingPosition.value.buyPrice,
          quantity: remaining,
          date: editingPosition.value.buyDate,
          parent_trade_id: editingPosition.value.id
        }
      })
      
      if (!remainingResponse || !remainingResponse.success) {
        console.warn('Не удалось создать позицию с остатком')
      }
    }
    
    showSuccess('Позиция закрыта')
    emit('updated')
    cancelEdit()
  } catch (error) {
    console.error('Ошибка при продаже:', error)
    alert('Ошибка: ' + (error.data?.statusMessage || error.message || 'Неизвестная ошибка'))
  } finally {
    loading.value = false
  }
}

const showSuccess = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const resetForm = () => {
  form.value = {
    symbol: 'BTC',
    type: 'buy',
    price: null,
    quantity: null,
    date: new Date().toISOString().slice(0, 16)
  }
}

const cancelEdit = () => {
  editingPosition.value = null
  sellForm.value = {
    price: null,
    quantity: null,
    date: new Date().toISOString().slice(0, 16)
  }
}

const editTrade = (position) => {
  if (!position || !position.symbol) {
    console.error('Invalid position data:', position)
    return
  }
  
  console.log('Editing position:', position)
  editingPosition.value = {
    ...position,
    buyPrice: position.buyPrice || 0,
    buyQuantity: position.buyQuantity || 0,
    remainingQuantity: position.remainingQuantity || 0,
    symbol: position.symbol || 'UNKNOWN'
  }
  
  sellForm.value = {
    price: null,
    quantity: editingPosition.value.remainingQuantity || 0,
    date: new Date().toISOString().slice(0, 16)
  }
}

// ВАЖНО: Экспортируем метод editTrade
defineExpose({ editTrade })
</script>

<style scoped>
/* Стили для формы */
.info-box {
  background: var(--bg-tertiary);
  border-radius: var(--radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid var(--border);
}

.text-accent {
  color: var(--accent);
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.form-actions .btn {
  flex: 1;
}

.btn-block {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-top: 8px;
}

/* Стиль для кнопки вставки цены */
.price-insert-btn {
  margin-top: 6px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.price-insert-btn:hover:not(:disabled) {
  color: var(--accent);
  text-decoration: underline;
}

.price-insert-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Анимация появления сообщения */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>