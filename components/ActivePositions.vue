<template>
  <div class="active-positions-container">
    <div class="card positions-card">
      <div class="card-header">
        <div class="header-left">
          <h2>
            <Icon name="briefcase" :style="{ color: 'var(--purple)' }" />
            Активные позиции
          </h2>
          <div v-if="positions.length > 0" class="avg-prices">
            <div v-if="avgPrices.BTC" class="avg-price-badge badge-btc">
              <Icon name="btc" size="12" />
              <span>${{ avgPrices.BTC.toFixed(2) }}</span>
            </div>
            <div v-if="avgPrices.XRP" class="avg-price-badge badge-xrp">
              <Icon name="xrp" size="12" />
              <span>${{ avgPrices.XRP.toFixed(3) }}</span>
            </div>
          </div>
        </div>
        <span class="badge badge-secondary">{{ positions.length }}</span>
      </div>
      
      <div v-if="positions.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <Icon name="chart-bar" />
        </div>
        <p class="empty-state-title">Нет активных позиций</p>
        <span class="empty-state-text">Откройте новую позицию для начала торговли</span>
      </div>
      
      <div v-else class="positions-wrapper">
        <div class="positions-list">
          <div v-for="position in positions" :key="position.id" class="position-item">
            <div class="position-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge" :class="position.symbol === 'BTC' ? 'badge-btc' : 'badge-xrp'">
                  <Icon :name="position.symbol.toLowerCase()" size="14" />
                  {{ position.symbol }}
                </span>
                <span class="status status-open">
                  <Icon name="circle" /> Открыта
                </span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button @click="$emit('edit', position)" class="btn-icon" title="Продать">
                  <Icon name="coins" />
                </button>
                <button @click="deletePosition(position.id)" class="btn-icon btn-icon-danger" title="Удалить">
                  <Icon name="trash" />
                </button>
              </div>
            </div>
            
            <div class="position-info">
              <div class="info-row">
                <span class="label">ПОКУПКА</span>
                <span class="value">{{ position.buyQuantity }} × ${{ position.buyPrice.toFixed(2) }}</span>
              </div>
              <div class="info-row">
                <span class="label">СТОИМОСТЬ</span>
                <span class="value">${{ (position.buyQuantity * position.buyPrice).toFixed(2) }}</span>
              </div>
              <div class="info-row">
                <span class="label">ТЕКУЩАЯ ЦЕНА</span>
                <span class="value">${{ prices[position.symbol]?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="pnl-row">
                <span class="label">P&L</span>
                <span class="value pnl" :class="position.unrealizedPnl >= 0 ? 'profit' : 'loss'">
                  ${{ position.unrealizedPnl.toFixed(2) }} ({{ position.unrealizedPnl >= 0 ? '+' : '' }}{{ position.unrealizedPnlPercent.toFixed(2) }}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  positions: {
    type: Array,
    default: () => []
  },
  prices: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['edit', 'refresh'])

// Рассчитываем средние цены входа для каждой валюты
const avgPrices = computed(() => {
  const result = {}
  const groupedPositions = {}
  
  // Группируем позиции по символу
  props.positions.forEach(position => {
    if (!groupedPositions[position.symbol]) {
      groupedPositions[position.symbol] = []
    }
    groupedPositions[position.symbol].push(position)
  })
  
  // Рассчитываем средневзвешенную цену для каждого символа
  Object.keys(groupedPositions).forEach(symbol => {
    const positions = groupedPositions[symbol]
    let totalCost = 0
    let totalQuantity = 0
    
    positions.forEach(position => {
      totalCost += position.buyPrice * position.buyQuantity
      totalQuantity += position.buyQuantity
    })
    
    if (totalQuantity > 0) {
      result[symbol] = totalCost / totalQuantity
    }
  })
  
  return result
})

const deletePosition = async (id) => {
  if (!id) return
  
  const confirmMessage = 'Удалить позицию? Это действие нельзя отменить.'
  
  if (confirm(confirmMessage)) {
    try {
      await $fetch(`/api/trades/${id}`, { method: 'DELETE' })
      emit('refresh')
    } catch (error) {
      console.error('Error deleting position:', error)
      alert('Ошибка при удалении позиции: ' + (error.data?.statusMessage || error.message))
    }
  }
}
</script>

<style scoped>
.active-positions-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.positions-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.header-left h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avg-prices {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.avg-price-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avg-price-badge.badge-btc {
  background: rgba(240, 185, 11, 0.1);
  color: var(--yellow);
  border-color: rgba(240, 185, 11, 0.3);
}

.avg-price-badge.badge-xrp {
  background: rgba(35, 41, 47, 0.1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

.positions-wrapper {
  flex: 1;
  overflow: visible;
}

.positions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

@media (min-width: 1200px) {
  .positions-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .positions-list:has(.position-item:nth-child(3)) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

.position-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
}

.position-item:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.position-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row, .pnl-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.pnl-row {
  border-bottom: none;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 14px;
  font-weight: 600;
}

.pnl.profit { color: var(--success); }
.pnl.loss { color: var(--danger); }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state-text {
  font-size: 14px;
}

.status Icon {
  font-size: 8px;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .avg-prices {
    margin-left: 0;
  }
}
</style>