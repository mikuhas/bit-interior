import { useRef, useState, useCallback } from 'react'
import { RoomState, CellType, EditTool, PlacedFurniture } from '../../types'
import { FURNITURE_TEMPLATES, getTemplate } from '../../data/furniture'
import { canPlaceFurniture, getEffectiveShape } from '../../utils/room'

const CELL_SIZE = 40

interface Options {
  room: RoomState
  tool: EditTool
  selectedTemplateId: string | null
  furnitureRotation: 0 | 1 | 2 | 3
  furnitureMirrored: boolean
  doorRotation: 0 | 1 | 2 | 3
  doorMirrored: boolean
  onCellChange: (row: number, col: number, type: CellType) => void
  onPlaceFurniture: (f: PlacedFurniture) => void
  onSelectFurniture: (id: string | null) => void
  onMoveFurniture: (id: string, x: number, y: number) => void
  onRotateCell?: (row: number, col: number) => void
  onInteractionStart?: () => void
}

export function useCanvasInteraction({
  room,
  tool,
  selectedTemplateId,
  furnitureRotation,
  furnitureMirrored,
  doorRotation,
  doorMirrored,
  onCellChange,
  onPlaceFurniture,
  onSelectFurniture,
  onMoveFurniture,
  onRotateCell,
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
      const shape = getEffectiveShape(tmpl, pf.rotation, pf.mirrored ?? false, pf.scaleW ?? 1, pf.scaleH ?? 1)
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

    if (e.shiftKey && onRotateCell) {
        onRotateCell(row, col)
        return
    }

    const EDGES = ['Top', 'Right', 'Bottom', 'Left'] as const;
    const WALL_BASE = ['wall', 'wallX', 'wallY', 'wallFull'] as const;
    const WALL_EDGES = EDGES.map(e => `wall${e}`);
    const WALL_MULTI = ['TopRight', 'TopLeft', 'BottomRight', 'BottomLeft', 'TopBottom', 'LeftRight', 
                        'TopRightBottom', 'RightBottomLeft', 'BottomLeftTop', 'LeftTopRight'].map(e => `wall${e}`);
    const DOOR_TYPES = ['door', 'door90', 'door180', 'door270'];
    const WINDOW_TYPES = ['window', ...EDGES.map(e => `window${e}`)];

    const wallTypes = [
      ...WALL_BASE, ...WALL_EDGES, ...WALL_MULTI, ...DOOR_TYPES, ...WINDOW_TYPES, 'erase'
    ] as string[]

    if (wallTypes.includes(tool)) {
      mouseDownRef.current = true
      let newType: CellType = 
        tool === 'door' ? (['door', 'door90', 'door180', 'door270'] as CellType[])[doorRotation]
        : (tool as CellType)
      
      if (doorMirrored && newType.startsWith('door')) {
        newType = (newType + 'M') as CellType
      }
      
      paintTypeRef.current = newType
      onCellChange(row, col, newType)
    } else if (tool === 'furniture' && selectedTemplateId && ghostCell) {
      const tmpl = FURNITURE_TEMPLATES.find(t => t.id === selectedTemplateId)
      if (tmpl) {
        const valid = canPlaceFurniture(room, tmpl, ghostCell.x, ghostCell.y, furnitureRotation, furnitureMirrored)
        if (valid) {
          onPlaceFurniture({
            instanceId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            templateId: selectedTemplateId,
            x: ghostCell.x,
            y: ghostCell.y,
            z: 0,
            rotation: furnitureRotation,
            mirrored: furnitureMirrored,
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
  }, [tool, selectedTemplateId, ghostCell, room, furnitureRotation, furnitureMirrored, doorRotation, doorMirrored, onCellChange, onPlaceFurniture, onSelectFurniture, getFurnitureAt, onInteractionStart, getCellFromEvent])

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
          const valid = canPlaceFurniture(room, tmpl, newX, newY, pf.rotation, pf.mirrored ?? false, instanceId, pf.scaleW ?? 1, pf.scaleH ?? 1)
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
