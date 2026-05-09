import { FurnitureDrawer } from './types'
import { drawBed } from './bed'
import { drawSofa } from './sofa'
import { drawDesk, drawTable } from './table'
import { drawChair, drawArmchair } from './chair'
import { drawFridge, drawKitchen, drawChest } from './appliances'
import { drawBookshelf, drawDresser, drawTvStand, drawPlant } from './misc'
import { drawBathtub, drawToilet } from './sanitary'

export const FURNITURE_DRAWERS: Record<string, FurnitureDrawer> = {
  'bed-s': drawBed(false),
  'bed-d': drawBed(true),
  'sofa': drawSofa,
  'desk': drawDesk,
  'dining-table': drawTable,
  'coffee-table': drawTable,
  'chair': drawChair,
  'armchair': drawArmchair,
  'fridge': drawFridge,
  'kitchen': drawKitchen,
  'chest': drawChest,
  'bookshelf': drawBookshelf,
  'dresser': drawDresser,
  'tv-stand': drawTvStand,
  'plant': drawPlant,
  'bathtub': drawBathtub,
  'toilet': drawToilet,
}

export * from './types'
