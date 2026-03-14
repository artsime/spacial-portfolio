<template>
  <v-group>
    <!-- World bounds background -->
    <v-rect
      :config="{
        x: 0,
        y: 0,
        width: worldWidth,
        height: worldHeight,
        fill: '#fafafa',
        stroke: '#e0e0e0',
        strokeWidth: 2 / scale,
      }"
    />
    
    <!-- Grid lines - only show major grid at low zoom -->
    <v-group v-if="scale > 0.15">
      <v-line
        v-for="i in visibleVerticalLines"
        :key="`v-${i}`"
        :config="{
          points: [i * GRID_SIZE, 0, i * GRID_SIZE, worldHeight],
          stroke: '#e8e8e8',
          strokeWidth: 1 / scale,
        }"
      />
      <v-line
        v-for="i in visibleHorizontalLines"
        :key="`h-${i}`"
        :config="{
          points: [0, i * GRID_SIZE, worldWidth, i * GRID_SIZE],
          stroke: '#e8e8e8',
          strokeWidth: 1 / scale,
        }"
      />
    </v-group>
    
    <!-- Origin marker -->
    <v-group>
      <v-line
        :config="{
          points: [-20, 0, 20, 0],
          stroke: '#ff6b6b',
          strokeWidth: 2 / scale,
        }"
      />
      <v-line
        :config="{
          points: [0, -20, 0, 20],
          stroke: '#4ecdc4',
          strokeWidth: 2 / scale,
        }"
      />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GRID_SIZE, MAX_GRID_LINES } from '~/utils/constants'

interface Props {
  worldWidth: number
  worldHeight: number
  scale: number
}

const props = defineProps<Props>()

const visibleVerticalLines = computed(() => {
  const count = Math.ceil(props.worldWidth / GRID_SIZE) + 1
  return Math.min(count, MAX_GRID_LINES)
})

const visibleHorizontalLines = computed(() => {
  const count = Math.ceil(props.worldHeight / GRID_SIZE) + 1
  return Math.min(count, MAX_GRID_LINES)
})
</script>
