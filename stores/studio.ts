import { defineStore } from 'pinia'
import type { StudioTool, ModuleNode, SceneDocument } from '~/types/scene-schema'
import { MAX_HISTORY_SIZE } from '~/utils/constants'
import { useSceneStore } from '~/stores/scene'

interface StudioState {
  activeTool: StudioTool
  selectedIds: string[]
  clipboard: ModuleNode[]
  history: SceneDocument[]
  historyIndex: number
  maxHistorySize: number
  isDirty: boolean
}

export const useStudioStore = defineStore('studio', {
  state: (): StudioState => ({
    activeTool: 'hand',
    selectedIds: [],
    clipboard: [],
    history: [],
    historyIndex: -1,
    maxHistorySize: MAX_HISTORY_SIZE,
    isDirty: false,
  }),

  getters: {
    canUndo: (state) => state.historyIndex > 0,
    canRedo: (state) => state.historyIndex < state.history.length - 1,
  },

  actions: {
    setActiveTool(tool: StudioTool) {
      this.activeTool = tool
    },

    select(id: string, multi = false) {
      if (multi) {
        if (this.selectedIds.includes(id)) {
          this.selectedIds = this.selectedIds.filter(sid => sid !== id)
        } else {
          this.selectedIds.push(id)
        }
      } else {
        this.selectedIds = [id]
      }
    },

    deselect(id: string) {
      this.selectedIds = this.selectedIds.filter(sid => sid !== id)
    },

    clearSelection() {
      this.selectedIds = []
    },

    selectAll(ids: string[]) {
      this.selectedIds = ids
    },

    copy(modules: ModuleNode[]) {
      this.clipboard = modules
    },

    paste(): ModuleNode[] {
      return this.clipboard.map(module => ({
        ...module,
        id: `${module.id}-copy-${Date.now()}`,
        x: module.x + 20,
        y: module.y + 20,
      }))
    },

    pushHistory(scene: SceneDocument) {
      const newHistory = this.history.slice(0, this.historyIndex + 1)
      newHistory.push(structuredClone(scene))

      if (newHistory.length > this.maxHistorySize) {
        newHistory.shift()
      }

      this.history = newHistory
      this.historyIndex = newHistory.length - 1
      this.isDirty = true
    },

    undo() {
      if (this.historyIndex <= 0) return
      this.historyIndex--
      const scene = this.history[this.historyIndex]
      useSceneStore().loadScene(structuredClone(scene))
    },

    redo() {
      if (this.historyIndex >= this.history.length - 1) return
      this.historyIndex++
      const scene = this.history[this.historyIndex]
      useSceneStore().loadScene(structuredClone(scene))
    },

    markDirty() {
      this.isDirty = true
    },

    markClean() {
      this.isDirty = false
    },
  },

  persist: {
    paths: ['activeTool'],
  },
})
