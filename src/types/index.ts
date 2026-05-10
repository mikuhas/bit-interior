export type BitUnit = 'cm' | 'mm' | 'inch'

export interface BitSettings {
  size: number
  unit: BitUnit
}

export type CellType = 'empty' | 'floor' | 'autoFloor' | 'wall' | 'wallX' | 'wallY' 
  | 'wallTop' | 'wallRight' | 'wallBottom' | 'wallLeft' 
  | 'wallTopRight' | 'wallTopLeft' | 'wallBottomRight' | 'wallBottomLeft'
  | 'wallTopBottom' | 'wallLeftRight' // 2-edge parallel
  | 'wallTopRightBottom' | 'wallRightBottomLeft' | 'wallBottomLeftTop' | 'wallLeftTopRight' // 3-edge
  | 'wallFull' // 4-edge
  | 'door' | 'door90' | 'door180' | 'door270' 
  | 'doorM' | 'door90M' | 'door180M' | 'door270M' 
  | 'window' | 'windowTop' | 'windowRight' | 'windowBottom' | 'windowLeft'

// 'furniture' は家具配置モード(テンプレートを選んでキャンバス上で配置)
export type EditTool = 'floor' | 'wallX' | 'wallY' 
  | 'wallTop' | 'wallRight' | 'wallBottom' | 'wallLeft' 
  | 'wallTopRight' | 'wallTopLeft' | 'wallBottomRight' | 'wallBottomLeft'
  | 'wallTopBottom' | 'wallLeftRight'
  | 'wallTopRightBottom' | 'wallRightBottomLeft' | 'wallBottomLeftTop' | 'wallLeftTopRight'
  | 'wallFull'
  | 'door' | 'window' | 'windowTop' | 'windowRight' | 'windowBottom' | 'windowLeft' | 'erase' | 'select' | 'furniture'

export type ViewMode = 'topdown' | 'isometric' | 'blueprint'

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
  mirrored: boolean
  scaleW: number  // width multiplier (integer ≥1)
  scaleH: number  // depth multiplier (integer ≥1)
  colorOverride?: string  // hex color, overrides template color
}

import { WindowStyle, DoorStyle } from './styles'

// ...

export interface RoomState {
  width: number
  height: number
  wallHeight: number
  doorHeight: number
  wallColor: string
  windowStyle: WindowStyle
  doorStyle: DoorStyle
  cells: CellType[][]
  furniture: PlacedFurniture[]
}
