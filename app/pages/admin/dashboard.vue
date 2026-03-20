<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

interface AdminStats {
  totalUsers: number
  teacherCount: number
  newUsersToday: number
  totalTokensIssued: number
  totalTokensUsed: number
}

const { data: stats, pending } = await useFetch<AdminStats>('/api/admin/stats')

const statCards = computed(() => [
  {
    title: '總用戶數',
    value: stats.value?.totalUsers || 0,
    icon: 'i-lucide-users',
    color: 'blue'
  },
  {
    title: 'Teacher 數量',
    value: stats.value?.teacherCount || 0,
    icon: 'i-lucide-graduation-cap',
    color: 'green'
  },
  {
    title: '今日新用戶',
    value: stats.value?.newUsersToday || 0,
    icon: 'i-lucide-user-plus',
    color: 'purple'
  },
  {
    title: 'Token 總發行',
    value: stats.value?.totalTokensIssued || 0,
    icon: 'i-lucide-coins',
    color: 'yellow'
  }
])
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">儀表板</h1>
      <p class="text-gray-500">系統概覽同統計</p>
    </div>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="card in statCards"
        :key="card.title"
        :loading="pending"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ card.title }}</p>
            <p class="text-3xl font-bold">{{ card.value }}</p>
          </div>
          
          <div 
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="`bg-${card.color}-100 dark:bg-${card.color}-900/20`"
          >
            <UIcon 
              :name="card.icon" 
              class="text-xl"
              :class="`text-${card.color}-500`"
            />
          </div>
        </div>
      </UCard>
    </div>
    
    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-zap" class="text-primary" />
          <span class="font-semibold">快捷操作</span>
        </div>
      </template>
      
      <div class="flex flex-wrap gap-3">
        <UButton to="/admin/users">
          <UIcon name="i-lucide-users" class="mr-2" />
          管理用戶
        </UButton>
        
        <UButton variant="soft">
          <UIcon name="i-lucide-download" class="mr-2" />
          導出數據
        </UButton>
      </div>
    </UCard>
  </div>
</template>
