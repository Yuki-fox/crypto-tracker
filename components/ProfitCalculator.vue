<template>
  <div>
    <!-- Обновленная кнопка калькулятора -->
    <button @click="showCalculator = true" class="btn-icon btn-calculator" title="Рассчитать прибыль">
      <Icon name="chart-line" />
    </button>
    
    <!-- Модальное окно калькулятора -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showCalculator" class="modal-overlay" @click.self="closeCalculator">
          <div class="modal-content">
            <div class="modal-header">
              <h2>
                <Icon name="chart-line" />
                Рассчитать прибыль для выбранных позиций
              </h2>
              <button @click="closeCalculator" class="btn-icon">
                <Icon name="times" />
              </button>
            </div>
            
            <div class="modal-body">
              <!-- Список позиций с чекбоксами -->
              <div class="positions-selector">
                <div class="selector-header">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      :checked="allSelected"
                      @change="toggleAll"
                    />
                    <span>Выбрать все</span>
                  </label>
                  <span class="selected-count">
                    Выбрано: {{ selectedPositions.length }} из {{ positions.length }}
                  </span>
                </div>
                
                <div class="positions-list">
                  <div 
                    v-for="position in positions" 
                    :key="position.id" 
                    class="position-selector-item"
                    :class="{ selected: isSelected(position.id) }"
                  >
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        :checked="isSelected(position.id)"
                        @change="togglePosition(position.id)"
                      />
                      <div class="position-info">
                        <div class="position-main">
                          <span class="badge" :class="position.symbol === 'BTC' ? 'badge-btc' : 'badge-xrp'">
                            <Icon :name="position.symbol.toLowerCase()" size="12" />
                            {{ position.symbol }}
                          </span>
                          <span class="quantity">{{ position.buyQuantity }}</span>
                          <span class="price">@ ${{ position.buyPrice.toFixed(2) }}</span>
                        </div>
                        <div class="position-value">
                          ${{ (position.buyQuantity * position.buyPrice).toFixed(2) }}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Расчет прибыли -->
              <div v-if="selectedPositions.length > 0" class="calculation-section">
                <div class="summary-card">
                  <div class="summary-row">
                    <span class="label">Выбранные позиции:</span>
                    <span class="value">{{ groupedSummary }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="label">Общая сумма покупки:</span>
                    <span class="value">${{ totalBuyCost.toFixed(2) }}</span>
                  </div>
                </div>
                
                <div class="price-input-section">
                  <label>Цена продажи (USDT)</label>
                  <div class="price-inputs">
                    <div v-for="symbol in uniqueSymbols" :key="symbol" class="price-input-group">
                      <span class="input-label">
                        <Icon :name="symbol.toLowerCase()" size="16" />
                        {{ symbol }}
                      </span>
                      <input
                        v-model.number="sellPrices[symbol]"
                        type="number"
                        step="0.000001"
                        class="input"
                        :placeholder="`Текущая: $${currentPrices[symbol]?.toFixed(4) || '0'}`"
                        @input="calculateProfit"
                      />
                      <button 
                        @click="useCurrentPrice(symbol)" 
                        class="btn-secondary btn-small"
                        :disabled="!currentPrices[symbol]"
                      >
                        Текущая
                      </button>
                    </div>
                  </div>
                </div>
                
                <div v-if="profitCalculated" class="result-section">
                  <div class="result-card" :class="totalProfit >= 0 ? 'profit' : 'loss'">
                    <h3>Результат:</h3>
                    <div class="result-value">
                      {{ totalProfit >= 0 ? '+' : '' }}${{ Math.abs(totalProfit).toFixed(2) }} 
                      ({{ totalProfit >= 0 ? '+' : '' }}{{ profitPercent.toFixed(2) }}%)
                    </div>
                    <div class="result-details">
                      <div class="detail-row">
                        <span>Сумма продажи:</span>
                        <span>${{ totalSellAmount.toFixed(2) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Комиссии (0.15%):</span>
                        <span>-${{ totalFees.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                  <p class="result-note">
                    Для {{ selectedPositions.length }} позици{{ selectedPositions.length === 1 ? 'и' : 'й' }}
                  </p>
                </div>
              </div>
              
              <div v-else class="empty-selection">
                <Icon name="chart-bar" />
                <p>Выберите позиции для расчета прибыли</p>
              </div>
            </div>
            
            <div class="modal-footer">
              <button @click="closeCalculator" class="btn btn-secondary">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  positions: {
    type: Array,
    default: () => []
  },
  currentPrices: {
    type: Object,
    default: () => ({})
  }
})

const TRADING_FEE = 0.00075 // 0.075%

const showCalculator = ref(false)
const selectedIds = ref(new Set())
const sellPrices = ref({})
const profitCalculated = ref(false)

// Вычисляемые свойства
const selectedPositions = computed(() => 
  props.positions.filter(p => selectedIds.value.has(p.id))
)

const allSelected = computed(() => 
  props.positions.length > 0 && selectedIds.value.size === props.positions.length
)

const uniqueSymbols = computed(() => 
  [...new Set(selectedPositions.value.map(p => p.symbol))]
)

const groupedSummary = computed(() => {
  const groups = {}
  selectedPositions.value.forEach(pos => {
    if (!groups[pos.symbol]) {
      groups[pos.symbol] = { count: 0, quantity: 0 }
    }
    groups[pos.symbol].count++
    groups[pos.symbol].quantity += pos.buyQuantity
  })
  
  return Object.entries(groups)
    .map(([symbol, data]) => `${symbol}: ${data.quantity.toFixed(2)}`)
    .join(', ')
})

const totalBuyCost = computed(() => {
  return selectedPositions.value.reduce((sum, pos) => {
    const cost = pos.buyQuantity * pos.buyPrice
    const fee = cost * TRADING_FEE
    return sum + cost + fee
  }, 0)
})

const totalSellAmount = computed(() => {
  return selectedPositions.value.reduce((sum, pos) => {
    const price = sellPrices.value[pos.symbol] || 0
    return sum + (pos.buyQuantity * price)
  }, 0)
})

const totalFees = computed(() => {
  const buyFees = selectedPositions.value.reduce((sum, pos) => {
    return sum + (pos.buyQuantity * pos.buyPrice * TRADING_FEE)
  }, 0)
  
  const sellFees = totalSellAmount.value * TRADING_FEE
  
  return buyFees + sellFees
})

const totalProfit = computed(() => {
  if (!profitCalculated.value) return 0
  return totalSellAmount.value - totalFees.value - totalBuyCost.value
})

const profitPercent = computed(() => {
  if (totalBuyCost.value === 0) return 0
  return (totalProfit.value / totalBuyCost.value) * 100
})

// Методы
const isSelected = (id) => selectedIds.value.has(id)

const togglePosition = (id) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  calculateProfit()
}

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value.clear()
  } else {
    selectedIds.value = new Set(props.positions.map(p => p.id))
  }
  calculateProfit()
}

