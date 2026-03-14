export const NAV_HEIGHT = 64

export const GRID_SIZE = 200
export const MAX_GRID_LINES = 50

export const MAX_HISTORY_SIZE = 50

export const WHEEL_THROTTLE_MS = 16

export const genId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
