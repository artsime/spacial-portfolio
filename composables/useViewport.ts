import { useViewportStore } from '~/stores/viewport'

export function useViewport() {
  const viewportStore = useViewportStore()

  const screenToWorld = (screenX: number, screenY: number) => {
    return {
      x: (screenX - viewportStore.x) / viewportStore.scale,
      y: (screenY - viewportStore.y) / viewportStore.scale,
    }
  }

  const worldToScreen = (worldX: number, worldY: number) => {
    return {
      x: worldX * viewportStore.scale + viewportStore.x,
      y: worldY * viewportStore.scale + viewportStore.y,
    }
  }

  const centerOnPoint = (worldX: number, worldY: number, scale?: number) => {
    const targetScale = scale || viewportStore.scale
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

    viewportStore.setViewport({
      x: viewportWidth / 2 - worldX * targetScale,
      y: viewportHeight / 2 - worldY * targetScale,
      scale: targetScale,
    })
  }

  return {
    screenToWorld,
    worldToScreen,
    centerOnPoint,
  }
}
