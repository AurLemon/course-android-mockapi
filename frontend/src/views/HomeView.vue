<template>
  <div
    class="page-home min-h-screen flex flex-col justify-between items-center bg-animated"
  >
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner br"></div>
    <div class="corner bl"></div>

    <header class="page-header">
      <div class="page-header-text font-bold text-lg">Mock API</div>
      <div class="page-header-router">
        <RouterLink to="/" class="page-header-link" :active-class="'active'"
          >介绍</RouterLink
        >
        <RouterLink to="/docs" class="page-header-link" :active-class="'active'"
          >文档</RouterLink
        >
        <RouterLink
          to="/manager"
          class="page-header-link"
          :active-class="'active'"
          >后台</RouterLink
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

    <div class="main flex flex-col justify-between items-center p-4 pb-15">
      <main
        class="flex-grow flex flex-col justify-center items-center text-center"
      >
        <div
          class="main-content flex flex-col justify-center items-center gap-[0.5rem]"
        >
          <div class="logo">
            <div class="main">
              <img src="@/assets/icons/site/main.gif" />
            </div>
          </div>

          <h1 class="text-4xl font-bold text-[var(--color-text)]">
            Course Android Mock API
          </h1>
          <p class="max-w-md text-lg text-[var(--color-text)]">
            移动应用开发课程（Android）模拟 API
          </p>
        </div>
        <a href="/docs" class="block see-docs">查看文档</a>
      </main>
    </div>

    <footer class="w-full text-center py-4">
      <div class="secondary-content flex flex-col justify-center items-center">
        <div class="project-stack">
          <img src="@/assets/icons/symbols/nestjs.svg" />
          <img src="@/assets/icons/symbols/postgresql.png" />
          <img src="@/assets/icons/symbols/vuejs.svg" />
        </div>
        <div class="desc">
          项目基于 Nest.js + PostgreSQL + Vue.js + TypeScript 构建，欢迎访问
          <a href="https://fjcpc-teps.aurlemon.top">计大船政转轨考刷题系统 3.0</a>（Nest.js）。
        </div>
      </div>
      <span>
        <a
          class="text-sm !text-[var(--color-text--weaken)]"
          href="https://beian.miit.gov.cn/"
          >闽ICP备2023007345号-3</a
        >
      </span>
    </footer>
  </div>
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

      &.active {
        color: var(--color-primary);
        font-weight: 600;
      }

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}

.logo {
  margin-bottom: 2rem;

  .main {
    img {
      display: block;
      width: 12rem;
      height: 12rem;
      object-fit: cover;
      border-radius: 50%;
      filter: drop-shadow(0 4px 8px var(--background-dark-0));
    }
  }
}

.see-docs {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color-base--lighter);
  border-radius: 10px;
  background-color: var(--color-surface-2);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: 300ms;

  &:hover {
    background-color: var(--color-surface-3);
  }
}

.secondary-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 2rem;

  .project-stack {
    display: flex;
    gap: 0.75rem;

    img {
      display: block;
      width: 1.5rem;
      height: 1.5rem;
      user-select: none;
    }
  }

  .desc {
    color: var(--color-text--subtle);
    font-size: 13px;
  }
}

.bg-animated {
  position: relative;
  overflow: hidden;

  &::before,
  &::after,
  .corner {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }

  .corner {
    background-size: cover;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 4s ease-in-out;
  }

  .corner.tl {
    background: linear-gradient(
      to bottom right,
      rgba(183, 232, 255, 0.175),
      transparent 70%
    );
    animation: cornerFade 8s infinite ease-in-out;
    animation-delay: 0s;
  }

  .corner.tr {
    background: linear-gradient(
      to bottom left,
      rgba(255, 204, 255, 0.175),
      transparent 70%
    );
    animation: cornerFade 8s infinite ease-in-out;
    animation-delay: 2s;
  }

  .corner.br {
    background: linear-gradient(
      to top left,
      rgba(204, 255, 224, 0.175),
      transparent 70%
    );
    animation: cornerFade 8s infinite ease-in-out;
    animation-delay: 4s;
  }

  .corner.bl {
    background: linear-gradient(
      to top right,
      rgba(255, 230, 200, 0.175),
      transparent 70%
    );
    animation: cornerFade 8s infinite ease-in-out;
    animation-delay: 6s;
  }

  &::after {
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.4) 40%,
      transparent 70%
    );
  }
}

@keyframes cornerFade {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  23% {
    opacity: 1;
  }
  33% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
