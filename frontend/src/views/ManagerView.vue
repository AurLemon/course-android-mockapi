<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="flex h-screen">
      <div class="w-64 bg-blue-800 text-white p-4 flex flex-col">
        <div class="text-xl font-bold mb-8">学生管理系统</div>

        <div class="space-y-2 flex-grow">
          <router-link
            v-for="(item, index) in menuItems"
            :key="index"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }"
          >
            <button
              @click="navigate"
              class="w-full text-left py-2 px-4 rounded-md transition-colors"
              :class="isActive ? 'bg-blue-600' : 'hover:bg-blue-700'"
            >
              {{ item.label }}
            </button>
          </router-link>
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
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const menuItems = [
  { path: '/manager', label: '仪表盘' },
  { path: '/manager/users', label: '用户管理' },
  { path: '/manager/notices', label: '通知管理' },
  { path: '/manager/albums', label: '相册管理' },
]

const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
