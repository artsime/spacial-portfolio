import { defineStore } from 'pinia'
import type { SceneDocument, FrameNode, ModuleNode, Project } from '~/types/scene-schema'

interface SceneState {
  scene: SceneDocument | null
  projects: Project[]
  frameIndex: Map<string, FrameNode>
  moduleIndex: Map<string, ModuleNode>
  projectIndex: Map<string, Project>
  currentFrameId: string | null
  isLoading: boolean
  loadedAssets: Set<string>
}

export const useSceneStore = defineStore('scene', {
  state: (): SceneState => ({
    scene: null,
    projects: [],
    frameIndex: new Map(),
    moduleIndex: new Map(),
    projectIndex: new Map(),
    currentFrameId: null,
    isLoading: true,
    loadedAssets: new Set(),
  }),

  getters: {
    frames: (state) => state.scene?.frames || [],
    navFrames: (state) => (state.scene?.frames || []).filter(f => f.showInNav !== false),
    getProjectById: (state) => (id: string) => state.projectIndex.get(id),
    getProjectBySlug: (state) => (slug: string) => state.projects.find(p => p.slug === slug),
    getFrameById: (state) => (id: string) => state.frameIndex.get(id),
    getModuleById: (state) => (id: string) => state.moduleIndex.get(id),
  },

  actions: {
    loadScene(scene: SceneDocument) {
      const frameIndex = new Map(scene.frames.map(f => [f.id, f]))
      const moduleIndex = new Map(scene.modules.map(m => [m.id, m]))

      this.scene = scene
      this.frameIndex = frameIndex
      this.moduleIndex = moduleIndex
      this.isLoading = false
      this.currentFrameId = scene.frames[0]?.id || null
    },

    loadProjects(projects: Project[]) {
      const projectIndex = new Map(projects.map(p => [p.id, p]))
      this.projects = projects
      this.projectIndex = projectIndex
    },

    setCurrentFrame(frameId: string | null) {
      this.currentFrameId = frameId
    },

    markAssetLoaded(assetId: string) {
      this.loadedAssets.add(assetId)
    },

    // Frame actions
    addFrame(frame: FrameNode) {
      if (!this.scene) return
      this.frameIndex.set(frame.id, frame)
      this.scene.frames.push(frame)
    },

    removeFrame(frameId: string) {
      if (!this.scene) return
      this.frameIndex.delete(frameId)
      this.scene.frames = this.scene.frames.filter(f => f.id !== frameId)
      // Also remove all modules belonging to this frame
      const toRemove = this.scene.modules.filter(m => m.frameId === frameId).map(m => m.id)
      toRemove.forEach(id => this.moduleIndex.delete(id))
      this.scene.modules = this.scene.modules.filter(m => m.frameId !== frameId)
    },

    moveFrame(frameId: string, deltaX: number, deltaY: number) {
      if (!this.scene) return
      const frame = this.frameIndex.get(frameId)
      if (!frame) return

      const updatedFrame = { ...frame, x: frame.x + deltaX, y: frame.y + deltaY }
      this.frameIndex.set(frameId, updatedFrame)
      this.scene.frames = this.scene.frames.map(f => f.id === frameId ? updatedFrame : f)

      // Translate all modules belonging to this frame
      this.scene.modules = this.scene.modules.map(m => {
        if (m.frameId !== frameId) return m
        const updated = { ...m, x: m.x + deltaX, y: m.y + deltaY }
        this.moduleIndex.set(m.id, updated)
        return updated
      })
    },

    renameFrame(frameId: string, name: string) {
      if (!this.scene) return
      const frame = this.frameIndex.get(frameId)
      if (!frame) return
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const updated = { ...frame, name, slug }
      this.frameIndex.set(frameId, updated)
      this.scene.frames = this.scene.frames.map(f => f.id === frameId ? updated : f)
    },

    updateFrame(frameId: string, updates: Partial<FrameNode>) {
      const frame = this.frameIndex.get(frameId)
      if (!frame || !this.scene) return
      const updatedFrame = { ...frame, ...updates }
      this.frameIndex.set(frameId, updatedFrame)
      this.scene.frames = this.scene.frames.map(f => f.id === frameId ? updatedFrame : f)
    },

    // Module actions
    updateModule(moduleId: string, updates: Partial<ModuleNode>) {
      const module = this.moduleIndex.get(moduleId)
      if (!module || !this.scene) return
      const updatedModule = { ...module, ...updates } as ModuleNode
      this.moduleIndex.set(moduleId, updatedModule)
      this.scene.modules = this.scene.modules.map(m => m.id === moduleId ? updatedModule : m)
    },

    addModule(module: ModuleNode) {
      this.moduleIndex.set(module.id, module)
      if (this.scene) {
        this.scene.modules.push(module)
      }
    },

    removeModule(moduleId: string) {
      this.moduleIndex.delete(moduleId)
      if (this.scene) {
        this.scene.modules = this.scene.modules.filter(m => m.id !== moduleId)
      }
    },
  },
})
