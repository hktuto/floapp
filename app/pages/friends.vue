<script setup lang="ts">
interface Friend {
  id: string
  username: string
  lastRecord: string
  weight: number
}

const friends = ref<Friend[]>([])
const loading = ref(false)

// Fetch friends from API
async function fetchFriends() {
  try {
    loading.value = true
    const data = await $fetch<Friend[]>('/api/friends')
    friends.value = data
  } catch (e: any) {
    console.error('Failed to fetch friends:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFriends()
})

const searchQuery = ref('')
const filteredFriends = computed(() => {
  if (!searchQuery.value) return friends.value
  return friends.value.filter(f => 
    f.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase()
}

function addFriend() {
  // TODO: Implement add friend
  alert('功能開發中')
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">朋友</h1>
      <UButton color="primary" icon="i-lucide-user-plus" @click="addFriend">
        添加朋友
      </UButton>
    </div>
    
    <UInput
      v-model="searchQuery"
      placeholder="搜索朋友..."
      icon="i-lucide-search"
      class="max-w-md"
    />
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>
    
    <!-- Friends List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard v-for="friend in filteredFriends" :key="friend.id">
        <div class="flex items-center gap-4">
          <UAvatar :text="getInitial(friend.username)" size="lg" />
          
          <div class="flex-1">
            <p class="font-semibold">{{ friend.username }}</p>
            <p class="text-sm text-gray-500">
              最後記錄: {{ friend.lastRecord }}
            </p>
          </div>
          
          <div class="text-right">
            <p class="text-2xl font-bold text-primary">{{ friend.weight }}kg</p>
          </div>
        </div>
      </UCard>
    </div>
    
    <!-- Empty State -->
    <UCard v-if="!loading && filteredFriends.length === 0">
      <div class="text-center py-8">
        <UIcon name="i-lucide-users" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">暫時冇朋友</p>
        <p class="text-sm text-gray-400">點擊「添加朋友」開始</p>
      </div>
    </UCard>
  </div>
</template>
