// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for public routes
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Check if user is logged in
  const { checkAuth } = useAuth()
  const user = await checkAuth()
  
  // If not logged in, redirect to login
  if (!user) {
    return navigateTo('/login')
  }
})
