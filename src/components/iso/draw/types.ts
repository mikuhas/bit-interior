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
}

export type FurnitureDrawer = (c: DrawContext) => void
