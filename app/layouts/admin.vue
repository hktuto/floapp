<script setup>
const route = useRoute()
const { user } = useAuth()

const navigation = [
  { label: '儀表板', to: '/admin/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: '用戶管理', to: '/admin/users', icon: 'i-lucide-users' }
]

const isActive = (path) => route.path === path
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <aside class="w-64 bg-white border-r flex flex-col">
      <div class="p-4 border-b">
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-scale" class="w-8 h-8 text-primary" />
          <div>
            <span class="font-bold text-lg">Flo</span>
            <span class="text-xs text-gray-500 ml-2">Admin</span>
          </div>
        </NuxtLink>
      </div>
      
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg"
          :class="isActive(item.to) ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-100'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      
      <div class="p-4 border-t space-y-3">
        <div class="flex items-center gap-3">
          <UAvatar 
            :src="user?.avatarUrl" 
            :alt="user?.identifier"
            icon="i-lucide-user"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ user?.identifier }}</p>
            <UBadge size="xs" color="error">Admin</UBadge>
          </div>
        </div>
        
        <UButton to="/dashboard" variant="ghost" size="sm" class="w-full">
          <UIcon name="i-lucide-arrow-left" class="mr-2" />
          返回前台
        </UButton>
      </div>
    </aside>
    
    <main class="flex-1 overflow-auto">
      <div class="p-6 max-w-6xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
