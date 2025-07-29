<template>
  <div class="empty-state">
    <div class="empty-state-icon">{{ icon }}</div>
    <p class="empty-state-title">{{ title }}</p>
    <span class="empty-state-text">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📊' },
  title: { type: String, required: true },
  text: { type: String, required: true }
})
</script>