import { DrawContext } from './types'
import { isoRect, shade } from '../../../utils/isometric'

export const drawDesk = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  const surface = topColor
  const frameC = color
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, surface)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.08, highlight)
  const lw = 0.15
  isoRect(ctx, x, y, 0, 0.05, 0.05, lw, lw, frameC)
  isoRect(ctx, x, y, 0, W - lw, 0.05, W, lw, frameC)
  isoRect(ctx, x, y, 0, 0.05, D - lw, lw, D, frameC)
  isoRect(ctx, x, y, 0, W - lw, D - lw, W, D, frameC)
  isoRect(ctx, x, y, cubeH + 2, W / 2 - 0.2, 0.2, W / 2 + 0.2, 0.3, '#333')
  isoRect(ctx, x, y + 4, cubeH + 12, W / 2 - 0.4, 0.2, W / 2 + 0.4, 0.28, '#222')
  isoRect(ctx, x, y + 4, cubeH + 12, W / 2 - 0.35, 0.21, W / 2 + 0.35, 0.27, '#444')
}

export const drawTable = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, topColor)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.08, highlight)
  const lw = 0.15
  isoRect(ctx, x, y, 0, 0.1, 0.1, lw, lw, color)
  isoRect(ctx, x, y, 0, W - lw, 0.1, W, lw, color)
  isoRect(ctx, x, y, 0, 0.1, D - lw, lw, D, color)
  isoRect(ctx, x, y, 0, W - lw, D - lw, W, D, color)
}
