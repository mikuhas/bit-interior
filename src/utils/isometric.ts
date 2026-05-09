export const TILE_W = 64
export const TILE_H = 32
export const Z_PX = 14

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return '#' + c(r) + c(g) + c(b)
}

export function shade(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * f, g * f, b * f)
}

export function mix(h1: string, h2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(h1)
  const [r2, g2, b2] = hexToRgb(h2)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

export function isoUV(x: number, y: number, h: number, u: number, v: number): [number, number] {
  return [x + (u - v) * (TILE_W / 2), y - h + (u + v) * (TILE_H / 2)]
}

export function isoRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  fill: string,
  stroke?: string
) {
  ctx.beginPath()
  const [ax, ay] = isoUV(x, y, h, u0, v0)
  const [bx, by] = isoUV(x, y, h, u1, v0)
  const [cx2, cy2] = isoUV(x, y, h, u1, v1)
  const [dx, dy] = isoUV(x, y, h, u0, v1)
  ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.lineTo(dx, dy)
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke; ctx.lineWidth = 0.5; ctx.stroke()
  }
}

export function isoLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  color: string,
  lw = 1
) {
  const [ax, ay] = isoUV(x, y, h, u0, v0)
  const [bx, by] = isoUV(x, y, h, u1, v1)
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke()
}
