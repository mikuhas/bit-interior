import { useRef, useEffect, useState, useCallback } from 'react'
import { RoomState, CellType, EditTool, PlacedFurniture } from '../types'
import { FURNITURE_TEMPLATES, getTemplate } from '../data/furniture'
import { getEffectiveShape, canPlaceFurniture } from '../utils/room'

const CELL_SIZE = 40

interface Props {
  room: RoomState
  tool: EditTool
  selectedTemplateId: string | null
  furnitureRotation: 0 | 1 | 2 | 3
  selectedInstanceId: string | null
  onCellChange: (row: number, col: number, type: CellType) => void
  onPlaceFurniture: (f: PlacedFurniture) => void
  onSelectFurniture: (id: string | null) => void
  onMoveFurniture: (id: string, x: number, y: number) => void
  onKeyDelete?: () => void
  onRotate?: () => void
  onInteractionStart?: () => void
  blueprintMode?: boolean
}

function drawCell(
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

  if (type === 'door') {
    // 壁ベース
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
    // 開口部（床色）
    ctx.fillStyle = '#1e3357'
    ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8)
    // 扉パネル＋弧（間取り図スタイル）
    ctx.save()
    ctx.strokeStyle = '#e8c050'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + 4, y + 4)
    ctx.lineTo(x + cellSize - 4, y + 4)
    ctx.stroke()
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x + 4, y + 4, cellSize - 8, 0, Math.PI / 2)
    ctx.stroke()
    ctx.restore()
    return
  }

  if (type === 'window') {
    // 壁ベース
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
    // ガラス面
    ctx.fillStyle = 'rgba(100,200,255,0.18)'
    ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8)
    // ガラス分割線（間取り図スタイル）
    ctx.save()
    ctx.strokeStyle = 'rgba(160,230,255,0.75)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x + 4, y + cellSize / 2)
    ctx.lineTo(x + cellSize - 4, y + cellSize / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + cellSize / 2, y + 4)
    ctx.lineTo(x + cellSize / 2, y + cellSize - 4)
    ctx.stroke()
    ctx.restore()
    return
  }

  if (type === 'wallX') {
    ctx.fillStyle = '#1a2d50'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x+2, y+2, cellSize-4, cellSize-4)
    const th = Math.max(4, Math.round(cellSize * 0.1))
    ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y+cellSize-th, cellSize, th)
    ctx.fillStyle = '#5a6080'; ctx.fillRect(x, y+cellSize-th, cellSize, 2)
    return
  }

  if (type === 'wallY') {
    ctx.fillStyle = '#1a2d50'; ctx.fillRect(x, y, cellSize, cellSize)
    ctx.fillStyle = '#1e3357'; ctx.fillRect(x+2, y+2, cellSize-4, cellSize-4)
    const th = Math.max(4, Math.round(cellSize * 0.1))
    ctx.fillStyle = '#3d4160'; ctx.fillRect(x+cellSize-th, y, th, cellSize)
    ctx.fillStyle = '#5a6080'; ctx.fillRect(x+cellSize-th, y, 2, cellSize)
    return
  }
}

