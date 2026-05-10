import { DrawContext } from './types'
import { shade } from '../../../utils/isometric'

export const drawSofa = ({
  ctx, cubeH, W, D, color, topColor, shadow, isoRect, isoLine, isoUV
}: DrawContext) => {
  const fabric = color
  const cushion = topColor
  const fabricL = shade(fabric, 0.85)
  const fabricR = shade(fabric, 0.7)

  // 1. Base Seating
  isoRect(cubeH, 0, 0, W, D, cushion, undefined, true)

  // 2. Backrest
  const bh = 24
  const v_back = 0.3
  isoRect(cubeH + bh, 0, 0, W, v_back, fabric, undefined, true)
  
  const [p1x, p1y] = isoUV(cubeH + bh, 0, v_back)
  const [p2x, p2y] = isoUV(cubeH + bh, W, v_back)
  const [p3x, p3y] = isoUV(0, W, v_back)
  const [p4x, p4y] = isoUV(0, 0, v_back)
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.closePath()
  ctx.fillStyle = fabricL; ctx.fill()

  // 3. Armrests
  const ah = 14
  const armW = 0.25
  for (const side of [0, W - armW]) {
    const isLeft = side === 0
    isoRect(cubeH + ah, side, v_back, side + armW, D, fabric, undefined, true)
    
    const inner_u = isLeft ? side + armW : side
    const [s1x, s1y] = isoUV(cubeH + ah, inner_u, v_back)
    const [s2x, s2y] = isoUV(cubeH + ah, inner_u, D)
    const [s3x, s3y] = isoUV(0, inner_u, D)
    const [s4x, s4y] = isoUV(0, inner_u, v_back)
    ctx.beginPath(); ctx.moveTo(s1x, s1y); ctx.lineTo(s2x, s2y); ctx.lineTo(s3x, s3y); ctx.lineTo(s4x, s4y); ctx.closePath()
    ctx.fillStyle = isLeft ? fabricR : fabricL; ctx.fill()
  }

  // 4. Seam lines
  for (let i = 1; i < W; i++) {
    isoLine(cubeH, i, v_back, i, D, shadow, 0.5)
  }
}
