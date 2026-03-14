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
    <!-- Hit area + selection indicator -->
    <v-rect
      :config="{
        width: module.width,
        height: module.height,
        fill: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
        stroke: isSelected ? '#3b82f6' : (isHovered ? '#bbbbbb' : 'transparent'),
        strokeWidth: 1,
        dash: isSelected ? [4, 4] : [],
      }"
    />

    <!-- Text content -->
    <v-text
      :config="{
        width: module.width,
        height: module.height,
        text: module.content,
        fontSize: module.fontSize,
        fontFamily: module.fontFamily,
        fill: module.color,
        align: module.align,
        verticalAlign: 'middle',
        wrap: 'word',
        lineHeight: 1.4,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '~/stores/studio'
import { useSceneStore } from '~/stores/scene'
import type { TextModule } from '~/types/scene-schema'

interface Props {
  module: TextModule
}

const props = defineProps<Props>()

const studioStore = useStudioStore()
const sceneStore = useSceneStore()
const isHovered = ref(false)

const isSelected = computed(() => studioStore.selectedIds.includes(props.module.id))

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
