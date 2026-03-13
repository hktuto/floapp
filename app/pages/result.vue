<script setup lang="ts">
definePageMeta({
  layout: 'onboarding'
})

interface MeasurementRecord {
  id: string
  recordedAt: string
  weightKg: string
  bodyFatPct: string | null
  muscleKg: string | null
  waistCm: string | null
  note: string | null
}

interface Target {
  id: string
  targetType: string
  targetValue: string
  targetDate: string | null
  status: string
}

const loading = ref(true)
const latestRecord = ref<MeasurementRecord | null>(null)
const previousRecord = ref<MeasurementRecord | null>(null)
const activeTargets = ref<Target[]>([])

const showConfetti = ref(false)

onMounted(async () => {
  await fetchData()
  setTimeout(() => {
    showConfetti.value = true
  }, 300)
})

async function fetchData() {
  try {
    loading.value = true
    
    const records = await $fetch<MeasurementRecord[]>('/api/measurements', {
      query: { limit: 2 }
    })
    
    latestRecord.value = records[0] || null
    previousRecord.value = records[1] || null
    
    const targets = await $fetch<Target[]>('/api/targets')
    activeTargets.value = targets.filter(t => t.status === 'active')
  } catch (e) {
    console.error('Failed to fetch data:', e)
  } finally {
    loading.value = false
  }
}

function calculateChange(current: string | null, previous: string | null): number | null {
  if (!current || !previous) return null
  const diff = parseFloat(current) - parseFloat(previous)
  return Math.round(diff * 100) / 100
}

function getChangeColor(change: number | null, type: string): string {
  if (change === null) return 'text-gray-400'
  const isGoodChange = (type === 'weight' || type === 'body_fat') 
    ? change < 0 
    : change > 0
  return isGoodChange ? 'text-green-600' : 'text-red-500'
}

function getChangeIcon(change: number | null, type: string): string {
  if (change === null) return ''
  const isGoodChange = (type === 'weight' || type === 'body_fat') 
    ? change < 0 
    : change > 0
  return isGoodChange ? 'i-lucide-trending-down' : 'i-lucide-trending-up'
}

function getProgressPercent(current: string | null, target: string, targetType: string): number {
  if (!current) return 0
  const curr = parseFloat(current)
  const targ = parseFloat(target)
  
  if (isNaN(curr) || isNaN(targ)) return 0
  
  let progress = 0
  if (targetType === 'weight' || targetType === 'body_fat') {
    if (curr <= targ) return 100
    progress = Math.max(0, 100 - ((curr - targ) / curr * 100))
  } else {
    if (curr >= targ) return 100
    progress = (curr / targ) * 100
  }
  
  return Math.round(progress)
}

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

function getRecordValueForTarget(record: MeasurementRecord | null, targetType: string): string | null {
  if (!record) return null
  switch (targetType) {
    case 'weight': return record.weightKg
    case 'body_fat': return record.bodyFatPct
    case 'muscle': return record.muscleKg
    case 'waist': return record.waistCm
    default: return record.weightKg
  }
}

function goToDashboard() {
  navigateTo('/dashboard')
}

