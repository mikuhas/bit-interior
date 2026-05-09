import { useRef, useState, useCallback } from 'react'
import { RoomState, CellType, EditTool, PlacedFurniture } from '../types'
import { FURNITURE_TEMPLATES, getTemplate } from '../data/furniture'
import { canPlaceFurniture } from '../utils/room'

const CELL_SIZE = 40

interface Options {
  room: RoomState
  tool: EditTool
  selectedTemplateId: string | null
  furnitureRotation: 0 | 1 | 2 | 3
  doorRotation: 0 | 1 | 2 | 3
  onCellChange: (row: number, col: number, type: CellType) => void
  onPlaceFurniture: (f: PlacedFurniture) => void
  onSelectFurniture: (id: string | null) => void
  onMoveFurniture: (id: string, x: number, y: number) => void
  onInteractionStart?: () => void
}

export function useCanvasInteraction({
  room,
  tool,
  selectedTemplateId,
  furnitureRotation,
  doorRotation,
  onCellChange,
  onPlaceFurniture,
  onSelectFurniture,
  onMoveFurniture,
  onInteractionStart,
}: Options) {
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null)
  const [ghostCell, setGhostCell] = useState<{ x: number; y: number } | null>(null)
  const mouseDownRef = useRef(false)
  const paintTypeRef = useRef<CellType>('floor')
  const draggingRef = useRef<{ instanceId: string; offsetX: number; offsetY: number } | null>(null)

  const getCellFromEvent = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
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
      // Note: We use the effective shape logic here if needed, but for selection simple bounding box or cell map is usually enough.
      // Reusing the logic from TopDownCanvas.
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

    const wallTypes = [
        'floor', 'wallX', 'wallY', 'wallTop', 'wallRight', 'wallBottom', 'wallLeft',
        'wallTopRight', 'wallTopLeft', 'wallBottomRight', 'wallBottomLeft', 'door', 'window', 
        'windowTop', 'windowRight', 'windowBottom', 'windowLeft', 'erase'
      ]

    if (wallTypes.includes(tool)) {
      mouseDownRef.current = true
      const newType: CellType =
        tool === 'floor' ? 'floor'
        : tool === 'wallX' ? 'wallX'
        : tool === 'wallY' ? 'wallY'
        : tool === 'wallTop' ? 'wallTop'
        : tool === 'wallRight' ? 'wallRight'
        : tool === 'wallBottom' ? 'wallBottom'
        : tool === 'wallLeft' ? 'wallLeft'
        : tool === 'wallTopRight' ? 'wallTopRight'
        : tool === 'wallTopLeft' ? 'wallTopLeft'
        : tool === 'wallBottomRight' ? 'wallBottomRight'
        : tool === 'wallBottomLeft' ? 'wallBottomLeft'
        : tool === 'door' ? (['door', 'door90', 'door180', 'door270'] as CellType[])[doorRotation]
        : tool === 'window' ? 'window'
        : tool === 'windowTop' ? 'windowTop'
        : tool === 'windowRight' ? 'windowRight'
        : tool === 'windowBottom' ? 'windowBottom'
        : tool === 'windowLeft' ? 'windowLeft'
        : 'empty'
      paintTypeRef.current = newType
      onCellChange(row, col, newType) // クリック時の設置を有効化
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
        draggingRef.current = {
          instanceId: pf.instanceId,
          offsetX: col - pf.x,
          offsetY: row - pf.y,
        }
      } else {
        onSelectFurniture(null)
      }
    }
  }, [tool, selectedTemplateId, ghostCell, room, furnitureRotation, doorRotation, onCellChange, onPlaceFurniture, onSelectFurniture, getFurnitureAt, onInteractionStart, getCellFromEvent])

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

    const wallTypes = [
      'floor', 'wallX', 'wallY', 'wallTop', 'wallRight', 'wallBottom', 'wallLeft',
      'wallTopRight', 'wallTopLeft', 'wallBottomRight', 'wallBottomLeft', 'door', 'window', 
      'windowTop', 'windowRight', 'windowBottom', 'windowLeft', 'erase'
    ]

    if (wallTypes.includes(tool) && mouseDownRef.current) {
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

  return {
    hoverCell,
    ghostCell,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  }
}

// Internal helper needed by getFurnitureAt
import { getEffectiveShape } from '../utils/room'
