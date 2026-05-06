export type BitUnit = 'cm' | 'mm' | 'inch'

export interface BitSettings {
  size: number
  unit: BitUnit
}

export type CellType = 'empty' | 'floor' | 'wall'

// 'furniture' は家具配置モード(テンプレートを選んでキャンバス上で配置)
export type EditTool = 'floor' | 'wall' | 'erase' | 'select' | 'furniture'

export type ViewMode = 'topdown' | 'isometric'

export interface FurnitureTemplate {
  id: string
  nameJa: string
  emoji: string
  shape: boolean[][]  // [row][col], true = occupied
  color: string
  topColor: string
  sideColor: string
  height: number  // unit bits (for isometric height)
}

export interface PlacedFurniture {
  instanceId: string
  templateId: string
  x: number   // col in grid
  y: number   // row in grid
  z: number   // height above floor in bits (0 = on floor)
  rotation: 0 | 1 | 2 | 3  // 0=0°, 1=90°, 2=180°, 3=270°
  scaleW: number  // width multiplier (integer ≥1)
  scaleH: number  // depth multiplier (integer ≥1)
  colorOverride?: string  // hex color, overrides template color
}

export interface RoomState {
  width: number
  height: number
  wallHeight: number   // bits, default 3
  wallColor: string    // hex, default '#2d3050'
  cells: CellType[][]  // [row][col]
  furniture: PlacedFurniture[]
}
