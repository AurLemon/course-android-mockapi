<template>
  <header class="page-header">
    <div class="page-header-text font-bold text-lg">Mock API</div>
    <div class="page-header-router">
      <RouterLink to="/" class="page-header-link" :active-class="'active'"
        >介绍</RouterLink
      >
      <RouterLink
        to="/manager"
        class="page-header-link"
        :active-class="'active'"
        :class="{ active: $route.path.startsWith('/manager') }"
        >后台</RouterLink
      >
      <RouterLink to="/demo" class="page-header-link" :active-class="'active'"
        >演示</RouterLink
      >
      <RouterLink to="/docs" class="page-header-link" :active-class="'active'"
        >文档</RouterLink
      >
    </div>
    <div class="page-header-repo flex justify-end">
      <a
        href="https://github.com/AurLemon/course-android-mockapi"
        target="_blank"
        class="block duration-300 hover:opacity-70"
      >
        <img src="@/assets/icons/symbols/github.svg" class="block w-6 h-6" />
      </a>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.page-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: center;
  align-items: center;
  padding: 0.875rem 2rem;
  width: 100%;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--background-light-1);
  border-bottom: 1px solid var(--border-color-base);
  backdrop-filter: blur(12px);

  .page-header-router {
    display: flex;
    justify-content: center;
    gap: 1.25rem;

    .page-header-link {
      color: var(--color-text--subtle);
      font-size: 0.9375rem;
      text-decoration: none;
      user-select: none;
      position: relative;
      transition: 300ms;

      &::before {
        content: '';
        position: absolute;
        top: calc(100% + 2px);
        left: 50%;
        transform: translate(-50%, 8px) scale(0.4);
        opacity: 0;
        width: 95%;
        height: 3px;
        border-radius: 4px;
        background: var(--color-primary);
        transition: 400ms;
      }

      &:hover {
        color: var(--color-primary);

        &::before {
          transform: translate(-50%, 1px) scale(0.6);
          opacity: 0.5;
        }
      }

      &.active {
        color: var(--color-primary);
        font-weight: 600;

        &::before {
          transform: translate(-50%, 0);
          opacity: 1;
        }

        &:hover {
          &::before {
            opacity: 0.7;
          }
        }
      }
    }
  }
}
</style>
