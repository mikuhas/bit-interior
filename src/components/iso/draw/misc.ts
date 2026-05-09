import { DrawContext } from './types'
import { isoRect, isoUV, shade, mix } from '../../../utils/isometric'

export const drawBookshelf = ({
  ctx, x, y, cubeH, W, D, color
}: DrawContext) => {
  const frame = color
  const BC = ['#ff5555', '#5588ff', '#55cc55', '#ffcc55', '#cc55ff']
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, frame)
  const count = W * 3
  for (let b = 0; b < count; b++) {
    const bc = BC[b % BC.length]
    isoRect(ctx, x, y, cubeH, b / count + 0.05, 0.2, (b + 1) / count - 0.05, D - 0.1, bc)
  }
}

export const drawDresser = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, topColor)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.08, highlight)
  isoRect(ctx, x, y, cubeH, 0.1, 0.05, W - 0.1, D - 0.05, mix(topColor, color, 0.2))
  const [hx, hy] = isoUV(x, y, cubeH, 0.3, D / 2)
  ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill()
}

export const drawTvStand = ({
  ctx, x, y, cubeH, W, D, color, highlight
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, color)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.1, highlight)
  isoRect(ctx, x, y, cubeH + 2, W / 2 - 0.1, 0.4, W / 2 + 0.1, 0.6, '#111')
  isoRect(ctx, x, y + 6, cubeH + 20, W / 2 - 0.8, 0.45, W / 2 + 0.8, 0.55, '#111')
  isoRect(ctx, x, y + 6, cubeH + 20, W / 2 - 0.75, 0.46, W / 2 + 0.75, 0.54, '#222')
}

export const drawPlant = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  const pot = shade(color, 0.6)
  const leaf = topColor
  const [cx, cy] = isoUV(x, y, cubeH, W / 2, D / 2)
  ctx.beginPath(); ctx.ellipse(cx, cy + 2, 10, 6, 0, 0, Math.PI * 2); ctx.fillStyle = pot; ctx.fill()
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const [lx, ly] = isoUV(x, y, cubeH + 8, W / 2 + Math.cos(a) * 0.25, D / 2 + Math.sin(a) * 0.25)
    ctx.beginPath(); ctx.arc(lx, ly - 4, 7, 0, Math.PI * 2); ctx.fillStyle = leaf; ctx.fill()
  }
}
