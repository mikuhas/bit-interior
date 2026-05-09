import { DrawContext } from './types'
import { isoRect, isoUV, shade } from '../../../utils/isometric'

export const drawChair = ({
  ctx, x, y, cubeH, W, D, color, highlight
}: DrawContext) => {
  const seatColor = color
  const backColor = shade(color, 0.9)
  const fabricL = shade(color, 0.85)
  const u0 = 0.1, u1 = W - 0.1, v0 = 0.1, v1 = D - 0.1
  isoRect(ctx, x, y, cubeH, u0, v0, u1, v1, seatColor)
  isoRect(ctx, x, y, cubeH, u0, v0, u1, v0 + 0.15, highlight)
  const bh = 22
  const v_back_end = 0.25
  isoRect(ctx, x, y, cubeH + bh, u0, v0, u1, v_back_end, backColor)
  isoRect(ctx, x, y, cubeH + bh, u0, v0, u1, v0 + 0.08, highlight)
  const [p1x, p1y] = isoUV(x, y, cubeH + bh, u0, v_back_end)
  const [p2x, p2y] = isoUV(x, y, cubeH + bh, u1, v_back_end)
  const [p3x, p3y] = isoUV(x, y, cubeH, u1, v_back_end)
  const [p4x, p4y] = isoUV(x, y, cubeH, u0, v_back_end)
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.closePath()
  ctx.fillStyle = fabricL; ctx.fill()
}

export const drawArmchair = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  const fabric = color
  const cushion = topColor
  const fabricL = shade(fabric, 0.85)
  const fabricR = shade(fabric, 0.7)
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, cushion)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.15, highlight)
  const bh = 22, v_back = 0.35
  isoRect(ctx, x, y, cubeH + bh, 0, 0, W, v_back, fabric)
  isoRect(ctx, x, y, cubeH + bh, 0, 0, W, 0.08, highlight)
  const [p1x, p1y] = isoUV(x, y, cubeH + bh, 0, v_back); const [p2x, p2y] = isoUV(x, y, cubeH + bh, W, v_back)
  const [p3x, p3y] = isoUV(x, y, cubeH, W, v_back); const [p4x, p4y] = isoUV(x, y, cubeH, 0, v_back)
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.closePath(); ctx.fillStyle = fabricL; ctx.fill()
  const ah = 12, armW = 0.2
  for (const side of [0, W - armW]) {
    isoRect(ctx, x, y, cubeH + ah, side, v_back, side + armW, D, fabric)
    const inner_u = side === 0 ? side + armW : side
    const [s1x, s1y] = isoUV(x, y, cubeH + ah, inner_u, v_back); const [s2x, s2y] = isoUV(x, y, cubeH + ah, inner_u, D)
    const [s3x, s3y] = isoUV(x, y, cubeH, inner_u, D); const [s4x, s4y] = isoUV(x, y, cubeH, inner_u, v_back)
    ctx.beginPath(); ctx.moveTo(s1x, s1y); ctx.lineTo(s2x, s2y); ctx.lineTo(s3x, s3y); ctx.lineTo(s4x, s4y); ctx.closePath()
    ctx.fillStyle = side === 0 ? fabricR : fabricL; ctx.fill()
  }
}
