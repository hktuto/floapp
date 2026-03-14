<script setup lang="ts">
const props = defineProps<{
  modelValue?: string  // 當前頭像 URL
}>()

const emit = defineEmits<{
  'update:modelValue': [url: string]
}>()

// 狀態
const isUploading = ref(false)
const showCropper = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 點擊上傳
function onClickUpload() {
  fileInputRef.value?.click()
}

// 選擇文件
function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  // 驗證文件類型
  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片文件')
    return
  }
  
  // 驗證文件大小（最大 5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('圖片大小不能超過 5MB')
    return
  }
  
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  showCropper.value = true
  
  // 清空 input，允許再次選擇同一文件
  input.value = ''
}

// 裁切完成
async function onCrop(blob: Blob) {
  isUploading.value = true
  
  try {
    // 創建 FormData
    const formData = new FormData()
    formData.append('image', blob, 'avatar.jpg')
    
    // 上傳到服務器
    const result = await $fetch<{ success: boolean; url: string }>('/api/avatar/upload', {
      method: 'POST',
      body: formData
    })
    
    if (result.success) {
      emit('update:modelValue', result.url)
      showCropper.value = false
      previewUrl.value = null
    }
  } catch (error) {
    console.error('Upload failed:', error)
    alert('上傳失敗，請重試')
  } finally {
    isUploading.value = false
  }
}

// 取消裁切
function onCancelCrop() {
  showCropper.value = false
  previewUrl.value = null
  selectedFile.value = null
}

// 刪除頭像
async function onDelete() {
  if (!confirm('確定要刪除頭像嗎？')) return
  
  try {
    await $fetch('/api/avatar/delete', { method: 'DELETE' })
    emit('update:modelValue', '')
  } catch (error) {
    console.error('Delete failed:', error)
  }
}
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- 當前頭像顯示 -->
    <div class="relative group">
      <div
        class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200"
        :class="{ 'border-primary': modelValue }"
      >
        <img
          v-if="modelValue"
          :src="modelValue"
          class="w-full h-full object-cover"
          alt="Avatar"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
        >
          <UIcon name="i-lucide-user" class="w-16 h-16 text-gray-300" />
        </div>
      </div>
      
      <!-- Hover 覆蓋層 -->
      <div
        class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        @click="onClickUpload"
      >
        <UIcon name="i-lucide-camera" class="w-8 h-8 text-white" />
      </div>
      
      <!-- 刪除按鈕（如果有頭像）-->
      <button
        v-if="modelValue"
        class="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
        @click="onDelete"
      >
        <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
      </button>
    </div>
    
    <!-- 上傳按鈕 -->
    <UButton
      v-if="!modelValue"
      variant="ghost"
      size="sm"
      class="mt-3"
      :loading="isUploading"
      @click="onClickUpload"
    >
      <UIcon name="i-lucide-upload" class="mr-2" />
      上傳頭像
    </UButton>
    
    <!-- 隱藏的文件輸入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileSelect"
    />
    
    <!-- 裁切 Modal -->
    <UModal v-model:open="showCropper" >
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-crop" class="text-primary" />
            <span class="font-semibold">裁切頭像</span>
          </div>
        </template>
        
        <AvatarCropper
          v-if="previewUrl"
          :image-src="previewUrl"
          @crop="onCrop"
          @cancel="onCancelCrop"
        />
        
      </UCard>
    </UModal>
  </div>
</template>
