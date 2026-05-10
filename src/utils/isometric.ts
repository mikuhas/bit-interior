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
  stroke?: string,
  emphasizeEdges = false
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
  
  if (emphasizeEdges) {
    ctx.beginPath()
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx2, cy2); ctx.lineTo(dx, dy); ctx.lineTo(ax, ay)
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 0.8; ctx.stroke()
  }
}

export function drawGrain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  color: string
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 0.4
  ctx.globalAlpha = 0.2
  const count = 4
  for (let i = 1; i <= count; i++) {
    const offset = i / (count + 1)
    const [p1x, p1y] = isoUV(x, y, h, u0 + (u1 - u0) * offset, v0)
    const [p2x, p2y] = isoUV(x, y, h, u0 + (u1 - u0) * offset, v1)
    ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke()
  }
  ctx.restore()
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
  style: DoorStyle = 'basic',
  progress = 1.0,
  mirrored = false
) {
  ctx.save()
  const doorColor = '#8b5a2b'
  const edgeColor = '#302010'
  const handleColor = '#d0d0d0'
  const wallH = h // すでにピクセル単位で渡されているため、Z_PXを掛ける必要はありません

  // 支柱（ヒンジ）の位置を定義
  let hingeU = 0, hingeV = 0

  if (side === 'bottom') { hingeU = mirrored ? 1 : 0; hingeV = 1 }
  else if (side === 'right') { hingeU = 1; hingeV = mirrored ? 0 : 1 }
  else if (side === 'top') { hingeU = mirrored ? 0 : 1; hingeV = 0 }
  else if (side === 'left') { hingeU = 0; hingeV = mirrored ? 1 : 0 }

  const drawPanel = (uStart: number, vStart: number, uEnd: number, vEnd: number) => {
    const [ax, ay] = isoUV(x, y, 0, uStart, vStart)
    const [bx, by] = isoUV(x, y, 0, uEnd, vEnd)
    const [cx, cy] = isoUV(x, y, wallH, uEnd, vEnd)
    const [dx, dy] = isoUV(x, y, wallH, uStart, vStart)
    
    ctx.beginPath()
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.lineTo(dx, dy)
    ctx.closePath()
    ctx.fillStyle = doorColor
    ctx.fill()
    ctx.strokeStyle = edgeColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 閉じた状態のターゲット座標
  let closedU = hingeU, closedV = hingeV
  if (side === 'bottom') { closedU = mirrored ? 0 : 1; closedV = 1 }
  else if (side === 'right') { closedU = 1; closedV = mirrored ? 1 : 0 }
  else if (side === 'top') { closedU = mirrored ? 1 : 0; closedV = 0 }
  else if (side === 'left') { closedU = 0; closedV = mirrored ? 0 : 1 }

  // 開いた状態のターゲット座標 (45度程度)
  let openU = hingeU, openV = hingeV
  if (side === 'bottom') { openU = mirrored ? 0.3 : 0.7; openV = 0.3 }
  else if (side === 'right') { openU = 0.3; openV = mirrored ? 0.7 : 0.3 }
  else if (side === 'top') { openU = mirrored ? 0.7 : 0.3; openV = 0.7 }
  else if (side === 'left') { openU = 0.7; openV = mirrored ? 0.3 : 0.7 }

  // progress (0=closed, 1=open) に基づいて現在のターゲット座標を計算
  const targetU = closedU + (openU - closedU) * progress
  const targetV = closedV + (openV - closedV) * progress

  drawPanel(hingeU, hingeV, targetU, targetV)

  // ドアノブ
  const knobU = hingeU + (targetU - hingeU) * 0.8
  const knobV = hingeV + (targetV - hingeV) * 0.8
  const [kx, ky] = isoUV(x, y, wallH * 0.5, knobU, knobV)
  ctx.beginPath(); ctx.arc(kx, ky, 2, 0, Math.PI * 2); ctx.fillStyle = handleColor; ctx.fill()

  ctx.restore()
}
