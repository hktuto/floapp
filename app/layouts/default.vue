<script setup lang="ts">
const route = useRoute()

const navigation = [
  { label: '儀表板', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: '記錄', to: '/record', icon: 'i-lucide-scale' },
  { label: '朋友', to: '/friends', icon: 'i-lucide-users' },
  { label: '設定', to: '/settings', icon: 'i-lucide-settings' }
]

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <UIcon name="i-lucide-scale" class="w-8 h-8 text-primary" />
          <span class="text-xl font-bold">Flo</span>
        </NuxtLink>
        
        <nav class="hidden md:flex items-center gap-1">
          <UButton
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            :variant="isActive(item.to) ? 'soft' : 'ghost'"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            :icon="item.icon"
          >
            {{ item.label }}
          </UButton>
        </nav>
        
        <div class="flex items-center gap-2">
          <UButton to="/settings" icon="i-lucide-user" variant="ghost" />
        </div>
      </div>
    </header>
    
    <!-- Mobile Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div class="flex justify-around">
        <UButton
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :variant="isActive(item.to) ? 'soft' : 'ghost'"
          :color="isActive(item.to) ? 'primary' : 'neutral'"
          :icon="item.icon"
          square
        />
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <slot />
    </main>
  </div>
</template>
