<template>
  <div
    ref="containerRef"
    class="stage-container"
    :style="containerStyle"
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleMouseDown"
      @touchmove="handleMouseMove"
      @touchend="handleMouseUp"
      @click="handleStageClick"
    >
      <v-layer :config="layerConfig">
        <BackgroundLayer
          :world-width="worldWidth"
          :world-height="worldHeight"
          :scale="currentScale"
        />
      </v-layer>

      <v-layer :config="layerConfig">
        <FrameLayer :frames="visibleFrames" />
      </v-layer>

      <v-layer :config="layerConfig">
        <ModuleLayer :modules="visibleModules" />
      </v-layer>

      <v-layer :config="layerConfig">
        <InteractionLayer :draw-preview="drawingPreview" />
      </v-layer>
    </v-stage>

    <div class="viewport-info">
      {{ Math.round(currentScale * 100) }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSceneStore } from '~/stores/scene'
import { useViewportStore } from '~/stores/viewport'
import { useStudioStore } from '~/stores/studio'
import { WHEEL_THROTTLE_MS, genId } from '~/utils/constants'
import BackgroundLayer from './BackgroundLayer.vue'
import FrameLayer from './FrameLayer.vue'
import ModuleLayer from './ModuleLayer.vue'
import InteractionLayer from './InteractionLayer.vue'

interface Props {
  width: number
  height: number
}

const props = defineProps<Props>()

const stageRef = ref()
const containerRef = ref<HTMLDivElement>()

// Viewport drag state
const isPanning = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// Drawing state (frame / shape tools)
const isDrawing = ref(false)
const drawStart = ref<{ x: number; y: number } | null>(null)
const drawEnd = ref<{ x: number; y: number } | null>(null)

// Local viewport values for smooth dragging
const currentX = ref(0)
const currentY = ref(0)
const currentScale = ref(1)

let lastWheelTime = 0
let rafId: number | null = null

const sceneStore = useSceneStore()
const viewportStore = useViewportStore()
const studioStore = useStudioStore()

const scene = computed(() => sceneStore.scene)
const worldWidth = computed(() => sceneStore.scene?.world.width || 5000)
const worldHeight = computed(() => sceneStore.scene?.world.height || 4000)

// Visible world rect with a padding margin to avoid pop-in during fast panning
const CULL_MARGIN = 300
const viewportBoundsWorld = computed(() => {
  const left = (-currentX.value / currentScale.value) - CULL_MARGIN
  const top = (-currentY.value / currentScale.value) - CULL_MARGIN
  const right = left + props.width / currentScale.value + CULL_MARGIN * 2
  const bottom = top + props.height / currentScale.value + CULL_MARGIN * 2
  return { left, top, right, bottom }
})

const visibleFrames = computed(() => {
  const { left, top, right, bottom } = viewportBoundsWorld.value
  return (sceneStore.scene?.frames || []).filter(f =>
    f.x + f.width > left && f.x < right &&
    f.y + f.height > top && f.y < bottom,
  )
})

const visibleModules = computed(() => {
  const { left, top, right, bottom } = viewportBoundsWorld.value
  return (sceneStore.scene?.modules || []).filter(m =>
    m.x + m.width > left && m.x < right &&
    m.y + m.height > top && m.y < bottom,
  )
})

const stageConfig = computed(() => ({
  width: props.width,
  height: props.height,
  draggable: false,
}))

const layerConfig = computed(() => ({
  x: currentX.value,
  y: currentY.value,
  scaleX: currentScale.value,
  scaleY: currentScale.value,
}))

const containerStyle = computed(() => {
  const tool = studioStore.activeTool
  const crosshairTools: typeof tool[] = ['frame', 'shape', 'text', 'image', 'component']
  let cursor = 'default'
  if (crosshairTools.includes(tool)) cursor = 'crosshair'
  else if (tool === 'hand') cursor = isPanning.value ? 'grabbing' : 'grab'
  return {
    backgroundColor: scene.value?.world.background.color || '#f8f7f4',
    cursor,
  }
})

// Drawing preview passed to InteractionLayer
const drawingPreview = computed(() => {
  if (!isDrawing.value || !drawStart.value || !drawEnd.value) return null
  return {
    x: Math.min(drawStart.value.x, drawEnd.value.x),
    y: Math.min(drawStart.value.y, drawEnd.value.y),
    width: Math.abs(drawEnd.value.x - drawStart.value.x),
    height: Math.abs(drawEnd.value.y - drawStart.value.y),
    tool: studioStore.activeTool,
  }
})

const syncFromStore = () => {
  currentX.value = viewportStore.x
  currentY.value = viewportStore.y
  currentScale.value = viewportStore.scale
}

const toWorldCoords = (screenX: number, screenY: number) => ({
  x: (screenX - currentX.value) / currentScale.value,
  y: (screenY - currentY.value) / currentScale.value,
})

onMounted(() => {
  if (scene.value) {
    const { initialViewport } = scene.value.world
    const centerX = props.width / 2 - initialViewport.x * initialViewport.scale
    const centerY = props.height / 2 - initialViewport.y * initialViewport.scale
    viewportStore.setViewport({ x: centerX, y: centerY, scale: initialViewport.scale })
    viewportStore.setScaleBounds(0.1, 3)
    syncFromStore()
  }
})

