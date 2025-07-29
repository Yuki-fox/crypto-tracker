<template>
  <div class="card">
    <div class="card-header">
      <h2>
        <span style="color: var(--purple);">💼</span>
        Активные позиции
      </h2>
      <span class="badge badge-secondary">{{ positions.length }}</span>
    </div>
    
    <div v-if="positions.length === 0" class="empty-state">
      <div class="empty-state-icon">📊</div>
      <p class="empty-state-title">Нет активных позиций</p>
      <span class="empty-state-text">Откройте новую позицию для начала торговли</span>
    </div>
    
    <div v-else class="positions-list">
      <div v-for="position in positions" :key="position.id" class="position-item">
        <div class="position-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" :class="position.symbol === 'BTC' ? 'badge-btc' : 'badge-xrp'">
              {{ position.symbol }}
            </span>
            <span class="status status-open">🟢 Открыта</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button @click="$emit('edit', position)" class="btn-icon" title="Продать">
              💰
            </button>
            <button @click="deletePosition(position.id)" class="btn-icon btn-icon-danger" title="Удалить">
              🗑️
            </button>
          </div>
        </div>
        
        <div class="position-info">
          <div class="info-row">
            <span class="label">ПОКУПКА</span>
            <span class="value">{{ position.buyQuantity }} × ${{ position.buyPrice.toFixed(2) }}</span>
          </div>
          <div class="info-row">
            <span class="label">ПРОДАЖА</span>
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
</template>

<script setup>
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
.positions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
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
</style>