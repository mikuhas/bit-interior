import { DrawContext } from './types'
import { isoRect, shade, mix } from '../../../utils/isometric'

export const drawBed: (isDouble: boolean) => (c: DrawContext) => void = (isDouble) => ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}) => {
  const frame = shade(color, 0.7)
  const sheetColor = topColor

  // 1. フレーム
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, frame)
  // 2. シーツ
  isoRect(ctx, x, y, cubeH, 0.08, 0.08, W - 0.08, D - 0.08, sheetColor)
  isoRect(ctx, x, y, cubeH, 0.08, 0.08, W - 0.08, 0.2, highlight)

  // 3. 枕
  const pColor = mix(sheetColor, '#fff', 0.4)
  if (!isDouble) {
    isoRect(ctx, x, y, cubeH + 3, 0.2, 0.15, 0.8, 0.45, pColor, shade(pColor, 0.9))
  } else {
    isoRect(ctx, x, y, cubeH + 3, 0.3, 0.15, 1.2, 0.45, pColor, shade(pColor, 0.9))
    isoRect(ctx, x, y, cubeH + 3, 1.8, 0.15, 2.7, 0.45, pColor, shade(pColor, 0.9))
  }
}
