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
    <!-- Card background -->
    <v-rect
      :config="{
        width: module.width,
        height: module.height,
        fill: '#ffffff',
        cornerRadius: 8,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: isHovered ? 20 : 10,
        shadowOffsetY: isHovered ? 8 : 4,
        shadowOpacity: isHovered ? 0.2 : 0.1,
        stroke: isSelected ? '#3b82f6' : (isHovered ? '#e0e0e0' : 'transparent'),
        strokeWidth: isSelected ? 2 : 1,
      }"
    />

    <!-- Thumbnail image -->
    <v-image
      v-if="thumbnailImage"
      :config="{
        image: thumbnailImage,
        width: module.width,
        height: imageHeight,
      }"
    />

    <!-- Title -->
    <v-text
      :config="{
        x: padding,
        y: contentY,
        width: module.width - padding * 2,
        text: module.title,
        fontSize: 18,
        fontFamily: 'Inter, sans-serif',
        fontStyle: '600',
        fill: '#1a1a1a',
        wrap: 'word',
        ellipsis: true,
      }"
    />

    <!-- Subtitle -->
    <v-text
      v-if="module.subtitle"
      :config="{
        x: padding,
        y: contentY + 26,
        width: module.width - padding * 2,
        text: module.subtitle,
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fill: '#666666',
      }"
    />

    <!-- Tags -->
    <v-group :config="{ y: contentY + (module.subtitle ? 48 : 26) }">
      <v-rect
        v-for="(tag, i) in module.tags.slice(0, 2)"
        :key="tag"
        :config="{
          x: padding + i * 70,
          width: 64,
          height: 20,
          fill: '#f0f0f0',
          cornerRadius: 4,
        }"
      />
      <v-text
        v-for="(tag, i) in module.tags.slice(0, 2)"
        :key="`text-${tag}`"
        :config="{
          x: padding + i * 70 + 8,
          y: 4,
          text: tag,
          fontSize: 10,
          fontFamily: 'Inter, sans-serif',
          fill: '#666666',
        }"
      />
    </v-group>

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
        cornerRadius: 8,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudioStore } from '~/stores/studio'
import { useAppStore } from '~/stores/app'
import { useSceneStore } from '~/stores/scene'
import type { ProjectCardModule } from '~/types/scene-schema'

interface Props {
  module: ProjectCardModule
}

const props = defineProps<Props>()

const studioStore = useStudioStore()
const appStore = useAppStore()
const sceneStore = useSceneStore()
const isHovered = ref(false)
const thumbnailImage = ref<HTMLImageElement | null>(null)

const isSelected = computed(() => studioStore.selectedIds.includes(props.module.id))
const project = computed(() => sceneStore.getProjectById(props.module.projectId))

const padding = 16
const imageHeight = computed(() => props.module.height * 0.6)
const contentY = computed(() => imageHeight.value + padding)

onMounted(() => {
  const img = new Image()
  img.src = props.module.thumbnail
  img.onload = () => { thumbnailImage.value = img }
})

const handleClick = (e: any) => {
  e.cancelBubble = true
  if (studioStore.activeTool === 'select') {
    studioStore.select(props.module.id, e.evt?.shiftKey)
  } else if (project.value) {
    appStore.openProjectOverlay(props.module.projectId, project.value.slug)
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
