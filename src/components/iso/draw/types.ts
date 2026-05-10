export interface DrawContext {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  cubeH: number
  W: number
  D: number
  color: string
  topColor: string
  highlight: string
  shadow: string
  mirrored: boolean
  // Wrapped helpers that handle mirroring automatically
  isoRect: (h: number, u0: number, v0: number, u1: number, v1: number, fill: string, stroke?: string, emphasize?: boolean) => void
  isoLine: (h: number, u0: number, v0: number, u1: number, v1: number, color: string, lw?: number) => void
  isoUV: (h: number, u: number, v: number) => [number, number]
  drawGrain: (h: number, u0: number, v0: number, u1: number, v1: number, color: string) => void
}

export type FurnitureDrawer = (c: DrawContext) => void
