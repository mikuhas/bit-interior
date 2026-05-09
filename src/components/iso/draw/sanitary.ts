import { DrawContext } from './types'
import { isoRect, isoUV, shade, mix } from '../../../utils/isometric'

export const drawBathtub = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, topColor)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.1, highlight)
  isoRect(ctx, x, y, cubeH + 0.5, 0.1, 0.1, W - 0.1, D - 0.1, color)
}

export const drawToilet = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  const p = topColor
  const seat = shade(p, 0.9)
  isoRect(ctx, x, y, cubeH, 0.15, 0.05, 0.85, 0.45, p, shade(p, 0.7))
  const [tcx, tcy] = isoUV(x, y, cubeH, 0.5, 0.7)
  ctx.beginPath(); ctx.ellipse(tcx, tcy + 2, 15, 9, 0, 0, Math.PI * 2); ctx.fillStyle = shade(p, 0.8); ctx.fill()
  ctx.beginPath(); ctx.ellipse(tcx, tcy, 15, 9, 0, 0, Math.PI * 2); ctx.fillStyle = p; ctx.fill()
  ctx.beginPath(); ctx.ellipse(tcx, tcy + 1, 9, 5, 0, 0, Math.PI * 2); ctx.fillStyle = seat; ctx.fill()
}
