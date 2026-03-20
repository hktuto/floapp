<script setup lang="ts">
definePageMeta({
  layout: 'onboarding'
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

// Default target date (3 months from now)
const defaultDate = new Date()
defaultDate.setMonth(defaultDate.getMonth() + 3)

const target = ref({
  targetType: 'weight' as string,
  targetValue: '' as string,
  targetDate: defaultDate.toISOString().split('T')[0] as string
})

async function saveTarget() {
  if (!target.value.targetValue) {
    error.value = '請輸入目標數值'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await $fetch('/api/targets', {
      method: 'POST',
      body: {
        targetType: target.value.targetType,
        targetValue: parseFloat(target.value.targetValue),
        targetDate: target.value.targetDate || null
      }
    })
    
    success.value = true
    
    setTimeout(() => {
      navigateTo('/dashboard')
    }, 1500)
  } catch (e: any) {
    error.value = e.data?.message || '保存失敗'
  } finally {
    loading.value = false
  }
}

function skip() {
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <!-- Step Indicator -->
    <div class="flex items-center justify-center gap-2 mb-8">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold"><UIcon name="i-lucide-check" class="w-4 h-4" /></div>
        <div class="w-12 h-1 bg-green-500"></div>
        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold"><UIcon name="i-lucide-check" class="w-4 h-4" /></div>
        <div class="w-12 h-1 bg-primary"></div>
        <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
      </div>
    </div>
    
    <div v-if="success" class="text-center py-12">
      <UIcon name="i-lucide-check-circle" class="w-20 h-20 text-green-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold mb-2">目標已設定！</h2>
      <p class="text-gray-500">正在前往主頁面...</p>
    </div>
    
    <div v-else>
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2">設定你嘅第一個目標</h1>
        <p class="text-gray-500">有目標會令你更有動力！</p>
      </div>
      
      <UCard class="shadow-lg">
        <form @submit.prevent="saveTarget" class="space-y-4">
          <UFormField label="目標類型">
            <USelect
              v-model="target.targetType"
              :items="[
                { label: '體重 (kg)', value: 'weight' },
                { label: '體脂 (%)', value: 'body_fat' },
                { label: '腰圍 (cm)', value: 'waist' },
                { label: '臀圍 (cm)', value: 'hips' }
              ]"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="目標數值">
            <UInput
              v-model="target.targetValue"
              type="number"
              step="0.1"
              placeholder="例如：65"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="目標日期">
            <UInput
              v-model="target.targetDate"
              type="date"
              class="w-full"
            />
            <p class="text-xs text-gray-400 mt-1">預設為 3 個月後</p>
          </UFormField>
          
          <UAlert v-if="error" color="error" variant="soft" :title="error" />
          
          <div class="flex gap-3 pt-4">
            <UButton
              type="submit"
              color="primary"
              :loading="loading"
              class="flex-1"
            >
              設定目標
              <UIcon name="i-lucide-check" class="ml-2" />
            </UButton>
          </div>
          
          <div class="text-center">
            <UButton
              type="button"
              variant="ghost"
              size="sm"
              @click="skip"
            >
              跳過，稍後再說
            </UButton>
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template>
