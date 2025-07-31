<template>
  <i v-if="name === 'btc' || name === 'bitcoin'" class="fab fa-bitcoin" :class="className"></i>
  <svg v-else-if="name === 'xrp' || name === 'ripple'" 
       viewBox="0 0 512 512" 
       xmlns="http://www.w3.org/2000/svg" 
       :width="size" 
       :height="size" 
       fill="currentColor"
       :class="className">
    <path d="M155.2 141.3l-27.9-27.9c-2.1-2.1-5.6-2.1-7.8 0L73 159.9c-2.1 2.1-2.1 5.6 0 7.8l46.5 46.5c2.1 2.1 5.6 2.1 7.8 0L256 85.5 155.2 141.3zM356.8 370.7l27.9 27.9c2.1 2.1 5.6 2.1 7.8 0L439 352.1c2.1-2.1 2.1-5.6 0-7.8l-46.5-46.5c-2.1-2.1-5.6-2.1-7.8 0L256 426.5 356.8 370.7zM384.5 214.2c2.1 2.1 5.6 2.1 7.8 0l46.5-46.5c2.1-2.1 2.1-5.6 0-7.8l-46.5-46.5c-2.1-2.1-5.6-2.1-7.8 0L256 242.1 127.3 113.4c-2.1-2.1-5.6-2.1-7.8 0L73 159.9c-2.1 2.1-2.1 5.6 0 7.8L256 350.7 384.5 214.2zM127.5 297.8c-2.1-2.1-5.6-2.1-7.8 0L73.2 344.3c-2.1 2.1-2.1 5.6 0 7.8l46.5 46.5c2.1 2.1 5.6 2.1 7.8 0L256 269.9 384.7 398.6c2.1 2.1 5.6 2.1 7.8 0l46.5-46.5c2.1-2.1 2.1-5.6 0-7.8L256 161.3 127.5 297.8z"/>
  </svg>
  <i v-else class="fas" :class="iconClass"></i>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: '1em'
  },
  class: {
    type: String,
    default: ''
  }
})

const className = computed(() => props.class)

// Маппинг имен иконок на классы Font Awesome
const iconClass = computed(() => {
  const iconMap = {
    'rocket': 'fa-rocket',
    'chart-line': 'fa-chart-line',
    'briefcase': 'fa-briefcase',
    'history': 'fa-history',
    'coins': 'fa-coins',
    'trash': 'fa-trash',
    'check': 'fa-check',
    'times': 'fa-times',
    'plus': 'fa-plus',
    'spinner': 'fa-spinner fa-spin',
    'sign-out': 'fa-sign-out-alt',
    'circle': 'fa-circle',
    'chart-bar': 'fa-chart-bar',
    'scroll': 'fa-scroll',
    'user': 'fa-user',
    'lock': 'fa-lock',
    'sign-in': 'fa-sign-in-alt',
    'exclamation-circle': 'fa-exclamation-circle',
    'check-circle': 'fa-check-circle',
    'calculator': 'fa-calculator'
  }
  
  return iconMap[props.name] || 'fa-question-circle'
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>