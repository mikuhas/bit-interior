import { DrawContext } from './types'
import { isoRect, isoUV, shade, mix } from '../../../utils/isometric'

export const drawFridge = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight, shadow
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0.05, 0.05, W - 0.05, D - 0.05, color)
  isoRect(ctx, x, y, cubeH, 0.05, 0.05, W - 0.05, 0.2, highlight)
  const h_mid = cubeH * 0.6
  const [m1x, m1y] = isoUV(x, y, h_mid, 0.05, D - 0.05)
  const [m2x, m2y] = isoUV(x, y, h_mid, W - 0.05, D - 0.05)
  ctx.strokeStyle = shadow; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m1x, m1y); ctx.lineTo(m2x, m2y); ctx.stroke()
  isoRect(ctx, x, y, h_mid + 5, 0.15, D - 0.06, 0.25, D - 0.03, '#333')
  isoRect(ctx, x, y, h_mid - 12, 0.15, D - 0.06, 0.25, D - 0.03, '#333')
}

export const drawKitchen = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight, shadow
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, topColor)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.1, highlight)
  isoRect(ctx, x, y, cubeH + 0.5, 0.15, 0.15, 0.85, 0.85, shade(color, 0.8), shadow)
  const [fx, fy] = isoUV(x, y, cubeH + 10, 0.5, 0.15)
  ctx.fillStyle = '#99aabb'; ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2); ctx.fill()
  isoRect(ctx, x, y, cubeH + 14, 0.45, 0.05, 0.55, 0.3, '#bbccee', '#778899')
}

export const drawChest = ({
  ctx, x, y, cubeH, W, D, topColor, color, highlight, shadow
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0.05, 0.05, W - 0.05, D - 0.05, topColor)
  isoRect(ctx, x, y, cubeH, 0.05, 0.05, W - 0.05, 0.15, highlight)
  for (let i = 1; i < 3; i++) {
    const h_draw = cubeH * (i / 3)
    const [d1x, d1y] = isoUV(x, y, h_draw, 0.05, D - 0.05)
    const [d2x, d2y] = isoUV(x, y, h_draw, W - 0.05, D - 0.05)
    ctx.strokeStyle = shadow; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(d1x, d1y); ctx.lineTo(d2x, d2y); ctx.stroke()
    for (let j = 1; j < 3; j++) {
      const [hx, hy] = isoUV(x, y, h_draw + 4, W * (j / 3), D - 0.05)
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill()
    }
  }
}
