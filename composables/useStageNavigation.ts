import { useSceneStore } from '~/stores/scene'
import { useViewportStore } from '~/stores/viewport'

export function useStageNavigation() {
  const sceneStore = useSceneStore()
  const viewportStore = useViewportStore()

  const navigateToFrame = (frameId: string, animate = true) => {
    const frame = sceneStore.getFrameById(frameId)
    if (!frame) return

    viewportStore.focusOnFrame(frameId, animate)
  }

  const navigateToNextFrame = () => {
    const frames = sceneStore.scene?.frames || []
    const currentIndex = frames.findIndex(f => f.id === sceneStore.currentFrameId)
    const nextIndex = (currentIndex + 1) % frames.length
    navigateToFrame(frames[nextIndex]?.id)
  }

  const navigateToPrevFrame = () => {
    const frames = sceneStore.scene?.frames || []
    const currentIndex = frames.findIndex(f => f.id === sceneStore.currentFrameId)
    const prevIndex = (currentIndex - 1 + frames.length) % frames.length
    navigateToFrame(frames[prevIndex]?.id)
  }

  const resetToHome = () => {
    const homeFrame = sceneStore.scene?.frames.find(f => f.slug === 'home')
    if (homeFrame) {
      navigateToFrame(homeFrame.id)
    } else {
      viewportStore.resetViewport()
    }
  }

  return {
    navigateToFrame,
    navigateToNextFrame,
    navigateToPrevFrame,
    resetToHome,
  }
}
