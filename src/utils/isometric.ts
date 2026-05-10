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

import { WindowStyle, DoorStyle } from '../types/styles'

// ...

export function drawWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  side: 'top' | 'right' | 'bottom' | 'left',
  style: WindowStyle = 'basic'
) {
  ctx.save()
  const glass = 'rgba(180, 230, 255, 0.3)'
  const frame = '#e0e0e0'
  const sash = '#a0a0a0'
    
  if (side === 'top') {
      isoRect(ctx, x, y, h, 0.2, 0, 0.8, 0.1, frame)
      isoRect(ctx, x, y, h * 0.9, 0.25, 0, 0.75, 0.05, sash)
  } else if (side === 'bottom') {
      isoRect(ctx, x, y, h, 0.2, 0.9, 0.8, 1.0, frame)
      isoRect(ctx, x, y, h * 0.9, 0.25, 0.95, 0.75, 1.0, sash)
  } else if (side === 'left') {
      isoRect(ctx, x, y, h, 0, 0.2, 0.1, 0.8, frame)
      isoRect(ctx, x, y, h * 0.9, 0, 0.25, 0.05, 0.75, sash)
  } else if (side === 'right') {
      isoRect(ctx, x, y, h, 0.9, 0.2, 1.0, 0.8, frame)
      isoRect(ctx, x, y, h * 0.9, 0.95, 0.25, 1.0, 0.75, sash)
  }
  ctx.restore()
}

export function drawVerticalFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  z1: number,
  z2: number,
  side: 'top' | 'right' | 'bottom' | 'left',
  offset: number,
  width: number,
  fill: string,
  stroke?: string
) {
  ctx.beginPath()
  // 基準となる座標をサイドに応じて計算
  // 簡易的にisoUVのUV座標を操作して4点を得る
  // sideに応じて面の方向を計算する必要がある
  // 今回はwall描画と同様の論理で構築します
  const getP = (u: number, v: number, z: number) => isoUV(x, y, z * Z_PX, u, v)

  // Sideごとの頂点定義
  // u, v の範囲は 0-1
  let points: [number, number][] = []
  if (side === 'top') {
    points = [getP(offset, 0, z1), getP(offset + width, 0, z1), getP(offset + width, 0, z2), getP(offset, 0, z2)]
  } else if (side === 'bottom') {
    points = [getP(offset, 1, z1), getP(offset + width, 1, z1), getP(offset + width, 1, z2), getP(offset, 1, z2)]
  } else if (side === 'left') {
    points = [getP(0, offset, z1), getP(0, offset + width, z1), getP(0, offset + width, z2), getP(0, offset, z2)]
  } else if (side === 'right') {
    points = [getP(1, offset, z1), getP(1, offset + width, z1), getP(1, offset + width, z2), getP(1, offset, z2)]
  }

  ctx.moveTo(points[0][0], points[0][1])
  ctx.lineTo(points[1][0], points[1][1])
  ctx.lineTo(points[2][0], points[2][1])
  ctx.lineTo(points[3][0], points[3][1])
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

export function drawDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  side: 'top' | 'right' | 'bottom' | 'left',
  style: DoorStyle = 'basic'
) {
  ctx.save()
  const doorColor = '#8b5a2b'
  const edgeColor = '#302010'
  const handleColor = '#d0d0d0'

  if (style === 'basic') {
    // 1. ドアパネル: グリッドの1辺を完全に埋める (offset: 0, width: 1.0)
    drawVerticalFace(ctx, x, y, 0, h, side, 0, 1.0, doorColor, edgeColor)

    // 2. ドアノブ: パネルの端から20%の位置 (0.2)
    const handleOffset = side === 'left' || side === 'bottom' ? 0.2 : 0.75
    drawVerticalFace(ctx, x, y, h * 0.5, h * 0.6, side, handleOffset, 0.05, handleColor)
  }
  ctx.restore()
}
