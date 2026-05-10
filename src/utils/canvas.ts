import { CellType } from '../types'

export function drawCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  type: CellType,
  cellSize: number
) {
  const x = col * cellSize
  const y = row * cellSize

  if (type === 'empty') {
    ctx.fillStyle = '#080912'
    ctx.fillRect(x, y, cellSize, cellSize)
    return
  }

  if (type === 'floor' || type === 'autoFloor') {
    ctx.fillStyle = '#1a2d50'
    ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = type === 'autoFloor' ? '#1c3258' : '#1e3357'
    ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
    ctx.strokeStyle = '#0d1535'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1)
    return
  }

  if (type === 'wall') {
    ctx.fillStyle = '#3d4160'
    ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#5a6080'
    ctx.fillRect(x, y, cellSize, 4)
    ctx.fillStyle = '#4d5170'
    ctx.fillRect(x, y, 4, cellSize)
    ctx.fillStyle = '#252840'
    ctx.fillRect(x, y + cellSize - 4, cellSize, 4)
    ctx.fillStyle = '#2d3050'
    ctx.fillRect(x + cellSize - 4, y, 4, cellSize)
    return
  }

  if (type.startsWith('door')) {
    const isMirrored = type.endsWith('M')
    const baseType = isMirrored ? type.slice(0, -1) : type
    const rot = baseType === 'door' ? 0 : baseType === 'door90' ? 1 : baseType === 'door180' ? 2 : 3
    
    ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#5a6080'; ctx.fillRect(x, y, cellSize, 4)
    ctx.fillStyle = '#4d5170'; ctx.fillRect(x, y, 4, cellSize)
    ctx.fillStyle = '#252840'; ctx.fillRect(x, y + cellSize - 4, cellSize, 4)
    ctx.fillStyle = '#2d3050'; ctx.fillRect(x + cellSize - 4, y, 4, cellSize)
    
    ctx.save()
    ctx.translate(x + cellSize / 2, y + cellSize / 2)
    ctx.rotate((rot * Math.PI) / 2)
    if (isMirrored) ctx.scale(1, -1)
    ctx.translate(-(x + cellSize / 2), -(y + cellSize / 2))
    
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8)
    ctx.strokeStyle = '#e8c050'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + cellSize - 4, y + 4); ctx.stroke()
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(x + 4, y + 4, cellSize - 8, 0, Math.PI / 2); ctx.stroke()
    ctx.restore()
    return
  }

  if (type === 'window' || type === 'windowTop' || type === 'windowRight' || type === 'windowBottom' || type === 'windowLeft') {
    ctx.fillStyle = '#1a2d50'
    ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = 'rgba(74, 125, 157, 0.5)'
    ctx.fillRect(x, y, cellSize, cellSize)
    ctx.strokeStyle = '#2a4868'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, cellSize, cellSize)
    ctx.beginPath()
    ctx.moveTo(x + cellSize / 2, y)
    ctx.lineTo(x + cellSize / 2, y + cellSize)
    ctx.moveTo(x, y + cellSize / 2)
    ctx.lineTo(x + cellSize, y + cellSize / 2)
    ctx.stroke()
    ctx.strokeStyle = '#e8c050'
    ctx.lineWidth = 3
    if (type === 'windowTop') ctx.strokeRect(x, y, cellSize, 4)
    if (type === 'windowRight') ctx.strokeRect(x + cellSize - 4, y, 4, cellSize)
    if (type === 'windowBottom') ctx.strokeRect(x, y + cellSize - 4, cellSize, 4)
    if (type === 'windowLeft') ctx.strokeRect(x, y, 4, cellSize)
    return
  }

  if (type === 'wallX' || type === 'wallBottom') {
    ctx.fillStyle = '#1a2d50'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x+2, y+2, cellSize-4, cellSize-4)
    ctx.strokeStyle = '#0d1535'; ctx.lineWidth = 1; ctx.strokeRect(x+0.5, y+0.5, cellSize-1, cellSize-1)
    const th = Math.max(4, Math.round(cellSize * 0.1))
    ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y+cellSize-th, cellSize, th)
    ctx.fillStyle = '#5a6080'; ctx.fillRect(x, y+cellSize-th, cellSize, 2)
    return
  }

  if (type === 'wallY' || type === 'wallRight') {
    ctx.fillStyle = '#1a2d50'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x+2, y+2, cellSize-4, cellSize-4)
    ctx.strokeStyle = '#0d1535'; ctx.lineWidth = 1; ctx.strokeRect(x+0.5, y+0.5, cellSize-1, cellSize-1)
    const th = Math.max(4, Math.round(cellSize * 0.1))
    ctx.fillStyle = '#3d4160'; ctx.fillRect(x+cellSize-th, y, th, cellSize)
    ctx.fillStyle = '#5a6080'; ctx.fillRect(x+cellSize-th, y, 2, cellSize)
    return
  }

  if (type === 'wallTop') {
    ctx.fillStyle = '#1a2d50'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x+2, y+2, cellSize-4, cellSize-4)
    ctx.strokeStyle = '#0d1535'; ctx.lineWidth = 1; ctx.strokeRect(x+0.5, y+0.5, cellSize-1, cellSize-1)
    const th = Math.max(4, Math.round(cellSize * 0.1))
    ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y, cellSize, th)
    ctx.fillStyle = '#252840'; ctx.fillRect(x, y+th-2, cellSize, 2)
    return
  }

  if (type === 'wallLeft') {
    ctx.fillStyle = '#1a2d50'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x+2, y+2, cellSize-4, cellSize-4)
    ctx.strokeStyle = '#0d1535'; ctx.lineWidth = 1; ctx.strokeRect(x+0.5, y+0.5, cellSize-1, cellSize-1)
    const th = Math.max(4, Math.round(cellSize * 0.1))
    ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y, th, cellSize)
    ctx.fillStyle = '#4d5170'; ctx.fillRect(x, y, 2, cellSize)
    return
  }

  if (type === 'wallTopRight' || type === 'wallTopLeft' || type === 'wallBottomRight' || type === 'wallBottomLeft') {
    ctx.fillStyle = '#1a2d50'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x+2, y+2, cellSize-4, cellSize-4)
    ctx.strokeStyle = '#0d1535'; ctx.lineWidth = 1; ctx.strokeRect(x+0.5, y+0.5, cellSize-1, cellSize-1)
    const th = Math.max(4, Math.round(cellSize * 0.1))
    const top    = type === 'wallTopRight' || type === 'wallTopLeft'
    const bottom = type === 'wallBottomRight' || type === 'wallBottomLeft'
    const right  = type === 'wallTopRight' || type === 'wallBottomRight'
    const left   = type === 'wallTopLeft' || type === 'wallBottomLeft'
    if (top)    { ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y, cellSize, th); ctx.fillStyle = '#252840'; ctx.fillRect(x, y+th-2, cellSize, 2) }
    if (bottom) { ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y+cellSize-th, cellSize, th); ctx.fillStyle = '#5a6080'; ctx.fillRect(x, y+cellSize-th, cellSize, 2) }
    if (right)  { ctx.fillStyle = '#3d4160'; ctx.fillRect(x+cellSize-th, y, th, cellSize); ctx.fillStyle = '#5a6080'; ctx.fillRect(x+cellSize-th, y, 2, cellSize) }
    if (left)   { ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y, th, cellSize); ctx.fillStyle = '#4d5170'; ctx.fillRect(x, y, 2, cellSize) }
    return
  }
}

