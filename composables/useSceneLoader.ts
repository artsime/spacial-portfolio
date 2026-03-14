import { validateScene, validateProject } from '~/types/scene-schema'
import type { SceneDocument, Project } from '~/types/scene-schema'

export function useSceneLoader() {
  const loadSceneFromJSON = (data: unknown): SceneDocument => {
    try {
      return validateScene(data)
    } catch (error) {
      console.error('Failed to validate scene:', error)
      throw new Error('Invalid scene document')
    }
  }

  const loadProjectsFromJSON = (data: unknown[]): Project[] => {
    return data.map(project => {
      try {
        return validateProject(project)
      } catch (error) {
        console.error('Failed to validate project:', error)
        throw new Error('Invalid project document')
      }
    })
  }

  return {
    loadSceneFromJSON,
    loadProjectsFromJSON,
  }
}
