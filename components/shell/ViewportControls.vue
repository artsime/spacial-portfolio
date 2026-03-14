<template>
  <div class="viewport-controls">
    <!-- Zoom controls -->
    <div class="control-group">
      <button
        class="control-button"
        title="Zoom in"
        @click="handleZoomIn"
      >
        <Plus class="icon" />
      </button>
      <div class="divider" />
      <button
        class="control-button"
        title="Zoom out"
        @click="handleZoomOut"
      >
        <Minus class="icon" />
      </button>
    </div>
    
    <!-- Reset control -->
    <div class="control-group">
      <button
        class="control-button"
        title="Reset view"
        @click="handleReset"
      >
        <Home class="icon" />
      </button>
    </div>
    
    <!-- Zoom level indicator -->
    <div class="zoom-level">
      {{ Math.round(viewportStore.scale * 100) }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Minus, Home } from 'lucide-vue-next'
import { useViewportStore } from '~/stores/viewport'

const viewportStore = useViewportStore()

const handleZoomIn = () => {
  viewportStore.zoom(1.2)
}

const handleZoomOut = () => {
  viewportStore.zoom(0.8)
}

const handleReset = () => {
  viewportStore.resetViewport()
}
</script>

<style scoped lang="scss">
.viewport-controls {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.control-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
  
  &:hover {
    color: #1a1a1a;
    background: #f5f5f5;
  }
  
  .icon {
    width: 20px;
    height: 20px;
  }
}

.divider {
  height: 1px;
  background: #f0f0f0;
}

.zoom-level {
  padding: 6px 12px;
  background: white;
  font-size: 12px;
  font-family: monospace;
  color: #666;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}
</style>
