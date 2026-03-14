<template>
  <Transition name="fade">
    <div v-if="appStore.isProjectOverlayOpen && project" class="project-overlay">
      <!-- Backdrop -->
      <div class="backdrop" @click="appStore.closeProjectOverlay" />
      
      <!-- Content Panel -->
      <Transition name="slide-up">
        <div v-if="appStore.isProjectOverlayOpen" class="content-panel">
          <!-- Close button -->
          <button
            class="close-button"
            aria-label="Close project"
            @click="appStore.closeProjectOverlay"
          >
            <X class="icon" />
          </button>
          
          <!-- Hero Image -->
          <div class="hero">
            <img
              :src="project.images[0]"
              :alt="project.title"
              class="hero-image"
            />
            <div class="hero-overlay" />
            <div class="hero-content">
              <h1 class="hero-title">{{ project.title }}</h1>
              <p class="hero-meta">{{ project.role }} · {{ project.date }}</p>
            </div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Tags -->
            <div class="tags">
              <span
                v-for="tag in project.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
            
            <!-- Description -->
            <div class="description">
              <p class="summary">{{ project.summary }}</p>
              <p class="full-description">{{ project.description }}</p>
            </div>
            
            <!-- Image Gallery -->
            <div v-if="project.images.length > 1" class="gallery">
              <h2 class="gallery-title">Gallery</h2>
              <div class="gallery-grid">
                <div
                  v-for="(image, index) in project.images.slice(1)"
                  :key="index"
                  class="gallery-item"
                >
                  <img
                    :src="image"
                    :alt="`${project.title} - ${index + 2}`"
                    class="gallery-image"
                  />
                </div>
              </div>
            </div>
            
            <!-- External Link -->
            <div v-if="project.externalLink" class="external-link">
              <a
                :href="project.externalLink"
                target="_blank"
                rel="noopener noreferrer"
                class="link-button"
              >
                View Live Project
                <ExternalLink class="icon" />
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X, ExternalLink } from 'lucide-vue-next'
import { useAppStore } from '~/stores/app'
import { useSceneStore } from '~/stores/scene'

const appStore = useAppStore()
const sceneStore = useSceneStore()

const project = computed(() => {
  if (!appStore.activeProjectId) return null
  return sceneStore.getProjectById(appStore.activeProjectId)
})

// Handle escape key
onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && appStore.isProjectOverlayOpen) {
      appStore.closeProjectOverlay()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
})

// Lock body scroll
watch(() => appStore.isProjectOverlayOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped lang="scss">
.project-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  overflow: auto;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.content-panel {
  position: relative;
  min-height: 100vh;
  margin: 0 auto;
  max-width: 896px;
  background: white;
  overflow: hidden;
  
  @media (min-width: 768px) {
    min-height: auto;
    margin: 32px auto;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  color: #666;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  
  &:hover {
    color: #1a1a1a;
    background: white;
  }
  
  .icon {
    width: 20px;
    height: 20px;
  }
}

.hero {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #f5f5f5;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  
  @media (min-width: 768px) {
    padding: 40px;
  }
}

.hero-title {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.hero-meta {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.content {
  padding: 24px;
  
  @media (min-width: 768px) {
    padding: 40px;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.tag {
  padding: 6px 12px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
}

.description {
  margin-bottom: 40px;
}

.summary {
  font-size: 20px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 24px;
}

.full-description {
  font-size: 16px;
  line-height: 1.7;
  color: #444;
}

.gallery {
  margin-bottom: 40px;
}

.gallery-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.gallery-item {
  aspect-ratio: 16 / 9;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
  
  &:hover {
    transform: scale(1.05);
  }
}

.external-link {
  padding-top: 32px;
  border-top: 1px solid #f0f0f0;
}

.link-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #1a1a1a;
  color: white;
  font-size: 15px;
  font-weight: 500;
  border-radius: 9999px;
  transition: background 0.2s;
  
  &:hover {
    background: #333;
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px) scale(0.95);
}
</style>
