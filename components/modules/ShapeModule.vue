<template>
  <v-group
    :config="{
      x: module.x,
      y: module.y,
      draggable: studioStore.activeTool === 'select',
    }"
    @mousedown="(e: any) => e.cancelBubble = true"
    @click="handleClick"
    @tap="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Shape -->
    <component
      :is="shapeComponent"
      :config="shapeConfig"
    />

    <!-- Selection/hover indicator -->
    <v-rect
      v-if="isSelected || isHovered"
      :config="{
        width: module.width,
        height: module.height,
        fill: 'transparent',
        stroke: isSelected ? '#3b82f6' : '#bbbbbb',
        strokeWidth: 1,
        dash: [4, 4],
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '~/stores/studio'
import { useSceneStore } from '~/stores/scene'
import type { ShapeModule } from '~/types/scene-schema'

interface Props {
  module: ShapeModule
}

const props = defineProps<Props>()

const studioStore = useStudioStore()
const sceneStore = useSceneStore()
const isHovered = ref(false)

const isSelected = computed(() => studioStore.selectedIds.includes(props.module.id))

const commonProps = computed(() => ({
  fill: props.module.fill,
  stroke: props.module.stroke,
  strokeWidth: props.module.strokeWidth,
  opacity: props.module.opacity,
}))

const shapeComponent = computed(() => {
  switch (props.module.shapeType) {
    case 'circle': return 'v-circle'
    case 'triangle': return 'v-regular-polygon'
    case 'line': return 'v-line'
    case 'rect':
    default: return 'v-rect'
  }
})

const shapeConfig = computed(() => {
  switch (props.module.shapeType) {
    case 'circle':
      return {
        x: props.module.width / 2,
        y: props.module.height / 2,
        radius: Math.min(props.module.width, props.module.height) / 2,
        ...commonProps.value,
      }
    case 'triangle':
      return {
        x: props.module.width / 2,
        y: props.module.height / 2,
        sides: 3,
        radius: Math.min(props.module.width, props.module.height) / 2,
        ...commonProps.value,
      }
    case 'line':
      return {
        points: [0, props.module.height / 2, props.module.width, props.module.height / 2],
        stroke: props.module.stroke || '#1a1a1a',
        strokeWidth: props.module.strokeWidth,
        opacity: props.module.opacity,
      }
    case 'rect':
    default:
      return {
        width: props.module.width,
        height: props.module.height,
        ...commonProps.value,
      }
  }
})

const handleClick = (e: any) => {
  e.cancelBubble = true
  if (studioStore.activeTool === 'select') {
    studioStore.select(props.module.id, e.evt?.shiftKey)
  }
}

const handleMouseEnter = () => { isHovered.value = true }
const handleMouseLeave = () => { isHovered.value = false }

const handleDragStart = () => {
  if (sceneStore.scene) studioStore.pushHistory(sceneStore.scene)
}

const handleDragEnd = (e: any) => {
  sceneStore.updateModule(props.module.id, { x: e.target.x(), y: e.target.y() })
}
</script>
