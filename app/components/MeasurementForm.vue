<script setup lang="ts">
import { SlideInput } from '#components'

interface PreviousRecord {
  weightKg?: number | null
  bodyFatPct?: number | null
  muscleKg?: number | null
  waterPct?: number | null
  boneKg?: number | null
  visceralFat?: number | null
  chestCm?: number | null
  waistCm?: number | null
  hipsCm?: number | null
  thighCm?: number | null
  armCm?: number | null
}

interface Props {
  previousRecord?: PreviousRecord | null
}

const props = withDefaults(defineProps<Props>(), {
  previousRecord: null
})

const emit = defineEmits<{
  submit: []
}>()

// Form fields
const weightKg = defineModel<number | null>('weightKg', { default: null })
const bodyFatPct = defineModel<number | null>('bodyFatPct', { default: null })
const muscleKg = defineModel<number | null>('muscleKg', { default: null })
const waterPct = defineModel<number | null>('waterPct', { default: null })
const boneKg = defineModel<number | null>('boneKg', { default: null })
const visceralFat = defineModel<number | null>('visceralFat', { default: null })
const chestCm = defineModel<number | null>('chestCm', { default: null })
const waistCm = defineModel<number | null>('waistCm', { default: null })
const hipsCm = defineModel<number | null>('hipsCm', { default: null })
const thighCm = defineModel<number | null>('thighCm', { default: null })
const armCm = defineModel<number | null>('armCm', { default: null })
const note = defineModel<string>('note', { default: '' })

const loading = defineModel<boolean>('loading', { default: false })

// Tabs items
const tabsItems = [
  {
    label: '身體組成',
    icon: 'i-lucide-activity',
    slot: 'composition'
  },
  {
    label: '身體圍度',
    icon: 'i-lucide-ruler',
    slot: 'measurements'
  }
]

function onSubmit() {
  emit('submit')
}

function onReset() {
  weightKg.value = null
  bodyFatPct.value = null
  muscleKg.value = null
  waterPct.value = null
  boneKg.value = null
  visceralFat.value = null
  chestCm.value = null
  waistCm.value = null
  hipsCm.value = null
  thighCm.value = null
  armCm.value = null
  note.value = ''
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <!-- Tabs for Body Composition and Measurements -->
    <UTabs :items="tabsItems" class="w-full">
      <!-- Body Composition Tab -->
      <template #composition>
        <div class="grid grid-cols-2 gap-4 pt-2">
          <SlideInput
            v-model="weightKg"
            label="體重 (kg)"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="300"
            :previous-value="previousRecord?.weightKg ?? null"
          />
          
          <SlideInput
            v-model="bodyFatPct"
            label="體脂 (%)"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="100"
            :previous-value="previousRecord?.bodyFatPct ?? null"
          />
          
          <SlideInput
            v-model="muscleKg"
            label="肌肉 (kg)"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="200"
            :previous-value="previousRecord?.muscleKg ?? null"
          />
          
          <SlideInput
            v-model="waterPct"
            label="水分 (%)"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="100"
            :previous-value="previousRecord?.waterPct ?? null"
          />
          
          <SlideInput
            v-model="boneKg"
            label="骨骼 (kg)"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="50"
            :previous-value="previousRecord?.boneKg ?? null"
          />
          
          <SlideInput
            v-model="visceralFat"
            label="內臟脂肪"
            :precision="0"
            :step="1"
            :min="1"
            :max="59"
            :previous-value="previousRecord?.visceralFat ?? null"
          />
        </div>
      </template>
      
      <!-- Body Measurements Tab -->
      <template #measurements>
        <div class="grid grid-cols-2 gap-4 pt-2">
          <SlideInput
            v-model="chestCm"
            label="胸圍 (cm)"
            :precision="1"
            :step="0.5"
            :min="0"
            :max="200"
            :previous-value="previousRecord?.chestCm ?? null"
          />
          
          <SlideInput
            v-model="waistCm"
            label="腰圍 (cm)"
            :precision="1"
            :step="0.5"
            :min="0"
            :max="200"
            :previous-value="previousRecord?.waistCm ?? null"
          />
          
          <SlideInput
            v-model="hipsCm"
            label="臀圍 (cm)"
            :precision="1"
            :step="0.5"
            :min="0"
            :max="200"
            :previous-value="previousRecord?.hipsCm ?? null"
          />
          
          <SlideInput
            v-model="thighCm"
            label="大腿圍 (cm)"
            :precision="1"
            :step="0.5"
            :min="0"
            :max="150"
            :previous-value="previousRecord?.thighCm ?? null"
          />
          
          <SlideInput
            v-model="armCm"
            label="手臂圍 (cm)"
            :precision="1"
            :step="0.5"
            :min="0"
            :max="100"
            :previous-value="previousRecord?.armCm ?? null"
          />
        </div>
      </template>
    </UTabs>
    
    <!-- Note -->
    <div class="pt-2">
      <UFormField label="備註">
        <UInput
          v-model="note"
          placeholder="例如：運動後、早餐後等"
          class="w-full"
        />
      </UFormField>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-3 pt-4">
      <UButton
        type="button"
        variant="ghost"
        class="flex-1"
        @click="onReset"
      >
        重置
      </UButton>
      
      <UButton
        type="submit"
        color="primary"
        :loading="loading"
        class="flex-1"
      >
        保存記錄
      </UButton>
    </div>
  </form>
</template>
