<script setup lang="ts">
import MobileDemo from '../components/demo/MobileDemo.vue'
</script>

<template>
  <div class="page-demo overflow-y-auto">
    <div class="demo-container overflow-hidden rounded-lg shadow-lg border border-[var(--border-color-base--darker)]">
      <MobileDemo />
    </div>
  </div>
</template>

<style lang="scss">
.p-toast {
  z-index: 9999 !important;
}

.p-toast-container {
  z-index: 9999 !important;
}

.p-toast-message {
  z-index: 10000 !important;
}

</style>

<style lang="scss" scoped>
.page-demo {
  display: flex;
  justify-content: center;
  align-items: center;

  .demo-container {
    width: 400px;
    height: 850px;
  }
}
</style>
