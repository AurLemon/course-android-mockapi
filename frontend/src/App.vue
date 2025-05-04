<script setup>
import { RouterLink, RouterView } from 'vue-router'
import PageHeader from './components/layouts/PageHeader.vue'
</script>

<template>
  <div class="page-wrapper min-h-screen flex flex-col">
    <PageHeader />
    <div class="page-container flex flex-col flex-1">
      <router-view class="flex flex-col flex-1" />
    </div>
  </div>
</template>
