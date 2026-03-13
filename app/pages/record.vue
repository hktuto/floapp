<script setup lang="ts">
const loading = ref(false)
const error = ref('')

// Form fields
const formData = ref({
  weightKg: null as number | null,
  bodyFatPct: null as number | null,
  muscleKg: null as number | null,
  waterPct: null as number | null,
  boneKg: null as number | null,
  visceralFat: null as number | null,
  chestCm: null as number | null,
  waistCm: null as number | null,
  hipsCm: null as number | null,
  thighCm: null as number | null,
  armCm: null as number | null,
  note: ''
})

interface MeasurementRecord {
  id: string
  recordedAt: string
  weightKg: number
  bodyFatPct: number | null
  muscleKg: number | null
  waterPct: number | null
  boneKg: number | null
  visceralFat: number | null
  chestCm: number | null
  waistCm: number | null
  hipsCm: number | null
  thighCm: number | null
  armCm: number | null
  note: string | null
}

// Records from API
const records = ref<MeasurementRecord[]>([])

// Fetch records on mount
async function fetchRecords() {
  try {
    const data = await $fetch<MeasurementRecord[]>('/api/measurements', {
      query: { limit: 10 }
    })
    records.value = data
  } catch (e: any) {
    console.error('Failed to fetch records:', e)
  }
}

onMounted(() => {
  fetchRecords()
})

// Get the most recent record for comparison
const lastRecord = computed(() => {
  return records.value.length > 0 ? records.value[0] : null
})

async function onSubmit() {
  if (!formData.value.weightKg) {
    error.value = '請輸入體重'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // Save to database via API
    const result = await $fetch<{ success: boolean; record: MeasurementRecord }>('/api/measurements', {
      method: 'POST',
      body: {
        recordedAt: new Date().toISOString().split('T')[0],
        weightKg: formData.value.weightKg,
        bodyFatPct: formData.value.bodyFatPct,
        muscleKg: formData.value.muscleKg,
        waterPct: formData.value.waterPct,
        boneKg: formData.value.boneKg,
        visceralFat: formData.value.visceralFat,
        chestCm: formData.value.chestCm,
        waistCm: formData.value.waistCm,
        hipsCm: formData.value.hipsCm,
        thighCm: formData.value.thighCm,
        armCm: formData.value.armCm,
        note: formData.value.note || null
      }
    })
    
    if (result.success) {
      // Add new record to list
      records.value.unshift(result.record)
      
      // Reset form
      formData.value = {
        weightKg: null,
        bodyFatPct: null,
        muscleKg: null,
        waterPct: null,
        boneKg: null,
        visceralFat: null,
        chestCm: null,
        waistCm: null,
        hipsCm: null,
        thighCm: null,
        armCm: null,
        note: ''
      }
      
      // Show success message
      alert('記錄保存成功！')
    }
  } catch (e: any) {
    error.value = e.data?.message || '保存失敗，請重試'
    console.error('Failed to save record:', e)
  } finally {
    loading.value = false
  }
}

const columns: any[] = [
  { accessorKey: 'recordedAt', header: '日期' },
  { accessorKey: 'weightKg', header: '體重 (kg)' },
  { accessorKey: 'bodyFatPct', header: '體脂 (%)' }
]
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">記錄體重</h1>
    
    <!-- Error Alert -->
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :title="error"
      class="mb-4"
    />
    
    <!-- Add Record Form with SlideInput -->
    <MeasurementForm
      v-model:weightKg="formData.weightKg"
      v-model:bodyFatPct="formData.bodyFatPct"
      v-model:muscleKg="formData.muscleKg"
      v-model:waterPct="formData.waterPct"
      v-model:boneKg="formData.boneKg"
      v-model:visceralFat="formData.visceralFat"
      v-model:chestCm="formData.chestCm"
      v-model:waistCm="formData.waistCm"
      v-model:hipsCm="formData.hipsCm"
      v-model:thighCm="formData.thighCm"
      v-model:armCm="formData.armCm"
      v-model:note="formData.note"
      v-model:loading="loading"
      :previous-record="lastRecord"
      @submit="onSubmit"
    />
    
    <!-- History Table -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-history" class="text-primary" />
          <span class="font-semibold">歷史記錄</span>
        </div>
      </template>
      
      <UTable :data="records" :columns="columns" />
    </UCard>
    
    <!-- Simple Chart Placeholder -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-down" class="text-primary" />
          <span class="font-semibold">進度趨勢</span>
        </div>
      </template>
      
      <div class="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p class="text-gray-500">📊 圖表功能即將推出</p>
      </div>
    </UCard>
  </div>
</template>
