<template>
  <div v-if="project" class="project-page">
    <Navigation />
    
    <main class="content">
      <!-- Hero -->
      <div class="hero">
        <img
          :src="project.images[0]"
          :alt="project.title"
          class="hero-image"
        />
        <div class="hero-overlay" />
        <div class="hero-content">
          <h1 class="title">{{ project.title }}</h1>
          <p class="meta">{{ project.role }} · {{ project.date }}</p>
        </div>
      </div>
      
      <!-- Details -->
      <div class="details">
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
          <p class="full">{{ project.description }}</p>
        </div>
        
        <!-- Gallery -->
        <div v-if="project.images.length > 1" class="gallery">
          <h2>Gallery</h2>
          <div class="grid">
            <div
              v-for="(image, index) in project.images.slice(1)"
              :key="index"
              class="item"
            >
              <img
                :src="image"
                :alt="`${project.title} - ${index + 2}`"
              />
            </div>
          </div>
        </div>
        
        <!-- External Link -->
        <div v-if="project.externalLink" class="external">
          <a
            :href="project.externalLink"
            target="_blank"
            rel="noopener noreferrer"
            class="button"
          >
            View Live Project
            <ExternalLink class="icon" />
          </a>
        </div>
        
        <!-- Back -->
        <div class="back">
          <NuxtLink to="/world" class="back-link">
            <ArrowLeft class="icon" />
            Back to World
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
  
  <div v-else class="not-found">
    <Navigation />
    <div class="message">
      <h1>Project not found</h1>
      <NuxtLink to="/world">Return to World</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExternalLink, ArrowLeft } from 'lucide-vue-next'
import { useSceneStore } from '~/stores/scene'
import projects from '~/content/projects/projects.json'
import Navigation from '~/components/shell/Navigation.vue'

const route = useRoute()
const sceneStore = useSceneStore()

// Load projects
onMounted(() => {
  sceneStore.loadProjects(projects as any)
})

const project = computed(() => {
  return sceneStore.getProjectBySlug(route.params.slug as string)
})

useHead(() => ({
  title: project.value ? `${project.value.title} - Project` : 'Project Not Found',
}))
</script>

<style scoped lang="scss">
.project-page {
  min-height: 100vh;
  background: #f8f7f4;
}

.content {
  padding-top: 64px;
}

.hero {
  position: relative;
  aspect-ratio: 21 / 9;
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 60%);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.meta {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.details {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.tag {
  padding: 6px 14px;
  background: #f0f0f0;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
}

.description {
  margin-bottom: 48px;
}

.summary {
  font-size: 22px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 24px;
}

.full {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
}

.gallery {
  margin-bottom: 48px;
}

.gallery h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.item {
  aspect-ratio: 16 / 10;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.item:hover img {
  transform: scale(1.05);
}

.external {
  margin-bottom: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid #e0e0e0;
}

.button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: #1a1a1a;
  color: white;
  font-size: 15px;
  font-weight: 500;
  border-radius: 9999px;
  transition: background 0.2s;
}

.button:hover {
  background: #333;
}

.icon {
  width: 18px;
  height: 18px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 15px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1a1a1a;
}

.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f7f4;
}

.message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 48px;
}

.message h1 {
  font-size: 32px;
  font-weight: 600;
}

.message a {
  padding: 12px 24px;
  background: #1a1a1a;
  color: white;
  border-radius: 9999px;
  font-weight: 500;
}
</style>
