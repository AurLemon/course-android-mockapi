<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <LoginForm @login-success="onLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LoginForm from '../components/manager/LoginForm.vue'

const router = useRouter()

const onLoginSuccess = () => {
  const redirectPath = sessionStorage.getItem('redirectPath') || '/manager'
  sessionStorage.removeItem('redirectPath')
  router.push(redirectPath)
}
</script>
