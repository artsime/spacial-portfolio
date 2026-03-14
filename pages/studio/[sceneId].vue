<template>
  <div class="studio-page">
    <Navigation />
    
    <main class="stage-wrapper">
      <SpatialStage 
        :width="dimensions.width" 
        :height="dimensions.height" 
      />
    </main>
    
    <StudioToolbar />
    
    <div class="studio-notice">
      <span class="badge">STUDIO MODE</span>
      <span>Press Cmd/Ctrl + E to toggle studio mode</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '~/stores/scene'
import { useStudioStore } from '~/stores/studio'
import mainScene from '~/content/scenes/main-scene.json'
import projects from '~/content/projects/projects.json'
import SpatialStage from '~/components/stage/SpatialStage.vue'
import Navigation from '~/components/shell/Navigation.vue'
import StudioToolbar from '~/components/shell/StudioToolbar.vue'

const sceneStore = useSceneStore()
const studioStore = useStudioStore()

const dimensions = ref({
  width: typeof window !== 'undefined' ? window.innerWidth : 1920,
  height: typeof window !== 'undefined' ? window.innerHeight - 64 : 1080,
})

// Load scene data and enable studio mode
onMounted(() => {
  sceneStore.loadScene(mainScene as any)
  sceneStore.loadProjects(projects as any)
  studioStore.enableStudioMode()
  
  // Handle window resize
  const handleResize = () => {
    dimensions.value = {
      width: window.innerWidth,
      height: window.innerHeight - 64,
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // Keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Studio mode toggle (Cmd/Ctrl + E)
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      e.preventDefault()
      studioStore.toggleStudioMode()
    }
    
    // Tool shortcuts
    switch (e.key) {
      case 'v':
      case 'Escape':
        studioStore.setActiveTool('select')
        break
      case 'p':
        studioStore.setActiveTool('pen')
        break
      case 's':
        if (!e.metaKey && !e.ctrlKey) {
          studioStore.setActiveTool('shape')
        }
        break
      case 't':
        studioStore.setActiveTool('text')
        break
      case 'i':
        studioStore.setActiveTool('image')
        break
    }
    
    // Undo/Redo
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault()
      if (e.shiftKey) {
        studioStore.redo()
      } else {
        studioStore.undo()
      }
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeyDown)
    studioStore.disableStudioMode()
  })
})

useHead({
  title: 'Studio - Spatial Portfolio',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped lang="scss">
.studio-page {
  min-height: 100vh;
  background: #f8f7f4;
}

.stage-wrapper {
  padding-top: 64px;
  height: 100vh;
}

.studio-notice {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 45;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #1a1a1a;
  color: white;
  font-size: 13px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.badge {
  padding: 4px 8px;
  background: #3b82f6;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}
</style>
