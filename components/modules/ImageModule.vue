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
    <!-- Base rect for hit area -->
    <v-rect
      :config="{
        width: module.width,
        height: module.height,
        fill: 'transparent',
      }"
    />

    <!-- Loading placeholder -->
    <v-rect
      v-if="isLoading"
      :config="{
        width: module.width,
        height: module.height,
        fill: '#e8e8e8',
      }"
    />

    <!-- Error state -->
    <v-group v-else-if="isError">
      <v-rect
        :config="{
          width: module.width,
          height: module.height,
          fill: '#f5f5f5',
          stroke: '#ddd',
          strokeWidth: 1,
        }"
      />
      <v-text
        :config="{
          text: 'Image failed to load',
          x: 8,
          y: module.height / 2 - 8,
          width: module.width - 16,
          fontSize: 11,
          fill: '#999',
          align: 'center',
        }"
      />
    </v-group>

    <!-- Image -->
    <v-image
      v-else-if="image"
      :config="{
        image: image,
        x: imageProps.x,
        y: imageProps.y,
        width: imageProps.width,
        height: imageProps.height,
        crop: module.objectFit === 'cover' ? imageCrop : undefined,
      }"
    />

    <!-- Selection/hover overlay -->
    <v-rect
      v-if="isSelected || isHovered"
      :config="{
        width: module.width,
        height: module.height,
        fill: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
        stroke: isSelected ? '#3b82f6' : '#bbbbbb',
        strokeWidth: 1,
        dash: [4, 4],
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStudioStore } from '~/stores/studio'
import { useSceneStore } from '~/stores/scene'
import type { ImageModule } from '~/types/scene-schema'

interface Props {
  module: ImageModule
}

const props = defineProps<Props>()

const studioStore = useStudioStore()
const sceneStore = useSceneStore()
const isHovered = ref(false)
const image = ref<HTMLImageElement | null>(null)
const isLoading = ref(true)
const isError = ref(false)

const isSelected = computed(() => studioStore.selectedIds.includes(props.module.id))

onMounted(() => {
  const img = new Image()
  img.src = props.module.src
  img.onload = () => {
    image.value = img
    isLoading.value = false
    sceneStore.markAssetLoaded(props.module.id)
  }
  img.onerror = () => {
    isLoading.value = false
    isError.value = true
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

const imageProps = computed(() => {
  if (!image.value) return { width: 0, height: 0, x: 0, y: 0 }
  const imgRatio = image.value.width / image.value.height
  const moduleRatio = props.module.width / props.module.height

  switch (props.module.objectFit) {
    case 'contain': {
      if (imgRatio > moduleRatio) {
        const width = props.module.width
        const height = width / imgRatio
        return { width, height, x: 0, y: (props.module.height - height) / 2 }
      } else {
        const height = props.module.height
        const width = height * imgRatio
        return { width, height, x: (props.module.width - width) / 2, y: 0 }
      }
    }
    case 'cover': {
      if (imgRatio > moduleRatio) {
        const height = props.module.height
        const width = height * imgRatio
        return { width, height, x: (props.module.width - width) / 2, y: 0 }
      } else {
        const width = props.module.width
        const height = width / imgRatio
        return { width, height, x: 0, y: (props.module.height - height) / 2 }
      }
    }
    case 'fill':
    default:
      return { width: props.module.width, height: props.module.height, x: 0, y: 0 }
  }
})

const imageCrop = computed(() => {
  if (!image.value || props.module.objectFit !== 'cover') return undefined
  const imgRatio = image.value.width / image.value.height
  const moduleRatio = props.module.width / props.module.height
  let cropX = 0, cropY = 0
  let cropWidth = image.value.width
  let cropHeight = image.value.height

  if (imgRatio > moduleRatio) {
    cropWidth = image.value.height * moduleRatio
    cropX = (image.value.width - cropWidth) / 2
  } else {
    cropHeight = image.value.width / moduleRatio
    cropY = (image.value.height - cropHeight) / 2
  }
  return { x: cropX, y: cropY, width: cropWidth, height: cropHeight }
})
</script>
