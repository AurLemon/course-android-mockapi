<template>
  <div class="page-home h-full p-4 px-8 justify-between items-center">
    <div
      class="main flex flex-col justify-between items-center p-4 pb-15 m-auto"
    >
      <main
        class="flex-grow flex flex-col justify-center items-center text-center"
      >
        <div
          class="main-content flex flex-col justify-center items-center gap-[0.5rem]"
        >
          <div class="logo">
            <div class="main">
              <div class="img-wrapper">
                <img src="@/assets/icons/site/main.gif" />
              </div>
            </div>
          </div>

          <h1 class="text-4xl font-bold text-[var(--color-text)]">
            Course Android Mock API
          </h1>
          <p class="max-w-md text-lg text-[var(--color-text)]">
            移动应用开发课程（Android）模拟 API
          </p>
        </div>
        <div class="links flex gap-2">
          <a href="/docs" class="block see-link docs" target="_blank"
            >查看文档</a
          >
          <RouterLink to="/demo" class="block see-link demo"
            >查看演示</RouterLink
          >
        </div>
      </main>
    </div>

    <footer class="w-full text-center">
      <div class="secondary-content flex flex-col justify-center items-center">
        <div class="project-stack">
          <img src="@/assets/icons/symbols/nestjs.svg" />
          <img src="@/assets/icons/symbols/postgresql.png" />
          <img src="@/assets/icons/symbols/vuejs.svg" />
        </div>
        <div class="desc">
          项目基于 Nest.js + PostgreSQL + Vue.js + TypeScript 构建，欢迎访问
          <a href="https://fjcpc-teps.aurlemon.top"
            >计大船政转轨考刷题系统 3.0</a
          >（Nest.js）。
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
.page-home {
  .logo {
    margin-bottom: 2rem;

    .main {
      .img-wrapper {
        position: relative;
        display: inline-block;
        padding: 10px;
        border-radius: 50%;
        transition: 400ms;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 32px;
          background: var(--border-color-base);
          transform: scale(0);
          transition: 500ms;
          z-index: 0;
        }

        &:hover{
          filter: drop-shadow(-4px 8px 16px #ffe02e96);
          
          &::before {
            transform: scale(1);
          }
        }

        img {
          display: block;
          width: 12rem;
          height: 12rem;
          object-fit: cover;
          border-radius: 32px;
          filter: drop-shadow(0 4px 8px var(--background-dark-0));
          user-select: none;
          z-index: 1;
          position: relative;
        }
      }
    }
  }

  .see-link {
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

    &.demo {
      color: #fff;
      background-color: var(--color-primary);

      &:hover {
        background-color: var(--color-primary--active);
      }
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
}
</style>
