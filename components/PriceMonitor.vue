<template>
  <div class="price-monitor" v-if="prices && Object.keys(prices).length > 0">
    <div v-for="(price, symbol) in prices" :key="symbol" class="price-card">
      <div class="price-symbol">
        <span class="symbol-icon">
          <Icon :name="symbol.toLowerCase()" size="20" />
        </span>
        <span>{{ symbol }}</span>
      </div>
      <div class="price-value">${{ (price || 0).toFixed(2) }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  prices: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
.price-monitor {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.price-card {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.3s ease;
}

.price-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.price-symbol {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--spacing-md);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.symbol-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  background: var(--bg-tertiary);
  color: var(--accent);
}

.price-value {
  font-size: 28px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .price-monitor {
    flex-direction: column;
  }
}
</style>