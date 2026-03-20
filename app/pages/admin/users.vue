<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

// 狀態
const search = ref('')
const roleFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

// 獲取用戶列表
const { data: usersData, pending, refresh } = await useFetch('/api/admin/users')

const users = computed(() => usersData.value?.users || [])
const total = computed(() => usersData.value?.total || 0)

// Modal 狀態
const editRoleModal = ref(false)
const rechargeModal = ref(false)
const selectedUser = ref(null)
const newRole = ref('')
const rechargeAmount = ref(0)
const rechargeReason = ref('')
const toast = useToast()

// 打開編輯 Role Modal
function openEditRole(user) {
  selectedUser.value = user
  newRole.value = user.profile.role
  editRoleModal.value = true
}

// 打開充值 Modal
function openRecharge(user) {
  selectedUser.value = user
  rechargeAmount.value = 0
  rechargeReason.value = ''
  rechargeModal.value = true
}

// 保存 Role
async function saveRole() {
  if (!selectedUser.value) return
  
  try {
    await $fetch(`/api/admin/users/${selectedUser.value.id}/role`, {
      method: 'PUT',
      body: { role: newRole.value }
    })
    
    editRoleModal.value = false
    refresh()
    toast.add({ title: '成功', description: '用戶角色已更新', color: 'success' })
  } catch (error) {
    toast.add({ title: '錯誤', description: '更新失敗', color: 'error' })
  }
}

// 保存 Token 充值
async function saveRecharge() {
  if (!selectedUser.value) return
  
  try {
    await $fetch(`/api/admin/users/${selectedUser.value.id}/tokens`, {
      method: 'POST',
      body: { amount: rechargeAmount.value, reason: rechargeReason.value }
    })
    
    rechargeModal.value = false
    refresh()
    toast.add({ title: '成功', description: '操作成功', color: 'success' })
  } catch (error) {
    toast.add({ title: '錯誤', description: '操作失敗', color: 'error' })
  }
}

const quickAmounts = [10, 50, 100, 500]

const roleColors = {
  admin: 'error',
  teacher: 'info',
  user: 'neutral'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">用戶管理</h1>
        <p class="text-gray-500">管理所有用戶，修改角色同 Token 餘額</p>
      </div>
      <UBadge size="lg">共 {{ total }} 位用戶</UBadge>
    </div>
    
    <UCard :loading="pending">
      <UTable :data="users">
        <template #identifier-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :src="row.profile?.avatarUrl" :alt="row.identifier" icon="i-lucide-user" size="sm" />
            <div>
              <p class="font-medium">{{ row.identifier }}</p>
              <p v-if="row.profile?.firstName || row.profile?.lastName" class="text-xs text-gray-500">
                {{ row.profile.firstName }} {{ row.profile.lastName }}
              </p>
            </div>
          </div>
        </template>
        
        <template #role-data="{ row }">
          <UBadge :color="roleColors[row.profile?.role]" size="sm">
            {{ row.profile?.role || 'user' }}
          </UBadge>
        </template>
        
        <template #tokens-data="{ row }">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-coins" class="w-4 h-4 text-yellow-500" />
            <span>{{ row.tokenBalance || 0 }}</span>
          </div>
        </template>
        
        <template #createdAt-data="{ row }">
          <span class="text-sm text-gray-500">{{ new Date(row.createdAt).toLocaleDateString('zh-HK') }}</span>
        </template>
        
        <template #actions-data="{ row }">
          <UDropdown :items="[
            { label: '編輯 Role', icon: 'i-lucide-user-cog', click: () => openEditRole(row) },
            { label: 'Token 充值', icon: 'i-lucide-plus-circle', click: () => openRecharge(row) }
          ]">
            <UButton variant="ghost" icon="i-lucide-more-vertical" />
          </UDropdown>
        </template>
      </UTable>
      
      <div v-if="!pending && users.length === 0" class="py-12 text-center">
        <UIcon name="i-lucide-users" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">暫時冇用戶</p>
      </div>
    </UCard>
    
    <!-- Edit Role Modal -->
    <UModal v-model:open="editRoleModal">
      <UCard v-if="selectedUser">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user-cog" class="text-primary" />
            <span class="font-semibold">修改用戶角色</span>
          </div>
        </template>
        
        <div class="space-y-4">
          <p class="text-sm text-gray-500">用戶: <span class="font-medium">{{ selectedUser.identifier }}</span></p>
          
          <URadioGroup v-model="newRole" orientation="vertical"
            :items="[
              { label: 'Admin', value: 'admin', description: '系統管理員' },
              { label: 'Teacher', value: 'teacher', description: '可創建課程' },
              { label: 'User', value: 'user', description: '普通用戶' }
            ]"
          />
        </div>
        
        <template #footer>
          <UButton variant="ghost" @click="editRoleModal = false">取消</UButton>
          <UButton color="primary" @click="saveRole">保存</UButton>
        </template>
      </UCard>
    </UModal>
    
    <!-- Recharge Modal -->
    <UModal v-model:open="rechargeModal">
      <UCard v-if="selectedUser">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-coins" class="text-primary" />
            <span class="font-semibold">Token {{ rechargeAmount >= 0 ? '充值' : '扣除' }}</span>
          </div>
        </template>
        
        <div class="space-y-4">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <UAvatar :src="selectedUser.profile?.avatarUrl" :alt="selectedUser.identifier" icon="i-lucide-user" />
            <div>
              <p class="font-medium">{{ selectedUser.identifier }}</p>
              <p class="text-sm text-gray-500">當前餘額: {{ selectedUser.tokenBalance || 0 }} Token</p>
            </div>
          </div>
          
          <div class="flex gap-2">
            <UButton v-for="amt in quickAmounts" :key="amt" variant="soft" size="sm" @click="rechargeAmount = amt">+{{ amt }}</UButton>
          </div>
          
          <UFormGroup label="數量（負數 = 扣除）">
            <UInput v-model.number="rechargeAmount" type="number" />
          </UFormGroup>
          
          <UFormGroup label="原因 / 備註">
            <UTextarea v-model="rechargeReason" placeholder="例如：活動獎勵..." :rows="2" />
          </UFormGroup>
          
          <p class="text-sm">操作後餘額: <span class="font-bold">{{ (selectedUser.tokenBalance || 0) + rechargeAmount }}</span></p>
        </div>
        
        <template #footer>
          <UButton variant="ghost" @click="rechargeModal = false">取消</UButton>
          <UButton :color="rechargeAmount >= 0 ? 'primary' : 'error'" @click="saveRecharge">確認</UButton>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
