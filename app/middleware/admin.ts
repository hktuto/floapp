export default defineNuxtRouteMiddleware(async () => {
  const { user, isLoggedIn, checkAuth } = useAuth()
  
  // 確保已獲取用戶信息
  if (!isLoggedIn.value) {
    const authUser = await checkAuth()
    if (!authUser) {
      return navigateTo('/login')
    }
  }
  
  // 檢查是否為 admin（使用 any 類型）
  if ((user.value as any)?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
