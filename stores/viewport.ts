import { defineStore } from 'pinia'
import type { ViewportState } from '~/types/scene-schema'

interface ViewportStoreState extends ViewportState {
  minScale: number
  maxScale: number
  worldWidth: number
  worldHeight: number
  focusedFrameId: string | null
  isTransitioning: boolean
}

const DEFAULT_VIEWPORT: ViewportState = {
  x: 0,
  y: 0,
  scale: 1,
}

export const useViewportStore = defineStore('viewport', {
  state: (): ViewportStoreState => ({
    ...DEFAULT_VIEWPORT,
    minScale: 0.1,
    maxScale: 3,
    worldWidth: 5000,
    worldHeight: 5000,
    focusedFrameId: null,
    isTransitioning: false,
  }),

  actions: {
    setViewport(viewport: Partial<ViewportState>) {
      Object.assign(this, viewport)
    },

    pan(dx: number, dy: number) {
      this.x += dx / this.scale
      this.y += dy / this.scale
    },

    zoom(factor: number, centerX?: number, centerY?: number) {
      const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * factor))

      if (centerX !== undefined && centerY !== undefined) {
        const worldX = (centerX - this.x) / this.scale
        const worldY = (centerY - this.y) / this.scale

        this.scale = newScale
        this.x = centerX - worldX * newScale
        this.y = centerY - worldY * newScale
      } else {
        this.scale = newScale
      }
    },

    zoomTo(scale: number, centerX?: number, centerY?: number) {
      const newScale = Math.max(this.minScale, Math.min(this.maxScale, scale))

      if (centerX !== undefined && centerY !== undefined) {
        const worldX = (centerX - this.x) / this.scale
        const worldY = (centerY - this.y) / this.scale

        this.scale = newScale
        this.x = centerX - worldX * newScale
        this.y = centerY - worldY * newScale
      } else {
        this.scale = newScale
      }
    },

    resetViewport() {
      Object.assign(this, DEFAULT_VIEWPORT)
      this.focusedFrameId = null
    },

    focusOnFrame(frameId: string | null, animate = true) {
      this.focusedFrameId = frameId
      this.isTransitioning = animate
    },

    focusOnPoint(x: number, y: number, scale = 1, animate = true) {
      const targetScale = Math.max(this.minScale, Math.min(this.maxScale, scale))
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

      this.x = viewportWidth / 2 - x * targetScale
      this.y = viewportHeight / 2 - y * targetScale
      this.scale = targetScale
      this.isTransitioning = animate
    },

    setWorldBounds(width: number, height: number) {
      this.worldWidth = width
      this.worldHeight = height
    },

    setScaleBounds(min: number, max: number) {
      this.minScale = min
      this.maxScale = max
    },
  },
})
