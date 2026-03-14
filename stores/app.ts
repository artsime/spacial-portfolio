import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'accent'

interface AppState {
  activeProjectId: string | null
  activeProjectSlug: string | null
  currentTheme: Theme
  reducedMotion: boolean
  isProjectOverlayOpen: boolean
  isMenuOpen: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    activeProjectId: null,
    activeProjectSlug: null,
    currentTheme: 'light',
    reducedMotion: false,
    isProjectOverlayOpen: false,
    isMenuOpen: false,
  }),

  actions: {
    setActiveProject(id: string | null, slug?: string | null) {
      this.activeProjectId = id
      this.activeProjectSlug = slug || null
    },

    openProjectOverlay(projectId: string, slug?: string) {
      this.activeProjectId = projectId
      this.activeProjectSlug = slug || null
      this.isProjectOverlayOpen = true
    },

    closeProjectOverlay() {
      this.activeProjectId = null
      this.activeProjectSlug = null
      this.isProjectOverlayOpen = false
    },

    setTheme(theme: Theme) {
      this.currentTheme = theme
    },

    toggleReducedMotion() {
      this.reducedMotion = !this.reducedMotion
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    closeMenu() {
      this.isMenuOpen = false
    },
  },

  persist: {
    paths: ['reducedMotion', 'currentTheme'],
  },
})