function drawFurnitureCell(
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

// 家具タイプ別アイコンをBEVセルに描画
function drawFurnitureIcon(
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
      // マットレスの縞線
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
      // ヘッドボード (localRow=0)
      if (localRow === 0) {
        ctx.fillStyle = darken(dark, 0.3)
        ctx.fillRect(x + 3, y + 3, cellSize - 6, 7)
        // 枕
        ctx.fillStyle = lighten(light, 0.5)
        ctx.fillRect(x + 5, y + 12, cellSize - 10, 9)
        ctx.strokeStyle = darken(light, 0.1)
        ctx.lineWidth = 0.5
        ctx.strokeRect(x + 5, y + 12, cellSize - 10, 9)
      }
      break
    }

    case 'sofa': {
      // 背もたれ (localRow=0 = 後ろ側)
      if (localRow === 0) {
        ctx.fillStyle = darken(dark, 0.35)
        ctx.fillRect(x + 3, y + 3, cellSize - 6, 8)
      }
      // シートクッション縁取り
      ctx.strokeStyle = darken(dark, 0.25)
      ctx.lineWidth = 1
      ctx.strokeRect(x + 5, y + 13, cellSize - 10, cellSize - 17)
      // クッション間の仕切り
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
      // 天板ライン (木目)
      ctx.strokeStyle = lighten(light, 0.2)
      ctx.lineWidth = 0.7
      for (let i = 0; i < 3; i++) {
        const lx = x + 7 + i * 9
        ctx.beginPath()
        ctx.moveTo(lx, y + 5)
        ctx.lineTo(lx + 4, y + cellSize - 5)
        ctx.stroke()
      }
      // モニター (localRow=0で最初の列にのみ描画)
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
      // 座面 (円形)
      ctx.beginPath()
      ctx.arc(cx, cy + 3, (cellSize / 2) - 7, 0, Math.PI * 2)
      ctx.fillStyle = lighten(light, 0.15)
      ctx.fill()
      ctx.strokeStyle = darken(dark, 0.2)
      ctx.lineWidth = 1
      ctx.stroke()
      // 背もたれ
      if (localRow === 0) {
        ctx.fillStyle = darken(dark, 0.4)
        ctx.fillRect(x + 6, y + 3, cellSize - 12, 6)
      }
      break
    }

    case 'bookshelf': {
      // 本の背表紙 (縦線)
      const bookColors = ['#d04040', '#4080d0', '#40b050', '#d09030', '#a040c0', '#40b0a0']
      const bookCount = 4
      const bookW = (cellSize - 10) / bookCount
      for (let b = 0; b < bookCount; b++) {
        const bx = x + 5 + b * bookW
        ctx.fillStyle = bookColors[(localCol * bookCount + b) % bookColors.length]
        ctx.fillRect(bx + 1, y + 5, bookW - 2, cellSize - 10)
      }
      // 棚板線
      ctx.strokeStyle = darken(dark, 0.2)
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x + 3, y + cellSize - 6)
      ctx.lineTo(x + cellSize - 3, y + cellSize - 6)
      ctx.stroke()
      break
    }

    case 'coffee-table': {
      // ガラス天板 (透明感)
      ctx.fillStyle = 'rgba(180,220,255,0.12)'
      ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      ctx.strokeStyle = lighten(light, 0.3)
      ctx.lineWidth = 1.5
      ctx.strokeRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      // 脚
      ctx.fillStyle = darken(dark, 0.3)
      ctx.fillRect(x + 3, y + 3, 4, 4)
      ctx.fillRect(x + cellSize - 7, y + 3, 4, 4)
      ctx.fillRect(x + 3, y + cellSize - 7, 4, 4)
      ctx.fillRect(x + cellSize - 7, y + cellSize - 7, 4, 4)
      break
    }

    case 'dining-table': {
      // 楕円天板
      ctx.beginPath()
      ctx.ellipse(cx, cy, cellSize / 2 - 4, cellSize / 2 - 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = lighten(light, 0.15)
      ctx.fill()
      ctx.strokeStyle = darken(dark, 0.25)
      ctx.lineWidth = 1
      ctx.stroke()
      // 木目
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
      // TV画面
      ctx.fillStyle = '#050510'
      ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      // 画面光沢
      ctx.fillStyle = 'rgba(100,150,255,0.08)'
      ctx.fillRect(x + 6, y + 6, (cellSize - 12) / 2, (cellSize - 12) / 2)
      ctx.strokeStyle = '#2a2a50'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 5, y + 5, cellSize - 10, cellSize - 10)
      break
    }

    case 'dresser': {
      // 2枚扉の仕切り
      ctx.strokeStyle = darken(dark, 0.35)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx, y + 5)
      ctx.lineTo(cx, y + cellSize - 5)
      ctx.stroke()
      // 扉パネル
      ctx.strokeStyle = lighten(light, 0.1)
      ctx.lineWidth = 0.5
      ctx.strokeRect(x + 5, y + 5, (cellSize / 2) - 7, cellSize - 10)
      ctx.strokeRect(cx + 2, y + 5, (cellSize / 2) - 7, cellSize - 10)
      // 取っ手
      ctx.fillStyle = '#c8a820'
      ctx.beginPath()
      ctx.arc(cx - 6, cy, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 6, cy, 2, 0, Math.PI * 2)
      ctx.fill()
      break
    }

    case 'plant': {
      // 鉢
      ctx.beginPath()
      ctx.ellipse(cx, cy + 5, 8, 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#704020'
      ctx.fill()
      // 葉 (円形クラスター)
      const leafC = ['#2a8a18', '#3ab020', '#4ac030', '#20700e', '#35a818']
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        const lx = cx + Math.cos(angle) * 9
        const ly = cy - 3 + Math.sin(angle) * 6
        ctx.beginPath()
        ctx.arc(lx, ly, 6, 0, Math.PI * 2)
        ctx.fillStyle = leafC[i]
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(cx, cy - 3, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#40b828'
      ctx.fill()
      break
    }

    case 'bathtub': {
      // バスタブ内部 (楕円)
      ctx.beginPath()
      ctx.ellipse(cx, cy, (cellSize / 2) - 5, (cellSize / 2) - 7, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(100,185,220,0.35)'
      ctx.fill()
      ctx.strokeStyle = lighten(light, 0.2)
      ctx.lineWidth = 1.5
      ctx.stroke()
      // 水面光沢
      ctx.beginPath()
      ctx.ellipse(cx - 5, cy - 4, 8, 4, -0.3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fill()
      break
    }

    case 'toilet': {
      // 便座楕円
      ctx.beginPath()
      ctx.ellipse(cx, cy + 3, (cellSize / 2) - 6, (cellSize / 2) - 8, 0, 0, Math.PI * 2)
      ctx.fillStyle = lighten(light, 0.3)
      ctx.fill()
      ctx.strokeStyle = darken(dark, 0.15)
      ctx.lineWidth = 1
      ctx.stroke()
      // 便座の穴
      ctx.beginPath()
      ctx.ellipse(cx, cy + 4, (cellSize / 2) - 11, (cellSize / 2) - 13, 0, 0, Math.PI * 2)
      ctx.fillStyle = darken(dark, 0.4)
      ctx.fill()
      // タンク (localRow=0)
      if (localRow === 0) {
        ctx.fillStyle = lighten(light, 0.15)
        ctx.fillRect(x + 8, y + 4, cellSize - 16, 8)
        ctx.strokeStyle = darken(dark, 0.15)
        ctx.lineWidth = 0.5
        ctx.strokeRect(x + 8, y + 4, cellSize - 16, 8)
      }
      break
    }
  }

  ctx.restore()
}

function lighten(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const c = (v: number) => Math.min(255, Math.round(v + (255 - v) * amt)).toString(16).padStart(2, '0')
  return '#' + c(r) + c(g) + c(b)
}

function darken(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const c = (v: number) => Math.max(0, Math.round(v * (1 - amt))).toString(16).padStart(2, '0')
  return '#' + c(r) + c(g) + c(b)
}

export default function TopDownCanvas({
  room,
  tool,
  selectedTemplateId,
  furnitureRotation,
  selectedInstanceId,
  onCellChange,
  onPlaceFurniture,
  onSelectFurniture,
  onMoveFurniture,
  onKeyDelete,
  onRotate,
  onInteractionStart,
  blueprintMode = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null)
  const [ghostCell, setGhostCell] = useState<{ x: number; y: number } | null>(null)

  const mouseDownRef = useRef(false)
  const paintTypeRef = useRef<CellType>('floor')
  const draggingRef = useRef<{ instanceId: string; offsetX: number; offsetY: number } | null>(null)

  const canvasWidth = room.width * CELL_SIZE
  const canvasHeight = room.height * CELL_SIZE

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#080912'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    for (let r = 0; r < room.height; r++) {
      for (let c = 0; c < room.width; c++) {
        drawCell(ctx, c, r, room.cells[r][c], CELL_SIZE)
      }
    }

    const furnitureCellMap = new Map<string, { templateId: string; instanceId: string }>()
    for (const pf of room.furniture) {
      const tmpl = getTemplate(pf.templateId)
      if (!tmpl) continue
      const shape = getEffectiveShape(tmpl, pf.rotation, pf.scaleW ?? 1, pf.scaleH ?? 1)
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            furnitureCellMap.set(`${pf.y + r},${pf.x + c}`, {
              templateId: pf.templateId,
              instanceId: pf.instanceId,
            })
          }
        }
      }
    }

    if (blueprintMode) {
      // 図面モード: 家具をアウトライン＋テキストで表示
      for (const pf of room.furniture) {
        const tmpl = getTemplate(pf.templateId)
        if (!tmpl) continue
        const shape = getEffectiveShape(tmpl, pf.rotation, pf.scaleW ?? 1, pf.scaleH ?? 1)
        const shapeRows = shape.length
        const shapeCols = shape[0]?.length ?? 1
        const isSelected = pf.instanceId === selectedInstanceId

        for (let r = 0; r < shapeRows; r++) {
          for (let c = 0; c < shapeCols; c++) {
            if (!shape[r][c]) continue
            const px = (pf.x + c) * CELL_SIZE
            const py = (pf.y + r) * CELL_SIZE
            ctx.fillStyle = isSelected ? 'rgba(255,220,0,0.15)' : 'rgba(0,180,220,0.12)'
            ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2)
            ctx.strokeStyle = isSelected ? '#ffcc00' : '#00aadd'
            ctx.lineWidth = 1.5
            ctx.setLineDash([])
            ctx.strokeRect(px + 1.5, py + 1.5, CELL_SIZE - 3, CELL_SIZE - 3)
          }
        }
        // 家具名をセンターに表示
        const cx = (pf.x + shapeCols / 2) * CELL_SIZE
        const cy = (pf.y + shapeRows / 2) * CELL_SIZE
        ctx.save()
        ctx.fillStyle = isSelected ? '#ffcc00' : '#00eeff'
        ctx.font = `bold 7px 'Press Start 2P', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(tmpl.nameJa, cx, cy)
        ctx.restore()
      }
    } else {
      // 通常モード: 家具をカラーブロック＋アイコンで表示
      for (const pf of room.furniture) {
        const tmpl = getTemplate(pf.templateId)
        if (!tmpl) continue
        const shape = getEffectiveShape(tmpl, pf.rotation, pf.scaleW ?? 1, pf.scaleH ?? 1)
        const isSelected = pf.instanceId === selectedInstanceId
        const effectiveColor = pf.colorOverride ?? tmpl.color
        const effectiveTopColor = pf.colorOverride
          ? lighten(pf.colorOverride, 0.35)
          : tmpl.topColor
        const shapeRows = shape.length
        const shapeCols = shape[0]?.length ?? 1

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
              drawFurnitureCell(ctx, pf.x + c, pf.y + r, effectiveColor, effectiveTopColor, CELL_SIZE, tmpl.height)
            }
          }
        }

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
              drawFurnitureIcon(ctx, pf.x + c, pf.y + r, tmpl.id, effectiveColor, effectiveTopColor, r, c, shapeRows, shapeCols, CELL_SIZE)
            }
          }
        }

        if (isSelected) {
          ctx.save()
          ctx.strokeStyle = '#ffff00'
          ctx.lineWidth = 3
          ctx.setLineDash([6, 3])
          for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
              if (shape[r][c]) {
                const px = (pf.x + c) * CELL_SIZE
                const py = (pf.y + r) * CELL_SIZE
                ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4)
              }
            }
          }
          ctx.setLineDash([])
          ctx.restore()
        }
      }
    }

    // Ghost furniture (tool=furniture)
    if (tool === 'furniture' && selectedTemplateId && ghostCell) {
      const tmpl = FURNITURE_TEMPLATES.find(t => t.id === selectedTemplateId)
      if (tmpl) {
        const shape = getEffectiveShape(tmpl, furnitureRotation, 1, 1)
        const valid = canPlaceFurniture(
          room, tmpl, ghostCell.x, ghostCell.y, furnitureRotation, undefined, 1, 1
        )

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
              const px = (ghostCell.x + c) * CELL_SIZE
              const py = (ghostCell.y + r) * CELL_SIZE
              ctx.fillStyle = valid ? 'rgba(0,255,136,0.4)' : 'rgba(255,50,50,0.4)'
              ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE)
              ctx.strokeStyle = valid ? '#00ff88' : '#ff3232'
              ctx.lineWidth = 2
              ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2)
            }
          }
        }
      }
    }

    // Hover highlight
    if (hoverCell && tool !== 'furniture') {
      const px = hoverCell.col * CELL_SIZE
      const py = hoverCell.row * CELL_SIZE
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE)
    }
  }, [room, hoverCell, ghostCell, tool, selectedTemplateId, furnitureRotation, selectedInstanceId, canvasWidth, canvasHeight, blueprintMode])

  const getCellFromEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const col = Math.floor((e.clientX - rect.left) / CELL_SIZE)
    const row = Math.floor((e.clientY - rect.top) / CELL_SIZE)
    if (col < 0 || col >= room.width || row < 0 || row >= room.height) return null
    return { row, col }
  }, [room.width, room.height])

  const getFurnitureAt = useCallback((col: number, row: number): PlacedFurniture | null => {
    for (const pf of room.furniture) {
      const tmpl = getTemplate(pf.templateId)
      if (!tmpl) continue
      const shape = getEffectiveShape(tmpl, pf.rotation, pf.scaleW ?? 1, pf.scaleH ?? 1)
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] && pf.y + r === row && pf.x + c === col) {
            return pf
          }
        }
      }
    }
    return null
  }, [room.furniture])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e)
    if (!cell) return
    onInteractionStart?.()
    const { row, col } = cell

    if (tool === 'floor' || tool === 'wallX' || tool === 'wallY' || tool === 'door' || tool === 'window' || tool === 'erase') {
      mouseDownRef.current = true
      const newType: CellType =
        tool === 'floor' ? 'floor'
        : tool === 'wallX' ? 'wallX'
        : tool === 'wallY' ? 'wallY'
        : tool === 'door' ? 'door'
        : tool === 'window' ? 'window'
        : 'empty'
      paintTypeRef.current = newType
      onCellChange(row, col, newType)
    } else if (tool === 'furniture' && selectedTemplateId && ghostCell) {
      const tmpl = FURNITURE_TEMPLATES.find(t => t.id === selectedTemplateId)
      if (tmpl) {
        const valid = canPlaceFurniture(room, tmpl, ghostCell.x, ghostCell.y, furnitureRotation)
        if (valid) {
          onPlaceFurniture({
            instanceId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            templateId: selectedTemplateId,
            x: ghostCell.x,
            y: ghostCell.y,
            z: 0,
            rotation: furnitureRotation,
            scaleW: 1,
            scaleH: 1,
          })
        }
      }
    } else if (tool === 'select') {
      const pf = getFurnitureAt(col, row)
      if (pf) {
        onSelectFurniture(pf.instanceId)
        const tmpl = getTemplate(pf.templateId)
        if (tmpl) {
          draggingRef.current = {
            instanceId: pf.instanceId,
            offsetX: col - pf.x,
            offsetY: row - pf.y,
          }
        }
      } else {
        onSelectFurniture(null)
      }
    }
  }, [tool, selectedTemplateId, ghostCell, room, furnitureRotation, onCellChange, onPlaceFurniture, onSelectFurniture, getFurnitureAt, onInteractionStart])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e)
    if (!cell) {
      setHoverCell(null)
      setGhostCell(null)
      return
    }
    const { row, col } = cell
    setHoverCell({ row, col })

    if (tool === 'furniture' && selectedTemplateId) {
      setGhostCell({ x: col, y: row })
    } else {
      setGhostCell(null)
    }

    if (mouseDownRef.current && (tool === 'floor' || tool === 'wallX' || tool === 'wallY' || tool === 'door' || tool === 'window' || tool === 'erase')) {
      onCellChange(row, col, paintTypeRef.current)
    }

    if (draggingRef.current && tool === 'select') {
      const { instanceId, offsetX, offsetY } = draggingRef.current
      const newX = col - offsetX
      const newY = row - offsetY
      const pf = room.furniture.find(f => f.instanceId === instanceId)
      if (pf) {
        const tmpl = getTemplate(pf.templateId)
        if (tmpl) {
          const valid = canPlaceFurniture(room, tmpl, newX, newY, pf.rotation, instanceId)
          if (valid) {
            onMoveFurniture(instanceId, newX, newY)
          }
        }
      }
    }
  }, [tool, selectedTemplateId, room, onCellChange, onMoveFurniture, getCellFromEvent])

  const onMouseUp = useCallback(() => {
    mouseDownRef.current = false
    draggingRef.current = null
  }, [])

  const onMouseLeave = useCallback(() => {
    mouseDownRef.current = false
    draggingRef.current = null
    setHoverCell(null)
    setGhostCell(null)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedInstanceId) onKeyDelete?.()
      }
      if (e.key === 'r' || e.key === 'R') {
        onRotate?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedInstanceId, onKeyDelete, onRotate])

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        display: 'block',
        cursor:
          tool === 'furniture' ? 'crosshair'
          : tool === 'select' ? 'pointer'
          : tool === 'erase' ? 'cell'
          : 'crosshair',
        imageRendering: 'pixelated',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  )
}
