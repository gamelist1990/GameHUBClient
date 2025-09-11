<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, onMounted } from 'vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  show: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const visible = ref(props.show)

watch(() => props.show, (v) => {
  visible.value = v
  if (v && props.duration && props.duration > 0) {
    setTimeout(() => {
      visible.value = false
      emits('close')
    }, props.duration)
  }
})

onMounted(() => {
  if (props.show && props.duration && props.duration > 0) {
    setTimeout(() => {
      visible.value = false
      emits('close')
    }, props.duration)
  }
})
</script>

<template>
  <transition name="toast-slide">
    <div v-if="visible" :class="['toast', props.type || 'info']" role="status" aria-live="polite">
      <div class="toast-content">{{ props.message }}</div>
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  right: 20px;
  top: 20px;
  min-width: 220px;
  max-width: 360px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(16,24,40,0.12);
  z-index: 9999;
  font-weight: 600;
}

.toast.success { background: linear-gradient(90deg,#16a34a,#059669); }
.toast.error { background: linear-gradient(90deg,#ef4444,#dc2626); }
.toast.info { background: linear-gradient(90deg,#3b82f6,#2563eb); }

.toast-content { font-size: 14px; }

/* slide + fade */
.toast-slide-enter-from {
  transform: translateY(-12px) translateX(16px) scale(0.98);
  opacity: 0;
}
.toast-slide-enter-active {
  transition: all 240ms cubic-bezier(.2,.9,.2,1);
}
.toast-slide-enter-to {
  transform: translateY(0) translateX(0) scale(1);
  opacity: 1;
}
.toast-slide-leave-from {
  transform: translateY(0) translateX(0) scale(1);
  opacity: 1;
}
.toast-slide-leave-active {
  transition: all 200ms ease-in;
}
.toast-slide-leave-to {
  transform: translateY(-6px) translateX(8px) scale(0.98);
  opacity: 0;
}
</style>
