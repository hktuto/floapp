<script setup lang="ts">
definePageMeta({
  layout: 'onboarding'
})

const loading = ref(false)
const error = ref('')

const profile = ref({
  firstName: '',
  lastName: '',
  gender: '',
  heightCm: null as number | null,
  birthDate: ''
})

async function saveProfile() {
  if (!profile.value.firstName || !profile.value.lastName) {
    error.value = '請輸入姓名'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await $fetch('/api/profile', {
      method: 'PUT',
      body: profile.value
    })
    
    navigateTo('/record-first')
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
        <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
        <div class="w-12 h-1 bg-gray-200"></div>
        <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
        <div class="w-12 h-1 bg-gray-200"></div>
        <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
      </div>
    </div>
    
    <div class="text-center mb-8">
      <UIcon name="i-lucide-party-popper" class="w-16 h-16 text-primary mx-auto mb-4" />
      <h1 class="text-2xl font-bold mb-2">歡迎使用 Flo App！</h1>
      <p class="text-gray-500">讓我哋了解更多關於你嘅資料</p>
    </div>
    
    <UCard class="shadow-lg">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-user" class="text-primary" />
          <span class="font-semibold">填寫個人資料</span>
        </div>
      </template>
      
      <form class="space-y-4" @submit.prevent="saveProfile">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="名" required>
            <UInput
              v-model="profile.firstName"
              placeholder="例如：小明"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="姓" required>
            <UInput
              v-model="profile.lastName"
              placeholder="例如：陳"
              class="w-full"
            />
          </UFormField>
        </div>
        
        <UFormField label="性別">
          <USelect
            v-model="profile.gender"
            :options="[
              { label: '男', value: 'male' },
              { label: '女', value: 'female' },
              { label: '其他', value: 'other' }
            ]"
            placeholder="選擇性別"
            class="w-full"
          />
        </UFormField>
        
        <UFormField label="身高 (cm)">
          <UInput
            v-model="profile.heightCm"
            type="number"
            step="0.1"
            placeholder="例如：175"
            class="w-full"
          />
        </UFormField>
        
        <UFormField label="出生日期">
          <UInput
            v-model="profile.birthDate"
            type="date"
            class="w-full"
          />
        </UFormField>
        
        <UAlert v-if="error" color="error" variant="soft" :title="error" />
        
        <div class="pt-4">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="loading"
            class="w-full"
          >
            下一步
            <UIcon name="i-lucide-arrow-right" class="ml-2" />
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
