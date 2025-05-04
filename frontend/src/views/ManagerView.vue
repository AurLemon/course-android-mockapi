<template>
  <div
    v-if="!authStore.isLoggedIn"
    class="bg-gray-100 min-h-screen flex items-center justify-center"
  >
    <LoginForm @login-success="onLoginSuccess" />
  </div>
  <div v-else class="bg-gray-100 min-h-screen">
    <div class="flex h-screen">
      <div class="w-64 bg-blue-800 text-white p-4 flex flex-col">
        <div class="text-xl font-bold mb-8">学生管理系统</div>

        <div class="space-y-2 flex-grow">
          <button
            v-for="(item, index) in menuItems"
            :key="index"
            @click="activeMenu = item.key"
            class="w-full text-left py-2 px-4 rounded-md transition-colors"
            :class="
              activeMenu === item.key ? 'bg-blue-600' : 'hover:bg-blue-700'
            "
          >
            {{ item.label }}
          </button>
        </div>

        <div class="mt-auto pt-4 border-t border-blue-700">
          <div class="mb-2">
            <div class="text-sm opacity-70">当前用户:</div>
            <div>{{ authStore.user?.username }}</div>
          </div>
          <button
            @click="logout"
            class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      <div class="flex-grow p-6 overflow-auto">
        <UserManagement v-if="activeMenu === 'users'" />
        <NoticeManagement v-else-if="activeMenu === 'notices'" />
        <AlbumManagement v-else-if="activeMenu === 'albums'" />
        <Dashboard v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import LoginForm from '@/components/manager/LoginForm.vue'
import UserManagement from '@/components/manager/UserManagement.vue'
import NoticeManagement from '@/components/manager/NoticeManagement.vue'
import AlbumManagement from '@/components/manager/AlbumManagement.vue'
import Dashboard from '@/components/manager/Dashboard.vue'

const authStore = useAuthStore()
const router = useRouter()
const activeMenu = ref('dashboard')

const menuItems = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'users', label: '用户管理' },
  { key: 'notices', label: '通知管理' },
  { key: 'albums', label: '相册管理' },
]

const onLoginSuccess = () => {
  activeMenu.value = 'dashboard'
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
