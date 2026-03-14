<template>
  <v-group>
    <!-- Drawing preview (frame / shape tool) -->
    <v-rect
      v-if="drawPreview && drawPreview.width > 2 && drawPreview.height > 2"
      :config="{
        x: drawPreview.x,
        y: drawPreview.y,
        width: drawPreview.width,
        height: drawPreview.height,
        stroke: drawPreview.tool === 'frame' ? '#3b82f6' : '#666666',
        strokeWidth: 1,
        dash: [4, 4],
        fill: drawPreview.tool === 'frame' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(0, 0, 0, 0.03)',
      }"
    />

    <!-- Selection handles -->
    <v-group
      v-for="item in selectedItems"
      :key="item.item.id"
    >
      <v-rect
        :config="{
          x: item.item.x - 4,
          y: item.item.y - 4,
          width: item.item.width + 8,
          height: item.item.height + 8,
          stroke: '#3b82f6',
          strokeWidth: 1,
          dash: [4, 4],
          fill: 'transparent',
        }"
      />

      <v-circle
        v-for="(pos, i) in handlePositions(item.item)"
        :key="`handle-${i}`"
        :config="{
          x: pos.x,
          y: pos.y,
          radius: i < 4 ? 4 : 3,
          fill: 'white',
          stroke: '#3b82f6',
          strokeWidth: 1.5,
        }"
      />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStudioStore } from '~/stores/studio'
import { useSceneStore } from '~/stores/scene'

interface DrawPreview {
  x: number
  y: number
  width: number
  height: number
  tool: string
}

interface Props {
  drawPreview?: DrawPreview | null
}

defineProps<Props>()

const studioStore = useStudioStore()
const sceneStore = useSceneStore()

const selectedItems = computed(() =>
  studioStore.selectedIds.map(id => {
    const module = sceneStore.getModuleById(id)
    if (module) return { type: 'module' as const, item: module }
    const frame = sceneStore.getFrameById(id)
    if (frame) return { type: 'frame' as const, item: frame }
    return null
  }).filter(Boolean),
)

const handlePositions = (item: { x: number; y: number; width: number; height: number }) => [
  { x: item.x, y: item.y },
  { x: item.x + item.width, y: item.y },
  { x: item.x, y: item.y + item.height },
  { x: item.x + item.width, y: item.y + item.height },
  { x: item.x + item.width / 2, y: item.y },
  { x: item.x + item.width, y: item.y + item.height / 2 },
  { x: item.x + item.width / 2, y: item.y + item.height },
  { x: item.x, y: item.y + item.height / 2 },
]
</script>
