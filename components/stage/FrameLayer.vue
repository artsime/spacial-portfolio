<template>
  <v-group>
    <v-group
      v-for="frame in frames"
      :key="frame.id"
      :config="{
        x: frame.x,
        y: frame.y,
        draggable: studioStore.activeTool === 'select',
      }"
      @mousedown="(e: any) => { if (studioStore.activeTool === 'select') e.cancelBubble = true }"
      @click="(e: any) => handleFrameClick(frame, e)"
      @tap="(e: any) => handleFrameClick(frame, e)"
      @dragstart="() => handleFrameDragStart(frame)"
      @dragend="(e: any) => handleFrameDragEnd(e, frame)"
    >
      <!-- Frame background -->
      <v-rect
        :config="{
          width: frame.width,
          height: frame.height,
          fill: getThemeColors(frame).bg,
          stroke: isSelected(frame.id) ? '#3b82f6' : getThemeColors(frame).border,
          strokeWidth: isSelected(frame.id) ? 2 : 1,
          cornerRadius: 4,
          shadowColor: 'rgba(0, 0, 0, 0.08)',
          shadowBlur: 12,
          shadowOffsetY: 4,
          shadowEnabled: showShadows.value,
        }"
      />

      <!-- Frame name label -->
      <v-group>
        <v-rect
          :config="{
            x: 0,
            y: -28,
            width: Math.min(frame.name.length * 8 + 16, frame.width),
            height: 22,
            fill: isSelected(frame.id) ? '#3b82f6' : '#1a1a1a',
            cornerRadius: 4,
          }"
        />
        <v-text
          :config="{
            x: 8,
            y: -24,
            text: frame.name,
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
            fill: '#ffffff',
          }"
        />
      </v-group>

      <!-- Dimensions hint (when selected) -->
      <v-text
        v-if="isSelected(frame.id)"
        :config="{
          x: 0,
          y: frame.height + 6,
          text: `${Math.round(frame.width)} × ${Math.round(frame.height)}`,
          fontSize: 10,
          fontFamily: 'monospace',
          fill: '#999999',
        }"
      />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { useSceneStore } from '~/stores/scene'
import { useStudioStore } from '~/stores/studio'
import { useViewportStore } from '~/stores/viewport'
import type { FrameNode } from '~/types/scene-schema'

interface Props {
  frames: FrameNode[]
}

defineProps<Props>()

const sceneStore = useSceneStore()
const studioStore = useStudioStore()
const viewportStore = useViewportStore()

// Shadows become invisible below this zoom level — skip the GPU cost
const showShadows = computed(() => viewportStore.scale > 0.3)

const isSelected = (id: string) => studioStore.selectedIds.includes(id)

const getThemeColors = (frame: FrameNode) => {
  const themes: Record<string, { bg: string; border: string }> = {
    light: { bg: frame.backgroundColor || '#ffffff', border: '#e0e0e0' },
    dark:  { bg: frame.backgroundColor || '#1a1a1a', border: '#333333' },
    accent: { bg: frame.backgroundColor || '#f5f5f5', border: '#d0d0d0' },
  }
  return themes[frame.theme] || themes.light
}

const handleFrameClick = (frame: FrameNode, e: any) => {
  if (studioStore.activeTool !== 'select') return
  e.cancelBubble = true
  sceneStore.setCurrentFrame(frame.id)
  studioStore.select(frame.id, e.evt?.shiftKey)
}

const handleFrameDragStart = (frame: FrameNode) => {
  if (sceneStore.scene) studioStore.pushHistory(sceneStore.scene)
}

const handleFrameDragEnd = (e: any, frame: FrameNode) => {
  const newX = e.target.x()
  const newY = e.target.y()
  const deltaX = newX - frame.x
  const deltaY = newY - frame.y
  sceneStore.moveFrame(frame.id, deltaX, deltaY)
}
</script>