const useCurrentPrice = (symbol) => {
  if (props.currentPrices[symbol]) {
    sellPrices.value[symbol] = props.currentPrices[symbol]
    calculateProfit()
  }
}

const calculateProfit = () => {
  const allPricesSet = uniqueSymbols.value.every(symbol => 
    sellPrices.value[symbol] && sellPrices.value[symbol] > 0
  )
  profitCalculated.value = allPricesSet && selectedPositions.value.length > 0
}

const closeCalculator = () => {
  showCalculator.value = false
  // Очищаем состояние через небольшую задержку после закрытия
  setTimeout(() => {
    selectedIds.value.clear()
    sellPrices.value = {}
    profitCalculated.value = false
  }, 300)
}

// Инициализация цен при открытии
watch(showCalculator, (newVal) => {
  if (newVal) {
    // Устанавливаем текущие цены по умолчанию
    uniqueSymbols.value.forEach(symbol => {
      if (props.currentPrices[symbol]) {
        sellPrices.value[symbol] = props.currentPrices[symbol]
      }
    })
  }
})
</script>

<style scoped>
/* Обновленные стили кнопки калькулятора */
.btn-calculator {
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
}

.btn-calculator:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--accent);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
}

.modal-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Селектор позиций */
.positions-selector {
  margin-bottom: var(--spacing-lg);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border);
}

.selected-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.positions-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-tertiary);
}

.position-selector-item {
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease;
}

.position-selector-item:last-child {
  border-bottom: none;
}

.position-selector-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.position-selector-item.selected {
  background: rgba(91, 141, 255, 0.05);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--spacing-md);
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.position-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.position-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity {
  font-weight: 600;
}

.price {
  color: var(--text-secondary);
  font-size: 14px;
}

.position-value {
  font-weight: 600;
  color: var(--accent);
}

/* Секция расчетов */
.calculation-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.summary-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--spacing-md);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-row:not(:last-child) {
  border-bottom: 1px solid var(--border);
}

.summary-row .label {
  font-size: 14px;
  color: var(--text-secondary);
}

.summary-row .value {
  font-weight: 600;
}

/* Ввод цен */
.price-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-input-section > label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-input-group {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 12px;
  align-items: center;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.btn-small {
  padding: 8px 12px;
  font-size: 12px;
}

/* ОБНОВЛЕННЫЕ стили результатов - уменьшаем размеры */
.result-section {
  margin-top: var(--spacing-md);
}

.result-card {
  background: var(--bg-tertiary);
  border-radius: var(--radius);
  padding: var(--spacing-md); /* Уменьшили padding */
  border: 2px solid;
  margin-bottom: var(--spacing-sm);
}

.result-card.profit {
  border-color: var(--success);
  background: var(--success-bg);
}

.result-card.loss {
  border-color: var(--danger);
  background: var(--danger-bg);
}

.result-card h3 {
  font-size: 14px; /* Уменьшили размер */
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.result-value {
  font-size: 22px; /* Уменьшили с 32px до 22px */
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.result-card.profit .result-value {
  color: var(--success);
}

.result-card.loss .result-value {
  color: var(--danger);
}

.result-details {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0; /* Уменьшили padding */
  font-size: 13px; /* Уменьшили размер */
}

.detail-row:first-child {
  color: var(--text-secondary);
}

.result-note {
  text-align: center;
  font-size: 13px; /* Уменьшили размер */
  color: var(--text-secondary);
  margin: 0;
}

/* Пустое состояние */
.empty-selection {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-selection svg {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

/* Анимация модального окна */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

/* Скроллбар для списка позиций */
.positions-list::-webkit-scrollbar {
  width: 6px;
}

.positions-list::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.positions-list::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.positions-list::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}
</style>