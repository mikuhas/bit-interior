import { DrawContext } from './types'
import { isoRect, isoLine, isoUV, shade } from '../../../utils/isometric'

export const drawSofa = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight, shadow
}: DrawContext) => {
  const fabric = color
  const cushion = topColor
  const fabricL = shade(fabric, 0.85)
  const fabricR = shade(fabric, 0.7)
  const border = shade(fabric, 0.5)

  // 1. 座面
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, cushion)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.15, highlight)

  // 2. 背もたれ
  const bh = 26
  const v_back = 0.35
  isoRect(ctx, x, y, cubeH + bh, 0, 0, W, v_back, fabric)
  isoRect(ctx, x, y, cubeH + bh, 0, 0, W, 0.08, highlight)
  const [p1x, p1y] = isoUV(x, y, cubeH + bh, 0, v_back)
  const [p2x, p2y] = isoUV(x, y, cubeH + bh, W, v_back)
  const [p3x, p3y] = isoUV(x, y, cubeH, W, v_back)
  const [p4x, p4y] = isoUV(x, y, cubeH, 0, v_back)
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.closePath()
  ctx.fillStyle = fabricL; ctx.fill()

  // 3. ひじ掛け
  const ah = 14
  const armW = 0.35
  for (const side of [0, W - armW]) {
    const isLeft = side === 0
    const u0 = side
    const u1 = side + armW
    isoRect(ctx, x, y, cubeH + ah, u0, v_back, u1, D, fabric, border)
    isoRect(ctx, x, y, cubeH + ah, u0, v_back, u1, v_back + 0.1, highlight)
    const inner_u = isLeft ? u1 : u0
    const [s1x, s1y] = isoUV(x, y, cubeH + ah, inner_u, v_back)
    const [s2x, s2y] = isoUV(x, y, cubeH + ah, inner_u, D)
    const [s3x, s3y] = isoUV(x, y, cubeH, inner_u, D)
    const [s4x, s4y] = isoUV(x, y, cubeH, inner_u, v_back)
    ctx.beginPath(); ctx.moveTo(s1x, s1y); ctx.lineTo(s2x, s2y); ctx.lineTo(s3x, s3y); ctx.lineTo(s4x, s4y); ctx.closePath()
    ctx.fillStyle = isLeft ? fabricR : fabricL; ctx.fill()
    const [f1x, f1y] = isoUV(x, y, cubeH + ah, u0, D)
    const [f2x, f2y] = isoUV(x, y, cubeH + ah, u1, D)
    const [f3x, f3y] = isoUV(x, y, cubeH, u1, D)
    const [f4x, f4y] = isoUV(x, y, cubeH, u0, D)
    ctx.beginPath(); ctx.moveTo(f1x, f1y); ctx.lineTo(f2x, f2y); ctx.lineTo(f3x, f3y); ctx.lineTo(f4x, f4y); ctx.closePath()
    ctx.fillStyle = fabricL; ctx.fill(); ctx.strokeStyle = border; ctx.lineWidth = 0.5; ctx.stroke()
  }

  // 4. 分割線
  for (let i = 1; i < W; i++) {
    isoLine(ctx, x, y, cubeH, i, v_back, i, D, shadow)
  }
}
