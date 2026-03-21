<script setup lang="ts">
interface Friend {
  id: string
  userId: string
  username: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  weight: number
  lastRecord: string
}

const friends = ref<Friend[]>([])
const loading = ref(false)
const toast = useToast()

// Fetch friends from API
async function fetchFriends() {
  try {
    loading.value = true
    const data = await $fetch('/api/friends')
    friends.value = data || []
  } catch (e) {
    console.error('Failed to fetch friends:', e)
    toast.add({ title: '錯誤', description: '獲取朋友列表失敗', color: 'error' })
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
    f.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (f.firstName && f.firstName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (f.lastName && f.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase()
}

function getDisplayName(friend: Friend): string {
  if (friend.firstName || friend.lastName) {
    return `${friend.firstName || ''} ${friend.lastName || ''}`.trim()
  }
  return friend.username
}

async function deleteFriend(friendId: string) {
  if (!confirm('確定要刪除呢位朋友嗎？')) return
  
  try {
    await $fetch(`/api/friends/${friendId}`, { method: 'DELETE' })
    toast.add({ title: '成功', description: '已刪除朋友', color: 'success' })
    fetchFriends()
  } catch (e) {
    toast.add({ title: '錯誤', description: '刪除失敗', color: 'error' })
  }
}

const addFriendModal = ref(false)
const friendIdentifier = ref('')

async function addFriend() {
  if (!friendIdentifier.value) {
    toast.add({ title: '提示', description: '請輸入用戶名', color: 'warning' })
    return
  }
  
  try {
    await $fetch('/api/friends/request', {
      method: 'POST',
      body: { identifier: friendIdentifier.value }
    })
    toast.add({ title: '成功', description: '朋友請求已發送', color: 'success' })
    friendIdentifier.value = ''
    addFriendModal.value = false
  } catch (e: any) {
    toast.add({ title: '錯誤', description: e.data?.message || '發送請求失敗', color: 'error' })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">朋友</h1>
      <UButton color="primary" icon="i-lucide-user-plus" @click="addFriendModal = true">
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
          <UAvatar 
            :src="friend.avatarUrl" 
            :text="getInitial(friend.username)" 
            size="lg" 
          />
          
          <div class="flex-1">
            <p class="font-semibold">{{ getDisplayName(friend) }}</p>
            <p class="text-sm text-gray-500">@{{ friend.username }}</p>
            <p class="text-xs text-gray-400">
              最後記錄: {{ friend.lastRecord }}
            </p>
          </div>
          
          <div class="text-right">
            <p class="text-2xl font-bold text-primary">{{ friend.weight }}<span class="text-sm">kg</span></p>
          </div>
          
          <UButton 
            variant="ghost" 
            color="error" 
            icon="i-lucide-trash-2"
            @click="deleteFriend(friend.id)"
          />
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
    
    <!-- Add Friend Modal -->
    <UModal v-model:open="addFriendModal">
      <UCard>
        <template #header>添加朋友</template>
        
        <div class="space-y-4">
          <UFormGroup label="用戶名">
            <UInput 
              v-model="friendIdentifier" 
              placeholder="輸入朋友嘅用戶名"
              icon="i-lucide-user"
              @keyup.enter="addFriend"
            />
          </UFormGroup>
        </div>
        
        <template #footer>
          <UButton variant="ghost" @click="addFriendModal = false">取消</UButton>
          <UButton color="primary" @click="addFriend">發送請求</UButton>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
