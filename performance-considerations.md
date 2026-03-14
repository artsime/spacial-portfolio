# Performance Considerations

## SpatialStage — Pan smoothness

### Issue 1 — No RAF batching on pan

**File:** `components/stage/SpatialStage.vue`

`handleMouseMove` directly mutates `currentX`/`currentY` Vue refs on every mousemove event. This triggers a full Vue reactivity cycle per event, which can fire well above the display refresh rate (125Hz for standard mice, up to 1000Hz for gaming mice).

The fix is to accumulate deltas in plain variables and flush to refs once per `requestAnimationFrame`. `rafId` is already declared in the file but never used for panning — it was clearly intended for this.

**Trade-off:** Introduces up to ~16ms of input lag. Konva already batches canvas painting internally via its own RAF loop, so the main gain is reducing Vue reactivity overhead — not the render itself. Benefit is modest for standard mice, meaningful for high-polling devices.

**Also:** `lastX` and `lastY` are Vue `ref`s but nothing in the template or any computed depends on them. They should be plain `let` variables to avoid reactive tracking overhead in the hot path.

---

### Issue 2 — Culling is coupled to pan position (priority fix)

**File:** `components/stage/SpatialStage.vue`

`viewportBoundsWorld`, `visibleFrames`, and `visibleModules` all depend on `currentX`/`currentY`. This means every pan tick runs through the full chain:

```
currentX/currentY → viewportBoundsWorld → visibleFrames/visibleModules → vue-konva node diff
```

`layerConfig` (canvas transform) and the visible node list both sit in the same reactive chain, even though they need to update at different frequencies. The layer must move every frame; the node list does not.

Each time `visibleFrames` recomputes it returns a new array reference, causing vue-konva to re-diff and call `setAttrs()` on every Konva node — even when nothing actually changed. When an object crosses the culling boundary, Konva must create or destroy nodes and force a full layer redraw.

**For the current scene (5 frames, ~25 modules):** Culling produces overhead with no benefit. Konva can trivially render 30 objects at all times. The recommended fix is to remove culling entirely — `visibleFrames` and `visibleModules` return all items unconditionally. This completely breaks the reactive chain between pan position and node list.

**If culling is kept for future scene growth:** Use separate refs for culling bounds that only update on pan end (`mouseup`) or when the pan delta exceeds a threshold (e.g. half of `CULL_MARGIN`). The layer moves freely every frame; the node list updates only occasionally.

| Approach | Complexity | Benefit |
|---|---|---|
| Remove culling entirely | Very low | High — fully decouples pan from node list |
| Update culling bounds on pan end only | Medium | High — same result, keeps culling for growth |
| Throttle culling recomputation | Medium | Medium |

---

### Issue 3 — Wheel zoom drops events instead of accumulating

**File:** `components/stage/SpatialStage.vue`

```ts
if (now - lastWheelTime < WHEEL_THROTTLE_MS) return  // hard-drops the event
```

At 60fps a frame is exactly 16ms, matching `WHEEL_THROTTLE_MS`. Back-to-back wheel ticks get silently dropped, making zoom feel steppy rather than smooth.

The fix is to accumulate `deltaY` across events and apply the total once per RAF tick, rather than discarding events outright.

---

### Issue 4 — Stage reference fetched on every event (minor)

**File:** `components/stage/SpatialStage.vue`

`handleMouseMove`, `handleMouseDown`, and `handleMouseUp` all call `stageRef.value?.getStage()` on every invocation. The stage reference could be cached once after mount and reused.

Low priority — cheap operation, but unnecessary in a hot path.
