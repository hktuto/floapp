<script setup lang="ts">
const props = defineProps<{
  imageSrc: string
}>()

const emit = defineEmits<{
  crop: [blob: Blob]
  cancel: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasSize = 300
const image = ref<HTMLImageElement | null>(null)
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartOffsetX = ref(0)
const dragStartOffsetY = ref(0)

onMounted(() => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    image.value = img
    const minScale = Math.max(
      canvasSize / img.width,
      canvasSize / img.height
    )
    scale.value = minScale
    offsetX.value = (canvasSize - img.width * scale.value) / 2
    offsetY.value = (canvasSize - img.height * scale.value) / 2
    draw()
  }
  img.src = props.imageSrc
})

function draw() {
  const canvas = canvasRef.value
  const img = image.value
  if (!canvas || !img) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  
  ctx.drawImage(
    img,
    offsetX.value,
    offsetY.value,
    img.width * scale.value,
    img.height * scale.value
  )
}

function zoomIn() {
  scale.value = Math.min(scale.value * 1.2, 5)
  draw()
}

function zoomOut() {
  const img = image.value
  if (!img) return
  const minScale = Math.max(canvasSize / img.width, canvasSize / img.height)
  scale.value = Math.max(scale.value / 1.2, minScale)
  draw()
}

function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartOffsetX.value = offsetX.value
  dragStartOffsetY.value = offsetY.value
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - dragStartX.value
  const deltaY = e.clientY - dragStartY.value
  
  offsetX.value = dragStartOffsetX.value + deltaX
  offsetY.value = dragStartOffsetY.value + deltaY
  
  draw()
}

function onMouseUp() {
  isDragging.value = false
}

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  
  isDragging.value = true
  dragStartX.value = touch.clientX
  dragStartY.value = touch.clientY
  dragStartOffsetX.value = offsetX.value
  dragStartOffsetY.value = offsetY.value
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  
  const touch = e.touches[0]
  if (!touch) return
  
  const deltaX = touch.clientX - dragStartX.value
  const deltaY = touch.clientY - dragStartY.value
  
  offsetX.value = dragStartOffsetX.value + deltaX
  offsetY.value = dragStartOffsetY.value + deltaY
  
  draw()
}

function onTouchEnd() {
  isDragging.value = false
}

function crop() {
  const img = image.value
  if (!img) return
  
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvasSize
  tempCanvas.height = canvasSize
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return
  
  tempCtx.drawImage(
    img,
    offsetX.value,
    offsetY.value,
    img.width * scale.value,
    img.height * scale.value
  )
  
  tempCanvas.toBlob((blob) => {
    if (blob) {
      emit('crop', blob)
    }
  }, 'image/jpeg', 0.9)
}

function reset() {
  const img = image.value
  if (!img) return
  const minScale = Math.max(
    canvasSize / img.width,
    canvasSize / img.height
  )
  scale.value = minScale
  offsetX.value = (canvasSize - img.width * scale.value) / 2
  offsetY.value = (canvasSize - img.height * scale.value) / 2
  draw()
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    
    <div
      class="relative border-2 border-gray-200 rounded-lg overflow-hidden"
      :style="{ width: canvasSize + 'px', height: canvasSize + 'px' }"
    >
      <canvas
        ref="canvasRef"
        :width="canvasSize"
        :height="canvasSize"
        class="cursor-move touch-none block"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      />
    </div>
    
    <div class="flex items-center gap-2">
      <UButton variant="ghost" size="sm" icon="i-lucide-zoom-out" @click="zoomOut" />
      <span class="text-sm text-gray-500 w-16 text-center">{{ Math.round(scale * 100) }}%</span>
      <UButton variant="ghost" size="sm" icon="i-lucide-zoom-in" @click="zoomIn" />
      <UDivider orientation="vertical" class="h-6" />
      <UButton variant="ghost" size="sm" icon="i-lucide-rotate-ccw" @click="reset">重置</UButton>
    </div>
    
    <p class="text-xs text-gray-400">拖動移動，雙擊縮放</p>
    
    <div class="flex gap-3 pt-2">
      <UButton variant="ghost" @click="$emit('cancel')">取消</UButton>
      <UButton color="primary" @click="crop">
        <UIcon name="i-lucide-crop" class="mr-2" />確認裁切
      </UButton>
    </div>
  </div>
</template>

<style scoped>
canvas {
  touch-action: none;
  user-select: none;
}
</style>
