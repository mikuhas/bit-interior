import { DrawContext } from './types'
import { shade, mix } from '../../../utils/isometric'

export const drawBookshelf = ({
  cubeH, W, D, color, isoRect, drawGrain
}: DrawContext) => {
  const frame = color
  const grainC = shade(frame, 0.8)
  const BC = ['#ff5555', '#5588ff', '#55cc55', '#ffcc55', '#cc55ff']
  
  isoRect(cubeH, 0, 0, W, D, frame, undefined, true)
  drawGrain(cubeH, 0, 0, W, D, grainC)
  
  const count = Math.floor(W * 3)
  for (let b = 0; b < count; b++) {
    const bc = BC[b % BC.length]
    isoRect(cubeH, b / count + 0.05, 0.2, (b + 1) / count - 0.05, D - 0.1, bc)
  }
}

export const drawDresser = ({
  ctx, cubeH, W, D, color, topColor, isoRect, isoUV
}: DrawContext) => {
  isoRect(cubeH, 0, 0, W, D, topColor, undefined, true)
  isoRect(cubeH, 0.1, 0.05, W - 0.1, D - 0.05, mix(topColor, color, 0.2))
  const [hx, hy] = isoUV(cubeH, 0.3, D / 2)
  ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill()
}

export const drawTvStand = ({
  cubeH, W, D, color, isoRect
}: DrawContext) => {
  isoRect(cubeH, 0, 0, W, D, color, undefined, true)
  isoRect(cubeH + 2, W / 2 - 0.8, 0.45, W / 2 + 0.8, 0.55, '#111', undefined, true)
}

export const drawPlant = ({
  cubeH, color, topColor, isoRect
}: DrawContext) => {
  const potColor = shade(color, 0.6)
  const leafColor = topColor
  
  isoRect(cubeH * 0.4, 0.3, 0.3, 0.7, 0.7, potColor, undefined, true)
  
  for (let i = 0; i < 3; i++) {
    const h = cubeH * (0.6 + i * 0.2)
    const s = 0.25 - i * 0.05
    isoRect(h, 0.5 - s, 0.5 - s, 0.5 + s, 0.5 + s, shade(leafColor, 1 - i * 0.1), undefined, true)
  }
}
