import { DrawContext } from './types'
import { isoRect, shade, mix } from '../../../utils/isometric'

export const drawBed: (isDouble: boolean) => (c: DrawContext) => void = (isDouble) => ({
  cubeH, W, D, color, topColor, isoRect
}) => {
  const frame = shade(color, 0.7)
  const sheetColor = topColor

  // 1. Frame
  isoRect(cubeH * 0.8, 0, 0, W, D, frame, undefined, true)
  
  // 2. Mattress/Sheet
  isoRect(cubeH, 0.05, 0.05, W - 0.05, D - 0.05, sheetColor, undefined, true)

  // 3. Pillows
  const pColor = mix(sheetColor, '#fff', 0.4)
  if (!isDouble) {
    isoRect(cubeH + 3, 0.25, 0.15, 0.75, 0.45, pColor, undefined, true)
  } else {
    isoRect(cubeH + 3, 0.15, 0.15, 0.45, 0.45, pColor, undefined, true)
    isoRect(cubeH + 3, 0.55, 0.15, 0.85, 0.45, pColor, undefined, true)
  }
}
