<template>
  <div
    class="min-h-screen flex flex-col justify-between items-center p-4 bg-animated"
  >
    <!-- Main Content -->
    <div
      class="flex-grow flex flex-col justify-center items-center text-center space-y-6"
    >
      <h1 class="text-4xl font-extrabold text-gray-900">
        course-android-mockapi
      </h1>
      <p class="max-w-md text-lg text-gray-700">
        欢迎使用 course-android-mockapi！这是一个模拟 API
        服务，帮助您快速搭建安卓课程项目的后端接口。
      </p>
      <RouterLink to="/docs">
        <button
          class="inline-flex items-center px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-indigo-400 to-purple-400 text-white"
        >
          <i class="material-icons mr-2">menu_book</i>
          查看文档
        </button>
      </RouterLink>
    </div>

    <!-- Footer for ICP Record -->
    <footer class="w-full text-center py-4">
      <span class="text-sm text-gray-500">备案号：___________</span>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
// 彩色背景动画
@keyframes colorShift {
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(15deg);
  }
  100% {
    filter: hue-rotate(0deg);
  }
}

.bg-animated {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      linear-gradient(
        to bottom right,
        rgba(183, 232, 255, 0.6),
        transparent 70%
      ),
      linear-gradient(
        to bottom left,
        rgba(255, 204, 255, 0.6),
        transparent 70%
      ),
      linear-gradient(to top right, rgba(255, 230, 200, 0.6), transparent 70%),
      linear-gradient(to top left, rgba(204, 255, 224, 0.6), transparent 70%);
    z-index: -1;
    animation: colorShift 10s ease infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.4) 40%,
      transparent 70%
    );
    z-index: -1;
  }
}
</style>
