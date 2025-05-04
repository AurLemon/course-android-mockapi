<template>
  <div class="bg-[var(--color-surface-0)] h-full flex-row">
    <div class="w-54 bg-[var(--color-surface-2)] p-4 flex flex-col">
      <div class="user-info flex p-4">
        <div class="name mb-2">
          <div class="nick text-2xl font-medium">
            {{ authStore.user?.username }}
          </div>
          <div class="text-sm text-[var(--color-text--subtle)]">当前用户</div>
        </div>
      </div>

      <div class="space-y-2 flex-grow">
        <router-link
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.path"
          custom
          v-slot="{ navigate, isExactActive }"
        >
          <button
            @click="navigate"
            class="w-full font-medium text-sm text-left py-2 px-4 rounded-lg transition-colors"
            :class="
              isExactActive
                ? 'bg-[var(--color-primary)] text-white'
                : 'hover:bg-[var(--background-color-primary--active)]'
            "
          >
            {{ item.label }}
          </button>
        </router-link>
      </div>

      <button
        @click="logout"
        class="logout text-white p-1 w-full bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
      >
        退出登录
      </button>
    </div>

    <div class="flex-grow p-6 overflow-y-auto">
      <router-view></router-view>
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
