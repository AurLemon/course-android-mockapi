<template>
  <div class="page-demo overflow-y-auto">
    <div class="demo-container overflow-hidden rounded-lg shadow-lg border border-[var(--border-color-base--darker)]">
      <iframe src="/simulator" class="block w-full h-full" frameborder="0"></iframe>
    </div>
    <div class="demo-tips text-sm text-[var(--color-text--weaken)] mt-2">此 Demo APP 使用 Claude AI 生成，可能存在问题。</div>
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
@use '@/assets/styles/media_screen.scss' as media;

.page-demo {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;

  .demo-container {
    width: 400px;
    height: 850px;

    @include media.media-screen(phone) {
      width: 100%;
    }
  }

}
</style>
