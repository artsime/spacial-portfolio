<template>
  <nav class="navigation">
    <!-- Logo -->
    <button class="logo" @click="handleHomeClick">
      Siméon Artamonov
    </button>

    <!-- Desktop Nav Links — Work and Contact only -->
    <div class="nav-links">
      <button
        v-for="frame in navFrames"
        :key="frame.id"
        :class="['nav-link', { active: sceneStore.currentFrameId === frame.id }]"
        @click="handleNavClick(frame.id)"
      >
        {{ frame.name }}
      </button>
    </div>

    <!-- Mobile Menu Button -->
    <button
      class="menu-button"
      :aria-label="appStore.isMenuOpen ? 'Close menu' : 'Open menu'"
      @click="appStore.toggleMenu"
    >
      <Menu v-if="!appStore.isMenuOpen" class="icon" />
      <X v-else class="icon" />
    </button>
  </nav>

  <!-- Mobile Menu Overlay -->
  <div v-if="appStore.isMenuOpen" class="mobile-menu">
    <div class="backdrop" @click="appStore.closeMenu" />
    <div class="menu-panel">
      <button
        v-for="frame in navFrames"
        :key="frame.id"
        class="menu-item"
        @click="handleNavClick(frame.id)"
      >
        <span>{{ frame.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
import { useSceneStore } from '~/stores/scene'
import { useViewportStore } from '~/stores/viewport'
import { useAppStore } from '~/stores/app'

const sceneStore = useSceneStore()
const viewportStore = useViewportStore()
const appStore = useAppStore()

const NAV_SLUGS = ['work', 'contact']
const navFrames = computed(() =>
  sceneStore.scene?.frames.filter(f => NAV_SLUGS.includes(f.slug)) || [],
)

const handleNavClick = (frameId: string) => {
  viewportStore.focusOnFrame(frameId)
  appStore.closeMenu()
}

const handleHomeClick = () => {
  const homeFrame = sceneStore.scene?.frames.find(f => f.slug === 'home')
  if (homeFrame) {
    viewportStore.focusOnFrame(homeFrame.id)
  }
  appStore.closeMenu()
}
</script>

<style scoped lang="scss">
.navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f0f0f0;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  transition: color 0.2s;

  &:hover {
    color: #3b82f6;
  }
}

.nav-links {
  display: none;
  align-items: center;
  gap: 4px;

  @media (min-width: 768px) {
    display: flex;
  }
}

.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: #1a1a1a;
    background: #f5f5f5;
  }

  &.active {
    color: #1a1a1a;
    background: #f0f0f0;
  }
}

.menu-button {
  display: flex;
  padding: 8px;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: #1a1a1a;
    background: #f5f5f5;
  }

  @media (min-width: 768px) {
    display: none;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}

.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 55;

  @media (min-width: 768px) {
    display: none;
  }
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
}

.menu-panel {
  position: absolute;
  top: 72px;
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid #f0f0f0;
  padding: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  color: #444;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: #1a1a1a;
    background: #f8f8f8;
  }
}
</style>
