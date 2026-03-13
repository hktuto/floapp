interface User {
  id: string
  type: string
  identifier: string
}

interface Account {
  id: string
  type: string
  identifier: string
}

interface AuthState {
  user: User | null
  account: Account | null
  isLoggedIn: boolean
}

export function useAuth() {
  const user = useState<User | null>('auth:user', () => null)
  const account = useState<Account | null>('auth:account', () => null)
  const isLoggedIn = computed(() => !!user.value)
  
  const isLoading = ref(false)
  const error = ref('')

  async function login(identifier: string, password: string, type: string = 'username') {
    isLoading.value = true
    error.value = ''
    
    try {
      const result = await $fetch<{ success: boolean; account?: User; message?: string }>('/api/auth/login', {
        method: 'POST',
        body: { type, identifier, password }
      })
      
      // Fix: API returns 'account' not 'user'
      if (result.success && result.account) {
        user.value = result.account
        account.value = result.account
        return { success: true }
      }
      
      return { success: false, message: result.message || '登入失敗' }
    } catch (e: any) {
      error.value = e.data?.message || '登入失敗'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function register(identifier: string, password: string, type: string = 'username') {
    isLoading.value = true
    error.value = ''
    
    try {
      const result = await $fetch<{ success: boolean; message?: string }>('/api/auth/register', {
        method: 'POST',
        body: { type, identifier, password }
      })
      
      if (result.success) {
        return await login(identifier, password, type)
      }
      
      return { success: false, message: result.message || '註冊失敗' }
    } catch (e: any) {
      error.value = e.data?.message || '註冊失敗'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      user.value = null
      account.value = null
    }
  }

  async function fetchUser() {
    try {
      const result = await $fetch<{ user: User | null; account?: Account | null }>('/api/auth/me')
      user.value = result.user
      account.value = result.account || null
      return result.user
    } catch (e) {
      user.value = null
      account.value = null
      return null
    }
  }

  async function checkAuth() {
    if (!user.value) {
      return await fetchUser()
    }
    return user.value
  }

  return {
    user: readonly(user),
    account: readonly(account),
    isLoggedIn,
    isLoading: readonly(isLoading),
    error: readonly(error),
    login,
    register,
    logout,
    fetchUser,
    checkAuth
  }
}