export function drawFurnitureCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  color: string,
  topColor: string,
  cellSize: number,
  height: number
) {
  const x = col * cellSize
  const y = row * cellSize

  const shadowOffset = Math.round(height * 1.5)
  if (shadowOffset > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(x + shadowOffset, y + shadowOffset, cellSize, cellSize)
  }

  ctx.fillStyle = color
  ctx.fillRect(x, y, cellSize, cellSize)

  ctx.fillStyle = topColor
  ctx.fillRect(x, y, cellSize, 5)
  ctx.fillRect(x, y, 5, cellSize)

  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.fillRect(x + cellSize - 4, y, 4, cellSize)
  ctx.fillRect(x, y + cellSize - 4, cellSize, 4)
}

export function drawFurnitureIcon(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  templateId: string,
  color: string,
  topColor: string,
  localRow: number,
  localCol: number,
  shapeRows: number,
  shapeCols: number,
  cellSize: number
) {
  const x = col * cellSize
  const y = row * cellSize
  const cx = x + cellSize / 2
  const cy = y + cellSize / 2

  const light = topColor
  const dark = color

  ctx.save()

  switch (templateId) {
    case 'bed-s':
    case 'bed-d': {
      const stripe = lighten(light, 0.25)
      ctx.strokeStyle = stripe
      ctx.lineWidth = 1
      for (let i = 1; i < 3; i++) {
        const lx = x + (cellSize / 3) * i
        ctx.beginPath()
        ctx.moveTo(lx, y + 4)
        ctx.lineTo(lx, y + cellSize - 4)
        ctx.stroke()
      }
      if (localRow === 0) {
        ctx.fillStyle = darken(dark, 0.3)
        ctx.fillRect(x + 3, y + 3, cellSize - 6, 7)
        ctx.fillStyle = lighten(light, 0.5)
        ctx.fillRect(x + 5, y + 12, cellSize - 10, 9)
        ctx.strokeStyle = darken(light, 0.1)
        ctx.lineWidth = 0.5
        ctx.strokeRect(x + 5, y + 12, cellSize - 10, 9)
      }
      break
    }
    case 'sofa': {
      if (localRow === 0) {
        ctx.fillStyle = darken(dark, 0.35)
        ctx.fillRect(x + 3, y + 3, cellSize - 6, 8)
      }
      ctx.strokeStyle = darken(dark, 0.25)
      ctx.lineWidth = 1
      ctx.strokeRect(x + 5, y + 13, cellSize - 10, cellSize - 17)
      if (shapeCols > 1 && localCol < shapeCols - 1) {
        ctx.beginPath()
        ctx.moveTo(x + cellSize - 3, y + 13)
        ctx.lineTo(x + cellSize - 3, y + cellSize - 4)
        ctx.strokeStyle = darken(dark, 0.3)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      break
    }
    case 'desk': {
      ctx.strokeStyle = lighten(light, 0.2)
      ctx.lineWidth = 0.7
      for (let i = 0; i < 3; i++) {
        const lx = x + 7 + i * 9
        ctx.beginPath()
        ctx.moveTo(lx, y + 5)
        ctx.lineTo(lx + 4, y + cellSize - 5)
        ctx.stroke()
      }
      if (localRow === 0 && localCol === 0) {
        ctx.fillStyle = '#0a0a18'
        ctx.fillRect(x + 7, y + 7, cellSize - 14, cellSize - 18)
        ctx.strokeStyle = '#3a3a5a'
        ctx.lineWidth = 1
        ctx.strokeRect(x + 7, y + 7, cellSize - 14, cellSize - 18)
      }
      break
    }
    case 'chair': {
      ctx.beginPath()
      ctx.arc(cx, cy + 3, (cellSize / 2) - 7, 0, Math.PI * 2)
      ctx.fillStyle = lighten(light, 0.15)
      ctx.fill()
      ctx.strokeStyle = darken(dark, 0.2)
      ctx.lineWidth = 1
      ctx.stroke()
      if (localRow === 0) {
        ctx.fillStyle = darken(dark, 0.4)
        ctx.fillRect(x + 6, y + 3, cellSize - 12, 6)
      }
      break
    }
    case 'bookshelf': {
      const bookColors = ['#d04040', '#4080d0', '#40b050', '#d09030', '#a040c0', '#40b0a0']
      const bookCount = 4
      const bookW = (cellSize - 10) / bookCount
      for (let b = 0; b < bookCount; b++) {
        const bx = x + 5 + b * bookW
        ctx.fillStyle = bookColors[(localCol * bookCount + b) % bookColors.length]
        ctx.fillRect(bx + 1, y + 5, bookW - 2, cellSize - 10)
      }
      ctx.strokeStyle = darken(dark, 0.2)
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x + 3, y + cellSize - 6)
      ctx.lineTo(x + cellSize - 3, y + cellSize - 6)
      ctx.stroke()
      break
    }
    case 'coffee-table': {
      ctx.fillStyle = 'rgba(180,220,255,0.12)'
      ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      ctx.strokeStyle = lighten(light, 0.3)
      ctx.lineWidth = 1.5
      ctx.strokeRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      ctx.fillStyle = darken(dark, 0.3)
      ctx.fillRect(x + 3, y + 3, 4, 4)
      ctx.fillRect(x + cellSize - 7, y + 3, 4, 4)
      ctx.fillRect(x + 3, y + cellSize - 7, 4, 4)
      ctx.fillRect(x + cellSize - 7, y + cellSize - 7, 4, 4)
      break
    }
    case 'dining-table': {
      ctx.beginPath()
      ctx.ellipse(cx, cy, cellSize / 2 - 4, cellSize / 2 - 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = lighten(light, 0.15)
      ctx.fill()
      ctx.strokeStyle = darken(dark, 0.25)
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.strokeStyle = lighten(light, 0.3)
      ctx.lineWidth = 0.5
      for (let i = 0; i < 2; i++) {
        const lx = cx - 6 + i * 12
        ctx.beginPath()
        ctx.moveTo(lx, y + 7)
        ctx.lineTo(lx + 3, y + cellSize - 7)
        ctx.stroke()
      }
      break
    }
    case 'tv-stand': {
      ctx.fillStyle = '#050510'
      ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      ctx.fillStyle = 'rgba(100,150,255,0.08)'
      ctx.fillRect(x + 6, y + 6, (cellSize - 12) / 2, (cellSize - 12) / 2)
      ctx.strokeStyle = '#2a2a50'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      break
    }
    case 'dresser': {
      ctx.strokeStyle = darken(dark, 0.35)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx, y + 5)
      ctx.lineTo(cx, y + cellSize - 5)
      ctx.stroke()
      ctx.strokeStyle = lighten(light, 0.1)
      ctx.lineWidth = 0.5
      ctx.strokeRect(x + 5, y + 5, (cellSize / 2) - 7, cellSize - 10)
      ctx.strokeRect(cx + 2, y + 5, (cellSize / 2) - 7, cellSize - 10)
      ctx.fillStyle = '#c8a820'
      ctx.beginPath(); ctx.arc(cx - 6, cy, 2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx + 6, cy, 2, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'plant': {
      ctx.beginPath()
      ctx.ellipse(cx, cy + 5, 8, 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#704020'
      ctx.fill()
      const leafC = ['#2a8a18', '#3ab020', '#4ac030', '#20700e', '#35a818']
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        const lx = cx + Math.cos(angle) * 9
        const ly = cy - 3 + Math.sin(angle) * 6
        ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI * 2); ctx.fillStyle = leafC[i]; ctx.fill()
      }
      ctx.beginPath(); ctx.arc(cx, cy - 3, 6, 0, Math.PI * 2); ctx.fillStyle = '#40b828'; ctx.fill()
      break
    }
    case 'bathtub': {
      ctx.beginPath(); ctx.ellipse(cx, cy, (cellSize / 2) - 5, (cellSize / 2) - 7, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(100,185,220,0.35)'; ctx.fill()
      ctx.strokeStyle = lighten(light, 0.2); ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath(); ctx.ellipse(cx - 5, cy - 4, 8, 4, -0.3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill()
      break
    }
    case 'toilet': {
      ctx.beginPath(); ctx.ellipse(cx, cy + 3, (cellSize / 2) - 6, (cellSize / 2) - 8, 0, 0, Math.PI * 2); ctx.fillStyle = lighten(light, 0.3); ctx.fill()
      ctx.strokeStyle = darken(dark, 0.15); ctx.lineWidth = 1; ctx.stroke()
      ctx.beginPath(); ctx.ellipse(cx, cy + 4, (cellSize / 2) - 11, (cellSize / 2) - 13, 0, 0, Math.PI * 2); ctx.fillStyle = darken(dark, 0.4); ctx.fill()
      if (localRow === 0) {
        ctx.fillStyle = lighten(light, 0.15); ctx.fillRect(x + 8, y + 4, cellSize - 16, 8)
        ctx.strokeStyle = darken(dark, 0.15); ctx.lineWidth = 0.5; ctx.strokeRect(x + 8, y + 4, cellSize - 16, 8)
      }
      break
    }
    case 'fridge': {
      ctx.fillStyle = light; ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8)
      ctx.fillStyle = darken(dark, 0.1); ctx.fillRect(x + 6, y + cellSize - 8, cellSize - 12, 2) // Handle
      break
    }
    case 'kitchen': {
      ctx.fillStyle = light; ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
      if (localCol === 0) { // Sink
        ctx.fillStyle = darken(dark, 0.2); ctx.fillRect(x + 6, y + 6, cellSize - 12, cellSize - 12)
        ctx.fillStyle = '#99aabb'; ctx.beginPath(); ctx.arc(x + cellSize / 2, y + 8, 3, 0, Math.PI * 2); ctx.fill()
      }
      break
    }
    case 'chest': {
      ctx.fillStyle = light; ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8)
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x + 10, y + cellSize - 8, 2, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(x + cellSize - 10, y + cellSize - 8, 2, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'armchair': {
      ctx.fillStyle = light; ctx.fillRect(x + 6, y + 6, cellSize - 12, cellSize - 12)
      if (localRow === 0) { ctx.fillStyle = darken(dark, 0.3); ctx.fillRect(x + 6, y + 4, cellSize - 12, 4) }
      ctx.fillStyle = darken(dark, 0.2); ctx.fillRect(x + 4, y + 6, 4, cellSize - 12)
      ctx.fillRect(x + cellSize - 8, y + 6, 4, cellSize - 12)
      break
    }
  }

  ctx.restore()
}

export function lighten(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const c = (v: number) => Math.min(255, Math.round(v + (255 - v) * amt)).toString(16).padStart(2, '0')
  return '#' + c(r) + c(g) + c(b)
}

export function darken(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const c = (v: number) => Math.max(0, Math.round(v * (1 - amt))).toString(16).padStart(2, '0')
  return '#' + c(r) + c(g) + c(b)
}
