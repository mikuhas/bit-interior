import { DrawContext } from './types'
import { shade } from '../../../utils/isometric'

export const drawDesk = ({
  cubeH, W, D, color, topColor, isoRect, drawGrain
}: DrawContext) => {
  const surface = topColor
  const frameC = color
  const grainC = shade(surface, 0.9)
  
  // Main part (horizontal)
  isoRect(cubeH, 0, 0, W, 1, surface, undefined, true)
  drawGrain(cubeH, 0, 0, W, 1, grainC)
  
  // Corner part (vertical segment)
  isoRect(cubeH, W - 1, 1, W, D, surface, undefined, true)
  drawGrain(cubeH, W - 1, 1, W, D, grainC)

  // Legs
  const lw = 0.12
  const legs = [
    [0.05, 0.05], [W - lw, 0.05],
    [W - lw, D - lw], [W - 1 + 0.05, D - lw],
    [W - 1 + 0.05, 1 - lw], [0.05, 1 - lw]
  ]
  legs.forEach(([u, v]) => {
    isoRect(0, u, v, u + lw, v + lw, frameC)
  })
}

export const drawTable = ({
  cubeH, W, D, color, topColor, isoRect, drawGrain
}: DrawContext) => {
  isoRect(cubeH, 0, 0, W, D, topColor, undefined, true)
  drawGrain(cubeH, 0, 0, W, D, shade(topColor, 0.9))
  
  const lw = 0.15
  isoRect(0, 0.1, 0.1, lw, lw, color)
  isoRect(0, W - lw, 0.1, W, lw, color)
  isoRect(0, 0.1, D - lw, lw, D, color)
  isoRect(0, W - lw, D - lw, W, D, color)
}