// Wheel zoom
const handleWheel = (e: any) => {
  e.evt.preventDefault()
  const now = performance.now()
  if (now - lastWheelTime < WHEEL_THROTTLE_MS) return
  lastWheelTime = now

  const stage = stageRef.value?.getStage()
  if (!stage) return
  const pointer = stage.getPointerPosition()
  if (!pointer) return

  const factor = e.evt.deltaY > 0 ? 0.92 : 1.08
  const newScale = Math.max(viewportStore.minScale, Math.min(viewportStore.maxScale, currentScale.value * factor))
  const worldX = (pointer.x - currentX.value) / currentScale.value
  const worldY = (pointer.y - currentY.value) / currentScale.value

  currentScale.value = newScale
  currentX.value = pointer.x - worldX * newScale
  currentY.value = pointer.y - worldY * newScale

  requestAnimationFrame(() => {
    viewportStore.setViewport({ x: currentX.value, y: currentY.value, scale: currentScale.value })
  })
}

// Unified mouse/touch down
const handleMouseDown = (e: any) => {
  const stage = stageRef.value?.getStage()
  const pos = stage?.getPointerPosition()
  if (!pos) return

  const tool = studioStore.activeTool

  if (tool === 'hand') {
    isPanning.value = true
    lastX.value = pos.x
    lastY.value = pos.y
  } else if (tool === 'frame' || tool === 'shape') {
    const wp = toWorldCoords(pos.x, pos.y)
    isDrawing.value = true
    drawStart.value = wp
    drawEnd.value = wp
  }
  // text / image / component — handled by click, no drag
}

const handleMouseMove = (e: any) => {
  const stage = stageRef.value?.getStage()
  const pos = stage?.getPointerPosition()
  if (!pos) return

  if (isPanning.value) {
    const dx = pos.x - lastX.value
    const dy = pos.y - lastY.value
    currentX.value += dx
    currentY.value += dy
    lastX.value = pos.x
    lastY.value = pos.y
    // Local refs drive the canvas directly — no store update needed mid-pan
  } else if (isDrawing.value) {
    drawEnd.value = toWorldCoords(pos.x, pos.y)
  }
}

const handleMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false
    // Single store flush at pan end instead of every animation frame
    viewportStore.setViewport({ x: currentX.value, y: currentY.value, scale: currentScale.value })
  }

  if (isDrawing.value && drawStart.value && drawEnd.value) {
    commitDrawing()
    isDrawing.value = false
    drawStart.value = null
    drawEnd.value = null
  }
}

const commitDrawing = () => {
  if (!drawStart.value || !drawEnd.value || !sceneStore.scene) return

  const x = Math.min(drawStart.value.x, drawEnd.value.x)
  const y = Math.min(drawStart.value.y, drawEnd.value.y)
  const width = Math.abs(drawEnd.value.x - drawStart.value.x)
  const height = Math.abs(drawEnd.value.y - drawStart.value.y)

  if (width < 10 || height < 10) return

  const tool = studioStore.activeTool
  studioStore.pushHistory(sceneStore.scene)

  if (tool === 'frame') {
    const frameCount = sceneStore.scene.frames.length + 1
    const id = genId()
    sceneStore.addFrame({
      id,
      name: `Frame ${frameCount}`,
      slug: `frame-${frameCount}`,
      x, y, width, height,
      theme: 'light',
      backgroundColor: '#ffffff',
      showInNav: true,
    })
    studioStore.select(id)
  } else if (tool === 'shape') {
    const id = genId()
    sceneStore.addModule({
      id,
      type: 'shape',
      frameId: null,
      x, y, width, height,
      shapeType: 'rect',
      fill: '#e0e0e0',
      stroke: undefined,
      strokeWidth: 0,
      opacity: 1,
    })
    studioStore.select(id)
  }

  studioStore.setActiveTool('select')
}

// Stage click — handles text/image placement and deselection
const handleStageClick = (e: any) => {
  const stage = stageRef.value?.getStage()
  const pos = stage?.getPointerPosition()
  const tool = studioStore.activeTool

  if (tool === 'select') {
    if (e.target === stage) studioStore.clearSelection()
    return
  }

  if (tool === 'text' && pos) {
    if (!sceneStore.scene) return
    const wp = toWorldCoords(pos.x, pos.y)
    studioStore.pushHistory(sceneStore.scene)
    const id = genId()
    sceneStore.addModule({
      id,
      type: 'text',
      frameId: null,
      x: wp.x,
      y: wp.y,
      width: 200,
      height: 50,
      content: 'Text',
      fontSize: 16,
      fontFamily: 'Inter',
      color: '#1a1a1a',
      align: 'left',
    })
    studioStore.select(id)
    studioStore.setActiveTool('select')
  }
}

// Sync store → local refs for any external viewport change (e.g. zoom from controls)
// Guard against running during active pan to avoid fighting local updates
watch(
  () => [viewportStore.x, viewportStore.y, viewportStore.scale] as const,
  ([x, y, scale]) => {
    if (!isPanning.value) {
      currentX.value = x
      currentY.value = y
      currentScale.value = scale
    }
  },
)

// Watch for external viewport changes (frame navigation)
watch(() => viewportStore.focusedFrameId, (frameId) => {
  if (!frameId) return
  const frame = sceneStore.getFrameById(frameId)
  if (!frame) return

  const targetScale = Math.min(
    (props.width * 0.8) / frame.width,
    (props.height * 0.8) / frame.height,
    1,
  )
  const targetX = props.width / 2 - (frame.x + frame.width / 2) * targetScale
  const targetY = props.height / 2 - (frame.y + frame.height / 2) * targetScale

  currentX.value = targetX
  currentY.value = targetY
  currentScale.value = targetScale

  viewportStore.setViewport({ x: targetX, y: targetY, scale: targetScale })
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped lang="scss">
.stage-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.viewport-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  font-size: 12px;
  color: #999;
  font-family: monospace;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
