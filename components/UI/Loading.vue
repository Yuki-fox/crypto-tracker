<template>
  <div class="loading">
    <div class="loading-spinner"></div>
    <span v-if="text">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: 'Загрузка...' }
})
</script>