<script setup lang="ts">
const settings = ref({
  targetWeight: 65,
  reminderEnabled: true,
  reminderTime: '08:00',
  darkMode: false
})
const loading = ref(false)
async function saveSettings() {
  loading.value = true
  // TODO: Save to database
  await new Promise(r => setTimeout(r, 500))
  loading.value = false
  alert('設置已保存')
}
function logout() {
  // TODO: Clear session
  navigateTo('/login')
}
</script>
<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">設定</h1>
    
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-target" class="text-primary" />
          <span class="font-semibold">目標設置</span>
        </div>
      </template>
      
      <UFormField label="目標體重 (kg)">
        <UInput v-model="settings.targetWeight" type="number" step="0.1" />
      </UFormField>
    </UCard>
    
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bell" class="text-primary" />
          <span class="font-semibold">提醒設置</span>
        </div>
      </template>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span>每日提醒</span>
          <USwitch v-model="settings.reminderEnabled" />
        </div>
        
        <UFormField v-if="settings.reminderEnabled" label="提醒時間">
          <UInput v-model="settings.reminderTime" type="time" />
        </UFormField>
      </div>
    </UCard>
    
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-palette" class="text-primary" />
          <span class="font-semibold">外觀</span>
        </div>
      </template>
      
      <div class="flex items-center justify-between">
        <span>深色模式</span>
        <USwitch v-model="settings.darkMode" />
      </div>
    </UCard>
    
    <div class="flex gap-3">
      <UButton color="primary" :loading="loading" icon="i-lucide-save" @click="saveSettings">
        保存設置
      </UButton>
      
      <UButton color="error" variant="soft" icon="i-lucide-log-out" @click="logout">
        登出
      </UButton>
    </div>
  </div>
</template>
