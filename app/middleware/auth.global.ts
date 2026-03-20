// Routes that don't require authentication (for unauthenticated users)
const publicOnlyRoutes = ['/login', '/register']

// Routes that are always accessible
const alwaysPublicRoutes = ['/']

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth, isLoggedIn } = useAuth()
  
  // Check if user is logged in
  const user = isLoggedIn.value ? await checkAuth() : await checkAuth()
  
  // If user is logged in and trying to access /login or /register
  // redirect to dashboard
  if (user && publicOnlyRoutes.includes(to.path)) {
    return navigateTo('/dashboard')
  }
  
  // Allow access to always public routes
  if (alwaysPublicRoutes.includes(to.path)) {
    return
  }
  
  // Allow access to public only routes (for unauthenticated users)
  if (publicOnlyRoutes.includes(to.path)) {
    return
  }
  
  // For all other routes, require authentication
  if (!user) {
    return navigateTo('/login')
  }
})
