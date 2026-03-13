<script setup lang="ts">
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

interface Target {
  id: string
  targetType: string
  targetValue: number
  targetDate: string | null
  status: string
}

const drawerOpen = ref(false)
const loading = ref(true)
const saving = ref(false)

const latestRecord = ref<MeasurementRecord | null>(null)
const recentRecords = ref<MeasurementRecord[]>([])
const activeTargets = ref<Target[]>([])

// Form data for MeasurementForm
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

async function fetchDashboardData() {
  try {
    loading.value = true
    
    // Fetch recent records with all fields
    const records = await $fetch<MeasurementRecord[]>('/api/measurements', {
      query: { limit: 5 }
    })
    recentRecords.value = records
    latestRecord.value = records[0] || null
    
    // Fetch active targets
    const targets = await $fetch<Target[]>('/api/targets')
    activeTargets.value = targets.filter(t => t.status === 'active')
  } catch (e) {
    console.error('Failed to fetch dashboard data:', e)
  } finally {
    loading.value = false
  }
}

function openDrawer() {
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
  drawerOpen.value = true
}

async function saveRecord() {
  if (!formData.value.weightKg) {
    return
  }
  
  saving.value = true
  
  try {
    await $fetch('/api/measurements', {
      method: 'POST',
      body: {
        recordedAt: new Date().toISOString().split('T')[0],
        ...formData.value
      }
    })
    
    // Check if user has previous records before saving
    const hasPreviousRecords = recentRecords.value.length > 0
    // Close drawer
    drawerOpen.value = false
    // If user has previous records, redirect to result page
    if (hasPreviousRecords) {
      navigateTo("/result")
    } else {
      // Otherwise just refresh dashboard
      await fetchDashboardData()
    }
  } catch (e) {
    console.error('Failed to save record:', e)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

function getTargetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    weight: '體重',
    body_fat: '體脂',
    muscle: '肌肉',
    waist: '腰圍',
    hips: '臀圍',
    chest: '胸圍',
    thigh: '大腿圍',
    arm: '手臂圍'
  }
  return labels[type] || type
}

function getTargetUnit(type: string): string {
  const units: Record<string, string> = {
    weight: 'kg',
    body_fat: '%',
    muscle: 'kg',
    waist: 'cm',
    hips: 'cm',
    chest: 'cm',
    thigh: 'cm',
    arm: 'cm'
  }
  return units[type] || ''
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Welcome Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">儀表板</h1>
        <p class="text-gray-500">追蹤你嘅進度</p>
      </div>
      
      <!-- Drawer Trigger Button -->
      <UDrawer v-model:open="drawerOpen" :scale-background="true">
        <UButton color="primary" icon="i-lucide-plus" @click="openDrawer">
          記錄
        </UButton>
        
        <template #content>
          <div class="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-lucide-scale" class="text-primary" />
              <span class="font-semibold text-lg">新增記錄</span>
            </div>
            
            <MeasurementForm
              v-model:weight-k-g="formData.weightKg"
              v-model:body-fat-pct="formData.bodyFatPct"
              v-model:muscle-k-g="formData.muscleKg"
              v-model:water-pct="formData.waterPct"
              v-model:bone-k-g="formData.boneKg"
              v-model:visceral-fat="formData.visceralFat"
              v-model:chest-cm="formData.chestCm"
              v-model:waist-cm="formData.waistCm"
              v-model:hips-cm="formData.hipsCm"
              v-model:thigh-cm="formData.thighCm"
              v-model:arm-cm="formData.armCm"
              v-model:note="formData.note"
              v-model:loading="saving"
              :previous-record="latestRecord"
              @submit="saveRecord"
            />
            
          </div>
        </template>
      </UDrawer>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>
    
    <div v-else class="space-y-6">
      <!-- Latest Record Card -->
      <UCard v-if="latestRecord">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-scale" class="text-primary" />
            <span class="font-semibold">最新記錄</span>
            <span class="text-sm text-gray-400 ml-auto">{{ latestRecord.recordedAt }}</span>
          </div>
        </template>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-500 mb-1">體重</p>
            <p class="text-3xl font-bold text-primary">{{ latestRecord.weightKg }}</p>
            <p class="text-sm text-gray-400">kg</p>
          </div>
          
          <div v-if="latestRecord.bodyFatPct" class="text-center p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-500 mb-1">體脂</p>
            <p class="text-3xl font-bold text-primary">{{ latestRecord.bodyFatPct }}</p>
            <p class="text-sm text-gray-400">%</p>
          </div>
        </div>
      </UCard>
      
      <!-- Active Targets -->
      <UCard v-if="activeTargets.length > 0">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-target" class="text-primary" />
            <span class="font-semibold">進行中嘅目標</span>
          </div>
        </template>
        
        <div class="space-y-3">
          <div
            v-for="target in activeTargets"
            :key="target.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium">{{ getTargetTypeLabel(target.targetType) }}</p>
              <p v-if="target.targetDate" class="text-xs text-gray-400">
                目標日期: {{ target.targetDate }}
              </p>
            </div>
            
            <div class="text-right">
              <p class="text-xl font-bold text-primary">
                {{ target.targetValue }}{{ getTargetUnit(target.targetType) }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <UButton to="/targets" variant="ghost" size="sm" class="w-full">
            查看全部目標
            <UIcon name="i-lucide-arrow-right" class="ml-2" />
          </UButton>
        </div>
      </UCard>
      
      <!-- Recent History -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-history" class="text-primary" />
            <span class="font-semibold">最近記錄</span>
          </div>
        </template>
        
        <div v-if="recentRecords.length > 0" class="space-y-2">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <span class="text-sm text-gray-500">{{ record.recordedAt }}</span>
            <div class="flex items-center gap-4">
              <span class="font-medium">{{ record.weightKg }} kg</span>
              <span v-if="record.bodyFatPct" class="text-sm text-gray-400">
                {{ record.bodyFatPct }}%
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-400">
          暫時未有記錄
        </div>
        
        <div class="mt-4">
          <UButton to="/record" variant="ghost" size="sm" class="w-full">
            查看全部記錄
            <UIcon name="i-lucide-arrow-right" class="ml-2" />
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
