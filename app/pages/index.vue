<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <UIcon name="i-lucide-scale" class="w-24 h-24 text-primary" />
    <h1 class="text-4xl font-bold">Flo App</h1>
    <p class="text-gray-500 text-lg">追蹤你的體重同體脂進度</p>
    
    <UButton to="/login" size="lg" color="primary">
      開始使用
    </UButton>
  </div>
</template>
