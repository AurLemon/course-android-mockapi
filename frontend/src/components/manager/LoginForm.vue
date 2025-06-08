<template>
  <div class="rounded-lg w-96">
    <h2
      class="text-2xl font-semibold mb-6 text-center text-[var(--color-text)]"
    >
      管理员登录
    </h2>

    <div v-if="errorMsg" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
      {{ errorMsg }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block mb-1 font-medium text-[var(--color-text--subtle)]"
          >用户名</label
        >
        <InputText
          v-model="username"
          type="text"
          class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入用户名"
          required
        />
      </div>

      <div>
        <label class="block mb-1 font-medium text-[var(--color-text--subtle)]"
          >密码</label
        >
        <InputText
          v-model="password"
          type="password"
          class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入密码"
          required
        />
      </div>

      <div>
        <Button
          type="submit"
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const emit = defineEmits(['login-success'])
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (loading.value) return

  errorMsg.value = ''
  loading.value = true

  try {
    const success = await authStore.login(username.value, password.value)

    if (success) {
      if (authStore.isAdmin) {
        emit('login-success')
      } else {
        errorMsg.value = '只有管理员可以访问此页面'
      }
    } else {
      errorMsg.value = '用户名或密码错误'
    }
  } catch (error) {
    errorMsg.value = '登录失败，请稍后再试'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>
