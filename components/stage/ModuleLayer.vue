<template>
  <v-group>
    <component
      v-for="module in modules"
      :key="module.id"
      :is="getModuleComponent(module.type)"
      :module="module"
    />
  </v-group>
</template>

<script setup lang="ts">
import type { ModuleNode } from '~/types/scene-schema'
import TextModule from '../modules/TextModule.vue'
import ImageModule from '../modules/ImageModule.vue'
import ProjectCardModule from '../modules/ProjectCardModule.vue'
import NavModule from '../modules/NavModule.vue'
import ShapeModule from '../modules/ShapeModule.vue'

interface Props {
  modules: ModuleNode[]
}

defineProps<Props>()

const getModuleComponent = (type: string) => {
  switch (type) {
    case 'text': return TextModule
    case 'image': return ImageModule
    case 'project-card': return ProjectCardModule
    case 'nav': return NavModule
    case 'shape': return ShapeModule
    default: return null
  }
}
</script>
