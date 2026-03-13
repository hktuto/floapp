<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Simple Header without navigation -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center">
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-scale" class="w-6 h-6 text-primary" />
          <span class="text-lg font-bold">Flo</span>
        </NuxtLink>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>
