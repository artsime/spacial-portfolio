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
    <!-- Background -->
    <v-rect
      :config="{
        width: module.width,
        height: module.height,
        fill: styles.bg,
        stroke: isSelected ? '#3b82f6' : styles.border,
        strokeWidth: isSelected ? 2 : styles.borderWidth,
        cornerRadius: styles.cornerRadius,
      }"
    />

    <!-- Label -->
    <v-text
      :config="{
        width: module.width,
        height: module.height,
        text: module.label,
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fontStyle: module.style === 'text' ? '500' : '600',
        fill: styles.text,
        align: 'center',
        verticalAlign: 'middle',
      }"
    />

    <!-- Selection indicator -->
    <v-rect
      v-if="isSelected"
      :config="{
        width: module.width,
        height: module.height,
        stroke: '#3b82f6',
        strokeWidth: 2,
        dash: [4, 4],
        fill: 'transparent',
        cornerRadius: styles.cornerRadius,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '~/stores/studio'
import { useSceneStore } from '~/stores/scene'
import { useViewportStore } from '~/stores/viewport'
import type { NavModule } from '~/types/scene-schema'

interface Props {
  module: NavModule
}

const props = defineProps<Props>()

const studioStore = useStudioStore()
const sceneStore = useSceneStore()
const viewportStore = useViewportStore()
const isHovered = ref(false)

const isSelected = computed(() => studioStore.selectedIds.includes(props.module.id))
const targetFrame = computed(() => sceneStore.getFrameById(props.module.targetFrameId))

const styles = computed(() => {
  switch (props.module.style) {
    case 'button':
      return {
        bg: isHovered.value ? '#1a1a1a' : '#ffffff',
        text: isHovered.value ? '#ffffff' : '#1a1a1a',
        border: '#1a1a1a',
        borderWidth: 2,
        cornerRadius: 8,
      }
    case 'pill':
      return {
        bg: isHovered.value ? '#1a1a1a' : '#f0f0f0',
        text: isHovered.value ? '#ffffff' : '#1a1a1a',
        border: 'transparent',
        borderWidth: 0,
        cornerRadius: props.module.height / 2,
      }
    case 'text':
    default:
      return {
        bg: 'transparent',
        text: isHovered.value ? '#3b82f6' : '#1a1a1a',
        border: 'transparent',
        borderWidth: 0,
        cornerRadius: 0,
      }
  }
})

const handleClick = (e: any) => {
  e.cancelBubble = true
  if (studioStore.activeTool === 'select') {
    studioStore.select(props.module.id, e.evt?.shiftKey)
  } else if (targetFrame.value) {
    viewportStore.focusOnFrame(targetFrame.value.id)
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
