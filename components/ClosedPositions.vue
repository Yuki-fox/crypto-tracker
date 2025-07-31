<template>
  <div class="card">
    <div class="card-header">
      <h2>
        <Icon name="history" :style="{ color: 'var(--yellow)' }" />
        История закрытых позиций
      </h2>
      <span class="badge badge-secondary">{{ positions.length }}</span>
    </div>
    
    <div v-if="positions.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <Icon name="scroll" />
      </div>
      <p class="empty-state-title">Нет закрытых позиций</p>
      <span class="empty-state-text">Здесь будет отображаться история ваших сделок</span>
    </div>
    
    <!-- Десктопная версия -->
    <div v-else class="table-wrapper desktop-only">
      <div class="table-container">
        <div class="table-header">
          <span>МОНЕТА</span>
          <span>ЦЕНА ВХОДА</span>
          <span>ЦЕНА ВЫХОДА</span>
          <span>КОЛИЧЕСТВО</span>
          <span>П/У</span>
          <span>%</span>
          <span>ДАТА</span>
          <span class="action-col">ДЕЙСТВИЯ</span>
        </div>
        
        <div class="table-body">
          <div v-for="position in positions" :key="position.id" class="table-row">
            <span class="badge" :class="position.symbol === 'BTC' ? 'badge-btc' : 'badge-xrp'">
              <Icon :name="position.symbol.toLowerCase()" size="14" />
              {{ position.symbol }}
            </span>
            <span>${{ position.buyPrice.toFixed(2) }}</span>
            <span>${{ position.sellPrice?.toFixed(2) || '0.00' }}</span>
            <span>{{ position.sellQuantity || position.buyQuantity }}</span>
            <span class="pnl" :class="position.pnl >= 0 ? 'profit' : 'loss'">
              ${{ position.pnl.toFixed(2) }}
            </span>
            <span class="pnl" :class="position.pnl >= 0 ? 'profit' : 'loss'">
              {{ position.pnl >= 0 ? '+' : '' }}{{ position.pnlPercent.toFixed(2) }}%
            </span>
            <span class="date">{{ formatDate(position.sellDate) }}</span>
            <span class="action-col">
              <button @click="deletePosition(position.id)" class="btn-icon btn-icon-danger" title="Удалить">
                <Icon name="trash" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Мобильная версия -->
    <div v-else class="mobile-positions mobile-only">
      <div v-for="position in positions" :key="`mobile-${position.id}`" class="mobile-position-card">
        <div class="mobile-position-header">
          <span class="badge" :class="position.symbol === 'BTC' ? 'badge-btc' : 'badge-xrp'">
            <Icon :name="position.symbol.toLowerCase()" size="14" />
            {{ position.symbol }}
          </span>
          <button @click="deletePosition(position.id)" class="btn-icon btn-icon-danger" title="Удалить">
            <Icon name="trash" />
          </button>
        </div>
        <div class="mobile-position-info">
          <div class="info-row">
            <span class="label">Вход:</span>
            <span class="value">${{ position.buyPrice.toFixed(2) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Выход:</span>
            <span class="value">${{ position.sellPrice?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Количество:</span>
            <span class="value">{{ position.sellQuantity || position.buyQuantity }}</span>
          </div>
          <div class="info-row">
            <span class="label">П/У:</span>
            <span class="value pnl" :class="position.pnl >= 0 ? 'profit' : 'loss'">
              ${{ position.pnl.toFixed(2) }} ({{ position.pnl >= 0 ? '+' : '' }}{{ position.pnlPercent.toFixed(2) }}%)
            </span>
          </div>
          <div class="info-row">
            <span class="label">Дата:</span>
            <span class="value">{{ formatDate(position.sellDate) }}</span>
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
  }
})

const emit = defineEmits(['refresh'])

const formatDate = (date) => {
  if (!date) return 'Н/Д'
  try {
    return new Date(date).toLocaleDateString('ru-RU')
  } catch {
    return date
  }
}

const deletePosition = async (id) => {
  if (!id) return
  
  const confirmMessage = 'Удалить позицию из истории? Это действие нельзя отменить.'
  
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
.table-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.table-container {
  width: 100%;
  max-width: 1200px;
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 120px 120px 100px 100px 80px 100px 80px;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 120px 120px 100px 100px 80px 100px 80px;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: center;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.action-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Стили для иконок */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.pnl.profit { color: var(--success); }
.pnl.loss { color: var(--danger); }

.date {
  color: var(--text-secondary);
  font-size: 13px;
}

/* Мобильные стили */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

.mobile-positions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.mobile-position-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--spacing-md);
}

.mobile-position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border);
}

.mobile-position-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-position-info .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.mobile-position-info .label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-position-info .value {
  font-weight: 600;
  text-align: right;
}

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

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
}
</style>