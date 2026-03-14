<template>
  <div class="world-page">
    <div v-if="sceneError" class="scene-error">
      <p>Failed to load scene: {{ sceneError }}</p>
    </div>

    <template v-else>
      <Navigation />

      <main class="stage-wrapper">
        <SpatialStage
          :width="dimensions.width"
          :height="dimensions.height"
        />
      </main>

      <ProjectOverlay />
      <StudioToolbar />
      <ViewportControls />
      <PagesPanel />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSceneStore } from '~/stores/scene'
import { useStudioStore } from '~/stores/studio'
import { useSceneLoader } from '~/composables/useSceneLoader'
import { useKeyboard } from '~/composables/useKeyboard'
import { NAV_HEIGHT } from '~/utils/constants'
import mainScene from '~/content/scenes/main-scene.json'
import projects from '~/content/projects/projects.json'
import SpatialStage from '~/components/stage/SpatialStage.vue'
import Navigation from '~/components/shell/Navigation.vue'
import ProjectOverlay from '~/components/overlays/ProjectOverlay.vue'
import StudioToolbar from '~/components/shell/StudioToolbar.vue'
import ViewportControls from '~/components/shell/ViewportControls.vue'
import PagesPanel from '~/components/shell/PagesPanel.vue'

const sceneStore = useSceneStore()
const studioStore = useStudioStore()

const sceneError = ref<string | null>(null)

const dimensions = ref({
  width: typeof window !== 'undefined' ? window.innerWidth : 1920,
  height: typeof window !== 'undefined' ? window.innerHeight - NAV_HEIGHT : 1080,
})

onMounted(() => {
  const { loadSceneFromJSON, loadProjectsFromJSON } = useSceneLoader()
  try {
    const scene = loadSceneFromJSON(mainScene)
    const loadedProjects = loadProjectsFromJSON(projects as unknown[])
    sceneStore.loadScene(scene)
    sceneStore.loadProjects(loadedProjects)
  } catch (e) {
    sceneError.value = e instanceof Error ? e.message : 'Unknown error'
  }

  const handleResize = () => {
    dimensions.value = {
      width: window.innerWidth,
      height: window.innerHeight - NAV_HEIGHT,
    }
  }
  window.addEventListener('resize', handleResize)
  onUnmounted(() => window.removeEventListener('resize', handleResize))
})

// Keyboard shortcuts
const { registerHandler } = useKeyboard()

registerHandler('v', () => studioStore.setActiveTool('select'))
registerHandler('escape', () => studioStore.setActiveTool('select'))
registerHandler('f', () => studioStore.setActiveTool('frame'))
registerHandler('t', () => studioStore.setActiveTool('text'))
registerHandler('s', (e) => { if (!e.metaKey && !e.ctrlKey) studioStore.setActiveTool('shape') })
registerHandler('i', () => studioStore.setActiveTool('image'))
registerHandler('c', (e) => { if (!e.metaKey && !e.ctrlKey) studioStore.setActiveTool('component') })

const undoHandler = (e: KeyboardEvent) => {
  e.preventDefault()
  studioStore.undo()
}
registerHandler('meta+z', undoHandler)
registerHandler('ctrl+z', undoHandler)

const redoHandler = (e: KeyboardEvent) => {
  e.preventDefault()
  studioStore.redo()
}
registerHandler('meta+shift+z', redoHandler)
registerHandler('ctrl+shift+z', redoHandler)

useHead({
  title: 'World - Spatial Portfolio',
})
</script>

<style scoped lang="scss">
.world-page {
  min-height: 100vh;
  background: #f8f7f4;
}

.stage-wrapper {
  padding-top: var(--nav-height);
  height: 100vh;
}

.scene-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #c00;
  font-family: monospace;
  font-size: 14px;
}
</style>
