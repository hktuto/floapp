<script setup lang="ts">
definePageMeta({
  layout: 'onboarding'
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const showMore = ref(false)

const record = ref({
  weightKg: '' as string,
  bodyFatPct: '' as string,
  muscleKg: '' as string,
  waistCm: '' as string,
  note: ''
})

async function saveRecord() {
  if (!record.value.weightKg) {
    error.value = '請至少輸入體重'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await $fetch('/api/measurements', {
      method: 'POST',
      body: {
        recordedAt: new Date().toISOString().split('T')[0],
        weightKg: record.value.weightKg ? parseFloat(record.value.weightKg) : null,
        bodyFatPct: record.value.bodyFatPct ? parseFloat(record.value.bodyFatPct) : null,
        muscleKg: record.value.muscleKg ? parseFloat(record.value.muscleKg) : null,
        waistCm: record.value.waistCm ? parseFloat(record.value.waistCm) : null,
        note: record.value.note || null
      }
    })
    
    success.value = true
    
    setTimeout(() => {
      navigateTo('/first-target')
    }, 1500)
  } catch (e: any) {
    error.value = e.data?.message || '保存失敗'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <!-- Step Indicator -->
    <div class="flex items-center justify-center gap-2 mb-8">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold"><UIcon name="i-lucide-check" class="w-4 h-4" /></div>
        <div class="w-12 h-1 bg-primary"></div>
        <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
        <div class="w-12 h-1 bg-gray-200"></div>
        <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
      </div>
    </div>
    
    <div v-if="success" class="text-center py-12">
      <UIcon name="i-lucide-check-circle" class="w-20 h-20 text-green-500 mx-auto mb-4" />
      <h2 class="text-2xl font-bold mb-2">記錄成功！</h2>
      <p class="text-gray-500">正在前往設定目標...</p>
    </div>
    
    <div v-else>
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2">記錄你嘅第一個數據</h1>
        <p class="text-gray-500">只需輸入體重即可開始</p>
      </div>
      
      <form @submit.prevent="saveRecord" class="space-y-4">
        <UCard class="border-2 border-primary">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-scale" class="text-primary" />
              <span class="font-semibold">體重 (kg) *</span>
            </div>
          </template>
          
          <UInput
            v-model="record.weightKg"
            type="number"
            step="0.1"
            placeholder="例如：70.5"
            class="w-full"
          />
        </UCard>
        
        <UCard class="overflow-hidden">
          <button
            type="button"
            class="flex items-center gap-2 w-full p-4 text-left"
            @click="showMore = !showMore"
          >
            <UIcon name="i-lucide-plus-circle" class="text-primary" />
            <span class="font-semibold">更多數據（可選）</span>
            <UIcon 
              name="i-lucide-chevron-down" 
              class="ml-auto transition-transform"
              :class="{ 'rotate-180': showMore }"
            />
          </button>
          
          <div v-show="showMore" class="px-4 pb-4">
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="體脂 (%)">
                <UInput v-model="record.bodyFatPct" type="number" step="0.1" placeholder="18.5" />
              </UFormField>
              
              <UFormField label="肌肉 (kg)">
                <UInput v-model="record.muscleKg" type="number" step="0.1" placeholder="32.0" />
              </UFormField>
              
              <UFormField label="腰圍 (cm)">
                <UInput v-model="record.waistCm" type="number" step="0.1" placeholder="78.0" />
              </UFormField>
            </div>
          </div>
        </UCard>
        
        <UAlert v-if="error" color="error" variant="soft" :title="error" />
        
        <div class="flex gap-3 pt-4">
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            class="flex-1"
          >
            下一步
            <UIcon name="i-lucide-arrow-right" class="ml-2" />
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
