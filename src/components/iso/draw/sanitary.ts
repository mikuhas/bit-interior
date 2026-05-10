import { DrawContext } from './types'
import { shade } from '../../../utils/isometric'

export const drawBathtub = ({
  cubeH, W, D, color, topColor, isoRect
}: DrawContext) => {
  isoRect(cubeH, 0, 0, W, D, topColor, undefined, true)
  isoRect(cubeH + 0.5, 0.08, 0.08, W - 0.08, D - 0.08, color)
}

export const drawToilet = ({
  ctx, cubeH, W, D, topColor, isoRect, isoUV
}: DrawContext) => {
  const p = topColor
  const [tcx, tcy] = isoUV(cubeH, W / 2, 0.7)
  
  ctx.beginPath(); ctx.ellipse(tcx, tcy, 12, 8, 0, 0, Math.PI * 2); ctx.fillStyle = p; ctx.fill()
  ctx.strokeStyle = shade(p, 0.8); ctx.lineWidth = 0.5; ctx.stroke()
  
  isoRect(cubeH + 18, 0.25, 0.05, 0.75, 0.3, p, undefined, true)
}
