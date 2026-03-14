import { useEventListener } from '@vueuse/core'

const buildCombo = (e: KeyboardEvent): string => {
  const parts: string[] = []
  if (e.metaKey) parts.push('meta')
  if (e.ctrlKey) parts.push('ctrl')
  if (e.shiftKey) parts.push('shift')
  if (e.altKey) parts.push('alt')
  parts.push(e.key.toLowerCase())
  return parts.join('+')
}

export function useKeyboard() {
  const handlers = new Map<string, (e: KeyboardEvent) => void>()

  const registerHandler = (key: string, handler: (e: KeyboardEvent) => void) => {
    handlers.set(key.toLowerCase(), handler)
  }

  const unregisterHandler = (key: string) => {
    handlers.delete(key.toLowerCase())
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const combo = buildCombo(e)
    const handler = handlers.get(combo) ?? handlers.get(e.key.toLowerCase())
    if (handler) handler(e)
  }

  if (typeof window !== 'undefined') {
    useEventListener(window, 'keydown', handleKeyDown)
  }

  return {
    registerHandler,
    unregisterHandler,
  }
}
