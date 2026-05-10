import { DrawContext } from './types'
import { shade } from '../../../utils/isometric'

export const drawChair = ({
  ctx, cubeH, W, D, color, isoRect, isoUV
}: DrawContext) => {
  const seatColor = color
  const backColor = shade(color, 0.9)
  const baseColor = '#333'
  
  const [cx, cy] = isoUV(0, W / 2, D / 2)
  ctx.beginPath(); ctx.ellipse(cx, cy, 12, 6, 0, 0, Math.PI * 2); ctx.fillStyle = baseColor; ctx.fill()
  
  isoRect(cubeH * 0.4, W / 2 - 0.1, D / 2 - 0.1, W / 2 + 0.1, D / 2 + 0.1, '#555')
  
  const u0 = 0.15, u1 = W - 0.15, v0 = 0.15, v1 = D - 0.15
  isoRect(cubeH, u0, v0, u1, v1, seatColor, undefined, true)
  
  const bh = 24
  const v_back_end = 0.3
  isoRect(cubeH + bh, u0, v0, u1, v_back_end, backColor, undefined, true)
}

export const drawArmchair = ({
  ctx, cubeH, W, D, color, topColor, isoRect, isoUV
}: DrawContext) => {
  const fabric = color
  const cushion = topColor
  const fabricL = shade(fabric, 0.85)
  const fabricR = shade(fabric, 0.7)
  
  isoRect(cubeH, 0, 0, W, D, cushion, undefined, true)
  
  const bh = 22, v_back = 0.35
  isoRect(cubeH + bh, 0, 0, W, v_back, fabric, undefined, true)
  const [p1x, p1y] = isoUV(cubeH + bh, 0, v_back); const [p2x, p2y] = isoUV(cubeH + bh, W, v_back)
  const [p3x, p3y] = isoUV(0, W, v_back); const [p4x, p4y] = isoUV(0, 0, v_back)
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.closePath(); ctx.fillStyle = fabricL; ctx.fill()
  
  const ah = 12, armW = 0.2
  for (const side of [0, W - armW]) {
    isoRect(cubeH + ah, side, v_back, side + armW, D, fabric, undefined, true)
    const inner_u = side === 0 ? side + armW : side
    const [s1x, s1y] = isoUV(cubeH + ah, inner_u, v_back); const [s2x, s2y] = isoUV(cubeH + ah, inner_u, D)
    const [s3x, s3y] = isoUV(0, inner_u, D); const [s4x, s4y] = isoUV(0, inner_u, v_back)
    ctx.beginPath(); ctx.moveTo(s1x, s1y); ctx.lineTo(s2x, s2y); ctx.lineTo(s3x, s3y); ctx.lineTo(s4x, s4y); ctx.closePath()
    ctx.fillStyle = side === 0 ? fabricR : fabricL; ctx.fill()
  }
}
