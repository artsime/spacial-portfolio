<template>
  <!-- Tools Panel -->
  <div class="tools-panel">
    <button
      v-for="tool in tools"
      :key="tool.id"
      :class="['tool-button', { active: studioStore.activeTool === tool.id }]"
      :title="`${tool.label} (${tool.key.toUpperCase()})`"
      @click="studioStore.setActiveTool(tool.id)"
    >
      <component :is="tool.icon" class="icon" />
    </button>
  </div>

  <!-- Top Action Bar -->
  <div class="top-bar">
    <button
      :disabled="!studioStore.canUndo"
      class="action-button"
      title="Undo (⌘Z)"
      @click="studioStore.undo()"
    >
      <Undo class="icon" />
    </button>

    <button
      :disabled="!studioStore.canRedo"
      class="action-button"
      title="Redo (⌘⇧Z)"
      @click="studioStore.redo()"
    >
      <Redo class="icon" />
    </button>

    <div class="divider" />

    <button
      :class="['action-button', { dirty: studioStore.isDirty }]"
      title="Save"
    >
      <Save class="icon" />
    </button>

    <button class="action-button" title="Export">
      <Download class="icon" />
    </button>

    <div class="divider" />

    <button class="action-button" title="Settings">
      <Settings class="icon" />
    </button>
  </div>

</template>

<script setup lang="ts">
import {
  MousePointer2,
  Hand,
  LayoutTemplate,
  Type,
  Square,
  Image as ImageIcon,
  Puzzle,
  Undo,
  Redo,
  Save,
  Download,
  Settings,
} from 'lucide-vue-next'
import { useStudioStore } from '~/stores/studio'
import type { StudioTool } from '~/types/scene-schema'

const studioStore = useStudioStore()

const tools: { id: StudioTool; icon: any; label: string; key: string }[] = [
  { id: 'hand',      icon: Hand,           label: 'Hand',      key: 'h' },
  { id: 'select',    icon: MousePointer2,  label: 'Select',    key: 'v' },
  { id: 'frame',     icon: LayoutTemplate, label: 'Frame',     key: 'f' },
  { id: 'text',      icon: Type,           label: 'Text',      key: 't' },
  { id: 'shape',     icon: Square,         label: 'Shape',     key: 's' },
  { id: 'image',     icon: ImageIcon,      label: 'Image',     key: 'i' },
  { id: 'component', icon: Puzzle,         label: 'Component', key: 'c' },
]

</script>

<style scoped lang="scss">
.tools-panel {
  position: fixed;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
}

.tool-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 12px;
  transition: all 0.15s;

  &:hover {
    background: #f5f5f5;
    color: #1a1a1a;
  }

  &.active {
    background: #1a1a1a;
    color: white;
  }

  .icon {
    width: 18px;
    height: 18px;
  }
}

.top-bar {
  position: fixed;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: white;
  border-radius: 9999px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 50%;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #f5f5f5;
    color: #1a1a1a;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }

  &.dirty {
    color: #3b82f6;
  }

  .icon {
    width: 15px;
    height: 15px;
  }
}

.divider {
  width: 1px;
  height: 20px;
  background: #e8e8e8;
  margin: 0 4px;
}

.status-bar {
  position: fixed;
  bottom: 24px;
  left: 80px;
  z-index: 50;
  padding: 6px 14px;
  background: white;
  font-size: 12px;
  color: #666;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.dirty-indicator {
  color: #f59e0b;
  margin-right: 4px;
}
</style>
