import { DrawContext } from './types'
import { isoUV, shade } from '../../../utils/isometric'

export const drawFridge = ({
  ctx, cubeH, W, D, color, shadow, isoRect, isoUV: wrappedIsoUV
}: DrawContext) => {
  isoRect(cubeH, 0.05, 0.05, W - 0.05, D - 0.05, color, undefined, true)
  
  const h_mid = cubeH * 0.6
  const [m1x, m1y] = wrappedIsoUV(h_mid, 0.05, D - 0.05)
  const [m2x, m2y] = wrappedIsoUV(h_mid, W - 0.05, D - 0.05)
  ctx.strokeStyle = shadow; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m1x, m1y); ctx.lineTo(m2x, m2y); ctx.stroke()
  
  // Minimal handles
  isoRect(h_mid + 8, 0.1, D - 0.08, 0.2, D - 0.04, '#333')
  isoRect(h_mid - 12, 0.1, D - 0.08, 0.2, D - 0.04, '#333')
}

export const drawKitchen = ({
  ctx, cubeH, W, D, color, topColor, shadow, isoRect, isoUV: wrappedIsoUV
}: DrawContext) => {
  isoRect(cubeH, 0, 0, W, D, topColor, undefined, true)
  
  // Sink
  isoRect(cubeH + 0.5, 0.1, 0.1, 0.5, 0.8, shade(color, 0.8), shadow)
  
  // Faucet
  const [fx, fy] = wrappedIsoUV(cubeH + 8, 0.1, 0.1)
  ctx.fillStyle = '#99aabb'; ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill()
}

export const drawChest = ({
  ctx, cubeH, W, D, color, shadow, isoRect, isoUV: wrappedIsoUV
}: DrawContext) => {
  isoRect(cubeH, 0.05, 0.05, W - 0.05, D - 0.05, color, undefined, true)
  
  for (let i = 1; i < 3; i++) {
    const h_draw = cubeH * (i / 3)
    const [d1x, d1y] = wrappedIsoUV(h_draw, 0.05, D - 0.05)
    const [d2x, d2y] = wrappedIsoUV(h_draw, W - 0.05, D - 0.05)
    ctx.strokeStyle = shadow; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(d1x, d1y); ctx.lineTo(d2x, d2y); ctx.stroke()
    
    // Tiny handles
    const [hx, hy] = wrappedIsoUV(h_draw + 4, W / 2, D - 0.05)
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(hx, hy, 1.5, 0, Math.PI * 2); ctx.fill()
  }
}
