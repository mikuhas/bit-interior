import { useRef, useEffect } from 'react'
import { RoomState, CellType, EditTool, PlacedFurniture } from '../../types'
import { FURNITURE_TEMPLATES, getTemplate } from '../../data/furniture'
import { getEffectiveShape, canPlaceFurniture } from '../../utils/room'
import { drawCell, drawFurnitureCell, drawFurnitureIcon, lighten } from '../../utils/canvas'
import { useCanvasInteraction } from '../../hooks/editor/useCanvasInteraction'

const CELL_SIZE = 40

interface Props {
  room: RoomState
  tool: EditTool
  selectedTemplateId: string | null
  furnitureRotation: 0 | 1 | 2 | 3
  doorRotation: 0 | 1 | 2 | 3
  selectedInstanceId: string | null
  onCellChange: (row: number, col: number, type: CellType) => void
  onPlaceFurniture: (f: PlacedFurniture) => void
  onSelectFurniture: (id: string | null) => void
  onMoveFurniture: (id: string, x: number, y: number) => void
  onInteractionStart?: () => void
  blueprintMode?: boolean
}

export default function TopDownCanvas(props: Props) {
  const {
    room, tool, selectedTemplateId, furnitureRotation, doorRotation,
    selectedInstanceId, onCellChange, onPlaceFurniture, onSelectFurniture,
    onMoveFurniture, onInteractionStart, blueprintMode = false
  } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const {
    hoverCell, ghostCell, onMouseDown, onMouseMove, onMouseUp, onMouseLeave
  } = useCanvasInteraction({
    room, tool, selectedTemplateId, furnitureRotation, doorRotation,
    onCellChange, onPlaceFurniture, onSelectFurniture, onMoveFurniture, onInteractionStart
  })

  const canvasWidth = room.width * CELL_SIZE
  const canvasHeight = room.height * CELL_SIZE

  const renderWallEdges = (ctx: CanvasRenderingContext2D, col: number, row: number, type: CellType) => {
    const x = col * CELL_SIZE
    const y = row * CELL_SIZE
    const th = Math.max(4, Math.round(CELL_SIZE * 0.1))
    
    const hasTop = ['wallTop','wallTopRight','wallTopLeft','wallTopBottom','wallTopRightBottom','wallBottomLeftTop','wallLeftTopRight','wallFull'].includes(type)
    const hasRight = ['wallRight','wallTopRight','wallBottomRight','wallLeftRight','wallTopRightBottom','wallRightBottomLeft','wallLeftTopRight','wallFull'].includes(type)
    const hasBottom = ['wallBottom','wallBottomRight','wallBottomLeft','wallTopBottom','wallTopRightBottom','wallRightBottomLeft','wallBottomLeftTop','wallFull'].includes(type) || type === 'wallX'
    const hasLeft = ['wallLeft','wallTopLeft','wallBottomLeft','wallLeftRight','wallRightBottomLeft','wallBottomLeftTop','wallLeftTopRight','wallFull'].includes(type)

    if (hasTop) {
      ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y, CELL_SIZE, th)
      ctx.fillStyle = '#252840'; ctx.fillRect(x, y + th - 2, CELL_SIZE, 2)
    }
    if (hasBottom) {
      ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y + CELL_SIZE - th, CELL_SIZE, th)
      ctx.fillStyle = '#5a6080'; ctx.fillRect(x, y + CELL_SIZE - th, CELL_SIZE, 2)
    }
    if (hasLeft) {
      ctx.fillStyle = '#3d4160'; ctx.fillRect(x, y, th, CELL_SIZE)
      ctx.fillStyle = '#4d5170'; ctx.fillRect(x, y, 2, CELL_SIZE)
    }
    if (hasRight) {
      ctx.fillStyle = '#3d4160'; ctx.fillRect(x + CELL_SIZE - th, y, th, CELL_SIZE)
      ctx.fillStyle = '#5a6080'; ctx.fillRect(x + CELL_SIZE - th, y, 2, CELL_SIZE)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#080912'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw background cells
    for (let r = 0; r < room.height; r++) {
      for (let c = 0; c < room.width; c++) {
        const type = room.cells[r][c]
        if (type === 'floor' || type === 'autoFloor') {
          drawCell(ctx, c, r, type, CELL_SIZE)
        } else if (type.startsWith('wall') || type === 'wallX' || type === 'wallY') {
          drawCell(ctx, c, r, 'floor', CELL_SIZE)
          renderWallEdges(ctx, c, r, type)
        } else {
          drawCell(ctx, c, r, type, CELL_SIZE)
        }
      }
    }

    if (blueprintMode) {
      // Blueprint Mode
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
      // Normal Mode
      for (const pf of room.furniture) {
        const tmpl = getTemplate(pf.templateId)
        if (!tmpl) continue
        const shape = getEffectiveShape(tmpl, pf.rotation, pf.scaleW ?? 1, pf.scaleH ?? 1)
        const isSelected = pf.instanceId === selectedInstanceId
        const effectiveColor = pf.colorOverride ?? tmpl.color
        const effectiveTopColor = pf.colorOverride ? lighten(pf.colorOverride, 0.35) : tmpl.topColor
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

    // Ghosts & Previews
    if (tool === 'furniture' && selectedTemplateId && ghostCell) {
      const tmpl = FURNITURE_TEMPLATES.find(t => t.id === selectedTemplateId)
      if (tmpl) {
        const shape = getEffectiveShape(tmpl, furnitureRotation, 1, 1)
        const valid = canPlaceFurniture(room, tmpl, ghostCell.x, ghostCell.y, furnitureRotation, undefined, 1, 1)

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

    if (tool === 'door' && hoverCell) {
      const doorType = (['door','door90','door180','door270'] as CellType[])[doorRotation]
      ctx.save()
      ctx.globalAlpha = 0.45
      drawCell(ctx, hoverCell.col, hoverCell.row, doorType, CELL_SIZE)
      ctx.globalAlpha = 0.85
      ctx.strokeStyle = '#e8c050'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 2])
      ctx.strokeRect(hoverCell.col * CELL_SIZE + 1, hoverCell.row * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
      ctx.restore()
    }

    if (hoverCell && tool !== 'furniture' && tool !== 'door') {
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.fillRect(hoverCell.col * CELL_SIZE, hoverCell.row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
  }, [room, hoverCell, ghostCell, tool, selectedTemplateId, furnitureRotation, doorRotation, selectedInstanceId, canvasWidth, canvasHeight, blueprintMode])

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        display: 'block',
        cursor: tool === 'furniture' ? 'crosshair' : tool === 'select' ? 'pointer' : tool === 'erase' ? 'cell' : 'crosshair',
        imageRendering: 'pixelated',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  )
}
