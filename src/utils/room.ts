import { RoomState, CellType, FurnitureTemplate, PlacedFurniture } from '../types'
import { getTemplate } from '../data/furniture'

const EDGES = ['Top', 'Right', 'Bottom', 'Left'] as const;
const WALL_BASE = ['wall', 'wallX', 'wallY', 'wallFull'] as const;
const WALL_EDGES = EDGES.map(e => `wall${e}`) as CellType[];
const WALL_MULTI = ['TopRight', 'TopLeft', 'BottomRight', 'BottomLeft', 'TopBottom', 'LeftRight', 
                    'TopRightBottom', 'RightBottomLeft', 'BottomLeftTop', 'LeftTopRight'].map(e => `wall${e}`) as CellType[];
const DOOR_TYPES = ['door', 'door90', 'door180', 'door270'] as CellType[];
const WINDOW_TYPES = ['window', ...EDGES.map(e => `window${e}`)] as CellType[];

export const WALL_TYPES = new Set<CellType>([
  ...WALL_BASE, ...WALL_EDGES, ...WALL_MULTI, ...DOOR_TYPES, ...WINDOW_TYPES
]);

export function detectAutoFloor(cells: CellType[][], width: number, height: number): CellType[][] {
  const reachable: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false))
  const queue: [number, number][] = []
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if ((r === 0 || r === height - 1 || c === 0 || c === width - 1) && !WALL_TYPES.has(cells[r][c])) {
        reachable[r][c] = true
        queue.push([r, c])
      }
    }
  }
  while (queue.length > 0) {
    const [r, c] = queue.shift()!
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= height || nc < 0 || nc >= width || reachable[nr][nc] || WALL_TYPES.has(cells[nr][nc])) continue
      reachable[nr][nc] = true
      queue.push([nr, nc])
    }
  }
  return cells.map((row, r) => row.map((cell, c) => {
    if (WALL_TYPES.has(cell)) return cell
    if (!reachable[r][c]) return cell === 'empty' ? 'autoFloor' : cell
    return cell === 'autoFloor' ? 'empty' : cell
  }))
}

export function rotateShape(shape: boolean[][], rotation: 0 | 1 | 2 | 3): boolean[][] {
  let result = shape
  for (let i = 0; i < rotation; i++) {
    const rows = result.length
    const cols = result[0].length
    const rotated: boolean[][] = Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => false)
    )
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = result[r][c]
      }
    }
    result = rotated
  }
  return result
}

/** shape の各セルを scaleW×scaleH のブロックに拡大する */
export function expandShape(shape: boolean[][], scaleW: number, scaleH: number): boolean[][] {
  if (scaleW === 1 && scaleH === 1) return shape
  const result: boolean[][] = []
  for (let r = 0; r < shape.length; r++) {
    for (let sh = 0; sh < scaleH; sh++) {
      const newRow: boolean[] = []
      for (let c = 0; c < shape[r].length; c++) {
        for (let sw = 0; sw < scaleW; sw++) {
          newRow.push(shape[r][c])
        }
      }
      result.push(newRow)
    }
  }
  return result
}

/** 配置前の shape を取得 (rotate → expand) */
export function getEffectiveShape(
  tmpl: FurnitureTemplate,
  rotation: 0 | 1 | 2 | 3,
  scaleW: number,
  scaleH: number
): boolean[][] {
  return expandShape(rotateShape(tmpl.shape, rotation), scaleW, scaleH)
}

export function canPlaceFurniture(
  room: RoomState,
  template: FurnitureTemplate,
  x: number,
  y: number,
  rotation: 0 | 1 | 2 | 3,
  excludeInstanceId?: string,
  scaleW = 1,
  scaleH = 1
): boolean {
  const shape = getEffectiveShape(template, rotation, scaleW, scaleH)
  const shapeRows = shape.length
  const shapeCols = shape[0]?.length ?? 0

  const occupiedSet = new Set<string>()
  for (const pf of room.furniture) {
    if (pf.instanceId === excludeInstanceId) continue
    const tmpl = getTemplate(pf.templateId)
    if (!tmpl) continue
    const pfShape = getEffectiveShape(tmpl, pf.rotation, pf.scaleW ?? 1, pf.scaleH ?? 1)
    for (let r = 0; r < pfShape.length; r++) {
      for (let c = 0; c < pfShape[r].length; c++) {
        if (pfShape[r][c]) occupiedSet.add(`${pf.y + r},${pf.x + c}`)
      }
    }
  }

  for (let r = 0; r < shapeRows; r++) {
    for (let c = 0; c < shapeCols; c++) {
      if (!shape[r][c]) continue
      const row = y + r
      const col = x + c
      if (row < 0 || row >= room.height || col < 0 || col >= room.width) return false
      if (room.cells[row][col] !== 'floor' && room.cells[row][col] !== 'autoFloor') return false
      if (occupiedSet.has(`${row},${col}`)) return false
    }
  }
  return true
}

export function createInitialRoom(width: number, height: number): RoomState {
  const cells: CellType[][] = []
  for (let r = 0; r < height; r++) {
    const row: CellType[] = []
    for (let c = 0; c < width; c++) {
      row.push('floor')
    }
    cells.push(row)
  }
  return { width, height, wallHeight: 3, wallColor: '#2d3050', windowStyle: 'basic', doorStyle: 'basic', cells, furniture: [] }
}
