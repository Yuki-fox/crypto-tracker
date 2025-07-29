<template>
  <div class="card">
    <div class="card-header">
      <h2>
        <span style="color: var(--yellow);">📜</span>
        История закрытых позиций
      </h2>
      <span class="badge badge-secondary">{{ positions.length }}</span>
    </div>
    
    <div v-if="positions.length === 0" class="empty-state">
      <div class="empty-state-icon">📜</div>
      <p class="empty-state-title">Нет закрытых позиций</p>
      <span class="empty-state-text">Здесь будет отображаться история ваших сделок</span>
    </div>
    
    <div v-else class="table-container">
      <div class="table-header">
        <span>МОНЕТА</span>
        <span>ЦЕНА ВХОДА</span>
        <span>ЦЕНА ВЫХОДА</span>
        <span>КОЛИЧЕСТВО</span>
        <span>П/У</span>
        <span>%</span>
        <span>ДАТА</span>
      </div>
      
      <div class="table-body">
        <div v-for="position in positions" :key="position.id" class="table-row">
          <span class="badge" :class="position.symbol === 'BTC' ? 'badge-btc' : 'badge-xrp'">
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

const formatDate = (date) => {
  if (!date) return 'Н/Д'
  try {
    return new Date(date).toLocaleDateString('ru-RU')
  } catch {
    return date
  }
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 120px 120px 100px 100px 80px 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 120px 120px 100px 100px 80px 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  font-size: 14px;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.pnl.profit { color: var(--success); }
.pnl.loss { color: var(--danger); }

.date {
  color: var(--text-secondary);
  font-size: 13px;
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
  .table-header {
    display: none;
  }
  
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: var(--spacing-lg);
  }
}
</style>