function recordAnother() {
  navigateTo('/record')
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>
    
    <div v-else class="space-y-6">
      <!-- Success Header -->
      <div class="text-center py-6 relative">
        <div v-if="showConfetti" class="absolute inset-0 pointer-events-none">
          <UIcon name="i-lucide-sparkles" class="absolute top-4 left-1/4 w-6 h-6 text-yellow-400 animate-bounce" />
          <UIcon name="i-lucide-star" class="absolute top-8 right-1/4 w-5 h-5 text-green-400 animate-pulse" />
          <UIcon name="i-lucide-party-popper" class="absolute bottom-4 left-1/3 w-8 h-8 text-primary animate-bounce" style="animation-delay: 0.2s" />
        </div>
        
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-600" />
        </div>
        
        <h1 class="text-2xl font-bold mb-2">記錄成功！</h1>
        <p class="text-gray-500">{{ latestRecord?.recordedAt }}</p>
      </div>
      
      <!-- Latest Record Card -->
      <UCard v-if="latestRecord" class="border-2 border-primary">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-scale" class="text-primary" />
            <span class="font-semibold">最新記錄</span>
          </div>
        </template>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-primary-50 rounded-lg">
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
      
      <!-- Changes Comparison -->
      <UCard v-if="previousRecord">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="text-primary" />
            <span class="font-semibold">與上次比較</span>
            <span class="text-sm text-gray-400 ml-auto">{{ previousRecord.recordedAt }}</span>
          </div>
        </template>
        
        <div class="space-y-3">
          <!-- Weight Change -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-scale" class="w-5 h-5 text-gray-400" />
              <span>體重</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">{{ previousRecord.weightKg }} → {{ latestRecord?.weightKg }} kg</span>
              <div 
                v-if="calculateChange(latestRecord?.weightKg || null, previousRecord.weightKg) !== null"
                class="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
                :class="getChangeColor(calculateChange(latestRecord?.weightKg || null, previousRecord.weightKg), 'weight')"
              >
                <UIcon 
                  :name="getChangeIcon(calculateChange(latestRecord?.weightKg || null, previousRecord.weightKg), 'weight')" 
                  class="w-4 h-4" 
                />
                <span>{{ (calculateChange(latestRecord?.weightKg || null, previousRecord.weightKg) || 0) > 0 ? '+' : '' }}{{ calculateChange(latestRecord?.weightKg || null, previousRecord.weightKg) }} kg</span>
              </div>
            </div>
          </div>
          
          <!-- Body Fat Change -->
          <div v-if="latestRecord?.bodyFatPct && previousRecord.bodyFatPct" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-activity" class="w-5 h-5 text-gray-400" />
              <span>體脂</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">{{ previousRecord.bodyFatPct }} → {{ latestRecord.bodyFatPct }}%</span>
              <div 
                v-if="calculateChange(latestRecord.bodyFatPct, previousRecord.bodyFatPct) !== null"
                class="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
                :class="getChangeColor(calculateChange(latestRecord.bodyFatPct, previousRecord.bodyFatPct), 'body_fat')"
              >
                <UIcon 
                  :name="getChangeIcon(calculateChange(latestRecord.bodyFatPct, previousRecord.bodyFatPct), 'body_fat')" 
                  class="w-4 h-4" 
                />
                <span>{{ (calculateChange(latestRecord.bodyFatPct, previousRecord.bodyFatPct) || 0) > 0 ? '+' : '' }}{{ calculateChange(latestRecord.bodyFatPct, previousRecord.bodyFatPct) }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Muscle Change -->
          <div v-if="latestRecord?.muscleKg && previousRecord.muscleKg" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-dumbbell" class="w-5 h-5 text-gray-400" />
              <span>肌肉</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">{{ previousRecord.muscleKg }} → {{ latestRecord.muscleKg }} kg</span>
              <div 
                v-if="calculateChange(latestRecord.muscleKg, previousRecord.muscleKg) !== null"
                class="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
                :class="getChangeColor(calculateChange(latestRecord.muscleKg, previousRecord.muscleKg), 'muscle')"
              >
                <UIcon 
                  :name="getChangeIcon(calculateChange(latestRecord.muscleKg, previousRecord.muscleKg), 'muscle')" 
                  class="w-4 h-4" 
                />
                <span>{{ (calculateChange(latestRecord.muscleKg, previousRecord.muscleKg) || 0) > 0 ? '+' : '' }}{{ calculateChange(latestRecord.muscleKg, previousRecord.muscleKg) }} kg</span>
              </div>
            </div>
          </div>
          
          <!-- Waist Change -->
          <div v-if="latestRecord?.waistCm && previousRecord.waistCm" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-ruler" class="w-5 h-5 text-gray-400" />
              <span>腰圍</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">{{ previousRecord.waistCm }} → {{ latestRecord.waistCm }} cm</span>
              <div 
                v-if="calculateChange(latestRecord.waistCm, previousRecord.waistCm) !== null"
                class="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
                :class="getChangeColor(calculateChange(latestRecord.waistCm, previousRecord.waistCm), 'waist')"
              >
                <UIcon 
                  :name="getChangeIcon(calculateChange(latestRecord.waistCm, previousRecord.waistCm), 'waist')" 
                  class="w-4 h-4" 
                />
                <span>{{ (calculateChange(latestRecord.waistCm, previousRecord.waistCm) || 0) > 0 ? '+' : '' }}{{ calculateChange(latestRecord.waistCm, previousRecord.waistCm) }} cm</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>
      
      <!-- No Previous Record Message -->
      <UCard v-else>
        <div class="text-center py-6">
          <UIcon name="i-lucide-info" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">呢係你嘅第一個記錄！</p>
          <p class="text-sm text-gray-400 mt-1">下次再記錄時可以睇到變化</p>
        </div>
      </UCard>
      
      <!-- Target Progress -->
      <UCard v-if="activeTargets.length > 0">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-target" class="text-primary" />
            <span class="font-semibold">目標進度</span>
          </div>
        </template>
        
        <div class="space-y-4">
          <div
            v-for="target in activeTargets"
            :key="target.id"
            class="space-y-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ getTargetTypeLabel(target.targetType) }}</span>
                <span class="text-sm text-gray-400">目標: {{ target.targetValue }}{{ getTargetUnit(target.targetType) }}</span>
              </div>
              <span v-if="latestRecord" class="text-sm font-bold">
                {{ getProgressPercent(
                  getRecordValueForTarget(latestRecord, target.targetType),
                  target.targetValue,
                  target.targetType
                ) }}%
              </span>
            </div>
            
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                v-if="latestRecord"
                class="h-full bg-primary rounded-full transition-all duration-500"
                :style="{ width: getProgressPercent(
                  getRecordValueForTarget(latestRecord, target.targetType),
                  target.targetValue,
                  target.targetType
                ) + '%' }"
              />
            </div>
            
            <p v-if="target.targetDate" class="text-xs text-gray-400">
              目標日期: {{ target.targetDate }}
            </p>
          </div>
        </div>
      </UCard>
      
      <!-- Actions -->
      <div class="flex gap-3 pt-4">
        <UButton
          variant="ghost"
          class="flex-1"
          @click="recordAnother"
        >
          <UIcon name="i-lucide-plus" class="mr-2" />
          再記一筆
        </UButton>
        
        <UButton
          color="primary"
          class="flex-1"
          @click="goToDashboard"
        >
          完成
          <UIcon name="i-lucide-arrow-right" class="ml-2" />
        </UButton>
      </div>
    </div>
  </div>
</template>
