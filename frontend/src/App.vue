<template>
  <div
    class="page-wrapper h-screen flex flex-col"
    :class="{ 'bg-animated': route.path === '/' }"
  >
    <div class="corner tl" v-if="route.path === '/'"></div>
    <div class="corner tr" v-if="route.path === '/'"></div>
    <div class="corner br" v-if="route.path === '/'"></div>
    <div class="corner bl" v-if="route.path === '/'"></div>
    <PageHeader />
    <div class="page-container flex flex-col flex-1 overflow-hidden">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" class="flex flex-col flex-1" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'

import PageHeader from './components/layouts/PageHeader.vue'

const route = useRoute()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/media_screen.scss' as media;

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-wrapper {
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

  &.bg-animated {
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

  @include media.media-screen(phone) {
    min-height: 100vh;
    overflow: auto !important;

    .page-container {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
