let cached: boolean | undefined

export function webglAvailable(): boolean {
  if (cached === undefined) {
    try {
      const canvas = document.createElement('canvas')
      cached = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      cached = false
    }
  }
  return cached
}
