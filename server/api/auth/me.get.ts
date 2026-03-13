export default defineEventHandler(async (event) => {
  const session = getCookie(event, 'session')
  
  if (!session) {
    return { user: null, account: null }
  }
  
  try {
    const parsed = JSON.parse(session)
    return {
      user: parsed.user || null,
      account: null
    }
  } catch {
    return { user: null, account: null }
  }
})
