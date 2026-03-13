<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { login, isLoading, error: authError } = useAuth()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '請輸入用戶名同密碼'
    return
  }
  
  error.value = ''
  
  const result = await login(username.value, password.value)
  
  if (result.success) {
    // Check if profile is empty
    try {
      const profile = await $fetch('/api/profile')
      const isProfileEmpty = !profile.firstName && !profile.lastName
      
      if (isProfileEmpty) {
        navigateTo('/welcome')
      } else {
        navigateTo('/dashboard')
      }
    } catch {
      // If profile fetch fails, go to welcome
      navigateTo('/welcome')
    }
  } else {
    error.value = result.message || '登入失敗'
  }
}
</script>

<template>
  <div class="w-full max-w-sm mx-auto">
    <UCard class="shadow-xl">
      <template #header>
        <div class="text-center">
          <UIcon name="i-lucide-scale" class="w-12 h-12 text-primary mx-auto mb-2" />
          <h2 class="text-2xl font-bold">登入</h2>
          <p class="text-gray-500 text-sm">歡迎回來</p>
        </div>
      </template>
      
      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="用戶名" required>
          <UInput
            v-model="username"
            placeholder="輸入用戶名"
            icon="i-lucide-user"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>
        
        <UFormField label="密碼" required>
          <div class="relative">
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="輸入密碼"
              icon="i-lucide-lock"
              autocomplete="current-password"
              class="w-full"
            />
            
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-5 h-5" />
            </button>
          </div>
        </UFormField>
        
        <UAlert v-if="error || authError" color="error" variant="soft" :title="error || authError" />
        
        <UButton type="submit" color="primary" :loading="isLoading" class="w-full">
          登入
        </UButton>
        
        <div class="text-center pt-4">
          <p class="text-sm text-gray-500">
            仲未有帳戶？
            <NuxtLink to="/register" class="text-primary hover:underline">立即註冊</NuxtLink>
          </p>
        </div>
      </form>
    </UCard>
  </div>
</template>
