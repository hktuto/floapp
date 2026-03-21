<script setup lang="ts">
interface Props {
  label: string
  precision?: number
  step?: number
  min?: number
  max?: number
  previousValue?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  precision: 1,
  step: 0.1,
  min: 0,
  max: 999,
  previousValue: null
})

const model = defineModel<number | null>()

// Initialize with previous value if model is null
onMounted(() => {
  if (model.value === null && props.previousValue !== null) {
    model.value = props.previousValue
  }
})

// Watch for previousValue changes
watch(() => props.previousValue, (newVal) => {
  if (model.value === null && newVal !== null) {
    model.value = newVal
  }
})

// Touch handling
const isDragging = ref(false)
const startX = ref(0)
const startValue = ref(0)

function onTouchStart(e: TouchEvent | MouseEvent) {
  isDragging.value = true

  const touchE = e as TouchEvent
  if (touchE.touches && touchE.touches.length > 0 && touchE.touches[0]) {
    startX.value = touchE.touches[0].clientX
  } else {
    startX.value = (e as MouseEvent).clientX
  }

  startValue.value = model.value ?? props.previousValue ?? 0

  document.addEventListener('mousemove', onTouchMove)
  document.addEventListener('mouseup', onTouchEnd)
  document.addEventListener('touchmove', onTouchMove)
  document.addEventListener('touchend', onTouchEnd)
}

function onTouchMove(e: TouchEvent | MouseEvent) {
  if (!isDragging.value) return

  let currentX = 0
  const touchE = e as TouchEvent
  if (touchE.touches && touchE.touches.length > 0 && touchE.touches[0]) {
    currentX = touchE.touches[0].clientX
  } else {
    currentX = (e as MouseEvent).clientX
  }

  const diffX = currentX - startX.value

  // 每 10px = 1 step
  const steps = Math.round(diffX / 10)
  let newValue = startValue.value + (steps * props.step)

  // Apply precision
  newValue = Math.round(newValue * Math.pow(10, props.precision)) / Math.pow(10, props.precision)

  // Clamp to min/max
  newValue = Math.max(props.min, Math.min(props.max, newValue))

  model.value = newValue
}

function onTouchEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', onTouchMove)
  document.removeEventListener('mouseup', onTouchEnd)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
}

// Calculate difference from previous value
const difference = computed(() => {
  if (props.previousValue === null || model.value === null || model.value === undefined) {
    return null
  }
  return model.value - props.previousValue
})

const differenceText = computed(() => {
  if (difference.value === null) return ''
  const sign = difference.value > 0 ? '+' : ''
  return `${sign}${difference.value.toFixed(props.precision)}`
})

const differenceColor = computed(() => {
  if (difference.value === null) return ''
  return difference.value <= 0 ? 'text-green-600' : 'text-red-500'
})

// Format display value
const displayValue = computed(() => {
  if (model.value === null || model.value === undefined) return '--'
  return model.value.toFixed(props.precision)
})

// Direct input modal
const isOpen = ref(false)
const inputValue = ref('')

function openModal() {
  isOpen.value = true
  inputValue.value = model.value?.toString() ?? ''
}

function closeModal() {
  isOpen.value = false
}

function confirmInput() {
  const val = parseFloat(inputValue.value)
  if (!isNaN(val)) {
    model.value = Math.max(props.min, Math.min(props.max, val))
  }
  closeModal()
}
</script>

<template>
  <div class="slide-input min-w-[120px]">
    <!-- Label -->
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs text-gray-500">{{ label }}</span>
      <!-- Difference badge -->
      <span
        v-if="differenceText"
        class="text-xs font-medium px-1.5 py-0.5 rounded"
        :class="differenceColor"
      >
        {{ differenceText }}
      </span>
    </div>
    <!-- Trigger -->
    <div
      class="relative text-4xl font-bold text-center py-3 px-2 rounded-lg transition-all cursor-pointer select-none"
      :class="{
        'bg-primary-50 text-primary-700 scale-[1.02]': isDragging,
        'bg-gray-50 text-gray-700 hover:bg-gray-100': !isDragging
      }"
      @mousedown="onTouchStart"
      @touchstart="onTouchStart"
      @dblclick="openModal"
    >
      <span>{{ displayValue }}</span>

      <!-- Edit hint -->
      <UIcon
        name="i-lucide-pencil"
        class="absolute top-1 right-1 w-4 h-4 text-gray-400 opacity-0 hover:opacity-100 transition-opacity"
      />
    </div>

    <!-- Value Display -->
    <UModal v-model:open="isOpen" :title="label">


      <!-- Modal Content -->
      <template #content>
        <div class="p-4 space-y-4">
          <div class="text-center">
            <div v-if="previousValue !== null" class="text-sm text-gray-500 mb-2">
              上次記錄: {{ previousValue.toFixed(precision) }}
            </div>
            <div v-else class="text-sm text-gray-400 mb-2">
              未有上次記錄
            </div>
          </div>

          <UInput
            v-model="inputValue"
            type="number"
            :step="step"
            class="text-center text-2xl"
            placeholder="輸入數值"
            autofocus
            @keyup.enter="confirmInput"
          />

          <div class="flex gap-2">
            <UButton color="primary" class="flex-1" @click="confirmInput">
              確認
            </UButton>
            <UButton variant="soft" @click="closeModal">
              取消
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Hint text -->
    <div class="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1">
      <UIcon name="i-lucide-move-horizontal" class="w-3 h-3" />
      <span>滑動調整 · 雙擊輸入</span>
    </div>
  </div>
</template>

<style scoped>
.slide-input {
  touch-action: pan-y;
  user-select: none;
}
.slide-input > div:nth-child(2):active {
  cursor: grabbing;
}
</style>
