<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { register, isLoading, error: authError } = useAuth()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')

async function handleRegister() {
  if (!username.value || !password.value) {
    error.value = '請輸入用戶名同密碼'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = '兩次輸入嘅密碼唔一致'
    return
  }
  
  if (password.value.length < 6) {
    error.value = '密碼至少需要6個字符'
    return
  }
  
  error.value = ''
  
  const result = await register(username.value, password.value)
  
  if (result.success) {
    // New user always goes to welcome
    navigateTo('/welcome')
  } else {
    error.value = result.message || '註冊失敗'
  }
}
</script>

<template>
  <div class="w-full max-w-sm mx-auto">
    <UCard class="shadow-xl">
      <template #header>
        <div class="text-center">
          <UIcon name="i-lucide-scale" class="w-12 h-12 text-primary mx-auto mb-2" />
          <h2 class="text-2xl font-bold">註冊</h2>
          <p class="text-gray-500 text-sm">創建新帳戶</p>
        </div>
      </template>
      
      <form class="space-y-4" @submit.prevent="handleRegister">
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
              autocomplete="new-password"
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
        
        <UFormField label="確認密碼" required>
          <div class="relative">
            <UInput
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="再次輸入密碼"
              icon="i-lucide-lock"
              autocomplete="new-password"
              class="w-full"
            />
            
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <UIcon :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-5 h-5" />
            </button>
          </div>
        </UFormField>
        
        <UAlert v-if="error || authError" color="error" variant="soft" :title="error || authError" />
        
        <UButton type="submit" color="primary" :loading="isLoading" class="w-full">
          註冊
        </UButton>
        
        <div class="text-center pt-4">
          <p class="text-sm text-gray-500">
            已有帳戶？
            <NuxtLink to="/login" class="text-primary hover:underline">立即登入</NuxtLink>
          </p>
        </div>
      </form>
    </UCard>
  </div>
</template>
