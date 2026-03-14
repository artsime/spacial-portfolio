<template>
  <div class="pages-panel">
    <div class="panel-header">
      <span class="panel-title">Pages</span>
      <button class="add-btn" title="Add frame" @click="handleAddFrame">
        <Plus class="icon" />
      </button>
    </div>

    <div class="page-list">
      <button
        v-for="frame in frames"
        :key="frame.id"
        :class="['page-item', { active: sceneStore.currentFrameId === frame.id }]"
        @click="handlePageClick(frame.id)"
      >
        <LayoutTemplate class="page-icon" />
        <span class="page-name">{{ frame.name }}</span>
      </button>

      <div v-if="frames.length === 0" class="empty-state">
        No pages yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, LayoutTemplate } from 'lucide-vue-next'
import { useSceneStore } from '~/stores/scene'
import { useViewportStore } from '~/stores/viewport'
import { useStudioStore } from '~/stores/studio'
import { genId } from '~/utils/constants'

const sceneStore = useSceneStore()
const viewportStore = useViewportStore()
const studioStore = useStudioStore()

const frames = computed(() => sceneStore.frames)

const handlePageClick = (frameId: string) => {
  viewportStore.focusOnFrame(frameId)
}

const handleAddFrame = () => {
  const frameCount = frames.value.length + 1
  const newFrame = {
    id: genId(),
    name: `Page ${frameCount}`,
    slug: `page-${frameCount}`,
    x: frameCount * 1200,
    y: 0,
    width: 1000,
    height: 700,
    showInNav: true,
    modules: [],
  }
  if (sceneStore.scene) studioStore.pushHistory(sceneStore.scene)
  sceneStore.addFrame(newFrame as any)
}
</script>

<style scoped lang="scss">
.pages-panel {
  position: fixed;
  left: 76px;
  top: 88px;
  width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  z-index: 50;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #999;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    color: #1a1a1a;
    background: #f0f0f0;
  }

  .icon {
    width: 12px;
    height: 12px;
  }
}

.page-list {
  padding: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: #444;
  transition: all 0.15s;
  text-align: left;

  &:hover {
    background: #f5f5f5;
    color: #1a1a1a;
  }

  &.active {
    background: #eff6ff;
    color: #2563eb;

    .page-icon {
      color: #2563eb;
    }
  }
}

.page-icon {
  width: 13px;
  height: 13px;
  color: #aaa;
  flex-shrink: 0;
}

.page-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  padding: 12px 10px;
  font-size: 12px;
  color: #bbb;
  text-align: center;
}
</style>
