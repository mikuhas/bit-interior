import { useRef, useEffect } from 'react'
import { RoomState } from '../types'
import { getTemplate } from '../data/furniture'
import { rotateShape, expandShape } from '../utils/room'

const TILE_W = 64
const TILE_H = 32
const Z_PX = 14

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return '#' + c(r) + c(g) + c(b)
}
function shade(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * factor, g * factor, b * factor)
}
function mix(hex1: string, hex2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hex1)
  const [r2, g2, b2] = hexToRgb(hex2)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

function isoUV(x: number, y: number, h: number, u: number, v: number): [number, number] {
  return [x + (u - v) * (TILE_W / 2), y - h + (u + v) * (TILE_H / 2)]
}
function isoRect(
  ctx: CanvasRenderingContext2D, x: number, y: number, h: number,
  u0: number, v0: number, u1: number, v1: number, fill: string, stroke?: string
) {
  ctx.beginPath()
  const [ax, ay] = isoUV(x, y, h, u0, v0)
  const [bx, by] = isoUV(x, y, h, u1, v0)
  const [cx2, cy2] = isoUV(x, y, h, u1, v1)
  const [dx, dy] = isoUV(x, y, h, u0, v1)
  ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.lineTo(dx, dy)
  ctx.closePath()
  ctx.fillStyle = fill; ctx.fill()
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.5; ctx.stroke() }
}

interface Props { room: RoomState; darkMode?: boolean }

type CellInfo = {
  color: string; topColor: string; height: number; z: number
  templateId: string; instanceId: string
  localRow: number; localCol: number; shapeRows: number; shapeCols: number
}

// アイソメトリック面に等幅の線を引くヘルパー
function isoLine(
  ctx: CanvasRenderingContext2D, x: number, y: number, h: number,
  u0: number, v0: number, u1: number, v1: number, color: string, lw = 1
) {
  const [ax, ay] = isoUV(x, y, h, u0, v0)
  const [bx, by] = isoUV(x, y, h, u1, v1)
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke()
}

// 側面(left=SW / right=SE)にストライプ線を引く
function sideLine(
  ctx: CanvasRenderingContext2D, x: number, y: number, cubeH: number,
  tU: number, side: 'left' | 'right', color: string, lw = 0.8
) {
  ctx.beginPath()
  if (side === 'left') {
    ctx.moveTo(x - TILE_W / 2, y + TILE_H / 2 + cubeH * tU)
    ctx.lineTo(x, y + TILE_H + cubeH * tU)
  } else {
    ctx.moveTo(x + TILE_W / 2, y + TILE_H / 2 + cubeH * tU)
    ctx.lineTo(x, y + TILE_H + cubeH * tU)
  }
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke()
}

function drawDecoration(ctx: CanvasRenderingContext2D, fc: CellInfo, x: number, y: number, cubeH: number) {
  const { templateId, localRow, localCol, shapeCols, shapeRows, color, topColor } = fc

  ctx.save()

  switch (templateId) {

    case 'bed-s': case 'bed-d': {
      // フレーム (濃い木色ボーダー)
      const frame = shade(color, 0.55)
      isoRect(ctx, x, y, cubeH, 0, 0, 1, 0.1, frame)  // head end
      isoRect(ctx, x, y, cubeH, 0, 0.9, 1, 1, frame)  // foot end
      isoRect(ctx, x, y, cubeH, 0, 0, 0.1, 1, frame)  // left rail
      isoRect(ctx, x, y, cubeH, 0.9, 0, 1, 1, frame)  // right rail
      // マットレス (クリーム布地)
      const mattress = mix(color, '#f0e8d0', 0.72)
      isoRect(ctx, x, y, cubeH, 0.1, 0.1, 0.9, 0.9, mattress)
      // マットレス縫い目
      isoLine(ctx, x, y, cubeH, 0.1, 0.37, 0.9, 0.37, shade(mattress, 0.82), 0.7)
      isoLine(ctx, x, y, cubeH, 0.1, 0.63, 0.9, 0.63, shade(mattress, 0.82), 0.7)
      // 枕 (headboard側)
      if (localRow === 0) {
        const pillow = mix(mattress, '#fff', 0.4)
        isoRect(ctx, x, y, cubeH, 0.15, 0.12, 0.85, 0.38, pillow, shade(pillow, 0.78))
        // 枕の縫い目
        isoLine(ctx, x, y, cubeH, 0.5, 0.13, 0.5, 0.37, shade(pillow, 0.7), 0.5)
      }
      // ヘッドボード (フレーム先頭セルの側面を濃く)
      if (localRow === 0) {
        sideLine(ctx, x, y, cubeH, 0, 'left', shade(frame, 0.7), 2)
        sideLine(ctx, x, y, cubeH, 0, 'right', shade(frame, 0.85), 2)
      }
      break
    }

    case 'sofa': {
      const fabric = mix(topColor, color, 0.4)
      const dark = shade(color, 0.45)
      // 座面クッション
      isoRect(ctx, x, y, cubeH, 0.08, 0.35, 0.92, 0.95, fabric, shade(fabric, 0.78))
      // クッション間仕切り
      if (shapeCols > 1 && localCol < shapeCols - 1)
        isoLine(ctx, x, y, cubeH, 1, 0.35, 1, 0.95, dark, 1.5)
      // 背もたれ (後列)
      if (localRow === 0) {
        isoRect(ctx, x, y, cubeH, 0.06, 0.05, 0.94, 0.32, shade(color, 0.58))
        // 背もたれ丸み表現: 上辺に明るいハイライト線
        isoLine(ctx, x, y, cubeH, 0.06, 0.05, 0.94, 0.05, mix(topColor,'#fff',0.3), 1.5)
      }
      // 肘置き (左右端 = 最左列・最右列)
      if (localCol === 0) {
        isoRect(ctx, x, y, cubeH, 0, 0.05, 0.07, 0.95, shade(color, 0.62))
        isoLine(ctx, x, y, cubeH, 0, 0.05, 0, 0.95, mix(topColor,'#fff',0.25), 1.2)
      }
      if (localCol === shapeCols - 1) {
        isoRect(ctx, x, y, cubeH, 0.93, 0.05, 1, 0.95, shade(color, 0.62))
        isoLine(ctx, x, y, cubeH, 1, 0.05, 1, 0.95, mix(topColor,'#fff',0.25), 1.2)
      }
      break
    }

    case 'desk': {
      // 脚 (4隅に細い柱)
      const legC = shade(color, 0.42)
      const legW = 0.09
      isoRect(ctx, x, y, cubeH, 0,        0,        legW,      legW,      legC)
      isoRect(ctx, x, y, cubeH, 1-legW,   0,        1,         legW,      legC)
      isoRect(ctx, x, y, cubeH, 0,        1-legW,   legW,      1,         legC)
      isoRect(ctx, x, y, cubeH, 1-legW,   1-legW,   1,         1,         legC)
      // 天板 (脚の上に薄い板)
      const top = shade(topColor, 1.1)
      isoRect(ctx, x, y, cubeH, 0, 0, 1, 1, top + '99')
      // 天板厚みライン (前辺に濃い線)
      isoLine(ctx, x, y, cubeH, 0, 1, 1, 1, shade(color, 0.38), 2)
      // 木目ライン
      const grain = mix(topColor, '#fff', 0.18)
      for (let i = 1; i < 3; i++)
        isoLine(ctx, x, y, cubeH, i*0.3+0.08, 0.06, i*0.3+0.14, 0.94, grain, 0.6)
      break
    }

    case 'chair': {
      // 脚 (4隅)
      const legC = shade(color, 0.40)
      const lw2 = 0.12
      isoRect(ctx, x, y, cubeH, 0,      0,      lw2,    lw2,    legC)
      isoRect(ctx, x, y, cubeH, 1-lw2,  0,      1,      lw2,    legC)
      isoRect(ctx, x, y, cubeH, 0,      1-lw2,  lw2,    1,      legC)
      isoRect(ctx, x, y, cubeH, 1-lw2,  1-lw2,  1,      1,      legC)
      // 座面パッド
      const pad = mix(topColor, color, 0.3)
      isoRect(ctx, x, y, cubeH, lw2, lw2+0.1, 1-lw2, 1-lw2, pad, shade(pad, 0.75))
      // 座面縁取り
      isoLine(ctx, x, y, cubeH, lw2, lw2+0.1, 1-lw2, lw2+0.1, mix(pad,'#fff',0.3), 1)
      // 背もたれ (先頭セル)
      if (localRow === 0) {
        isoRect(ctx, x, y, cubeH, 0.1, 0.05, 0.9, 0.28, shade(color, 0.55))
        isoLine(ctx, x, y, cubeH, 0.1, 0.05, 0.9, 0.05, mix(topColor,'#fff',0.25), 1.2)
      }
      break
    }

    case 'bookshelf': {
      const BC = ['#c83030','#3070c8','#30a040','#c08020','#8030b0','#30a898']
      // 本 (3冊×セル)
      for (let b = 0; b < 3; b++) {
        const bc = BC[(localCol * 3 + b) % BC.length]
        isoRect(ctx, x, y, cubeH, b/3+0.04, 0.08, (b+1)/3-0.04, 0.92, bc, shade(bc, 0.65))
        // 本の背表紙光沢
        isoLine(ctx, x, y, cubeH, b/3+0.06, 0.1, b/3+0.1, 0.9, mix(bc,'#fff',0.22), 0.7)
      }
      // 棚板 (1/3, 2/3 の水平断面)
      const shelf = shade(color, 1.3)
      for (let s = 1; s < 3; s++) {
        const t = s / 3
        // 棚板: 上面ライン (左面・右面に水平線)
        sideLine(ctx, x, y, cubeH, t, 'left',  shelf, 1.2)
        sideLine(ctx, x, y, cubeH, t, 'right', shelf, 1.2)
      }
      // 背板
      isoRect(ctx, x, y, cubeH, 0, 0, 1, 1, shade(color, 0.3) + '50')
      break
    }

    case 'dresser': {
      // 引き出し分割線 (上半/下半)
      const divC = shade(color, 0.38)
      sideLine(ctx, x, y, cubeH, 0.5, 'left',  divC, 1)
      sideLine(ctx, x, y, cubeH, 0.5, 'right', divC, 1)
      // 扉パネル (上面に2段の引き出し)
      const panel = shade(topColor, 0.9)
      isoRect(ctx, x, y, cubeH, 0.08, 0.08, 0.92, 0.48, panel, shade(panel, 0.72))
      isoRect(ctx, x, y, cubeH, 0.08, 0.52, 0.92, 0.92, panel, shade(panel, 0.72))
      // 取っ手 (上下パネル中央)
      for (const v of [0.28, 0.72]) {
        const [hx, hy] = isoUV(x, y, cubeH, 0.5, v)
        ctx.beginPath(); ctx.arc(hx, hy, 2.5, 0, Math.PI*2)
        ctx.fillStyle = '#d4b020'; ctx.fill()
        ctx.strokeStyle = shade('#d4b020', 0.6); ctx.lineWidth = 0.5; ctx.stroke()
      }
      break
    }

    case 'coffee-table': {
      // ガラス天板
      isoRect(ctx, x, y, cubeH, 0.06, 0.06, 0.94, 0.94, 'rgba(180,220,255,0.22)', 'rgba(160,200,240,0.6)')
      // 光沢
      isoRect(ctx, x, y, cubeH, 0.08, 0.08, 0.42, 0.38, 'rgba(255,255,255,0.12)')
      // 脚
      const legC = shade(color, 0.45)
      const lw3 = 0.1
      isoRect(ctx, x, y, cubeH, 0,      0,      lw3,    lw3,    legC)
      isoRect(ctx, x, y, cubeH, 1-lw3,  0,      1,      lw3,    legC)
      isoRect(ctx, x, y, cubeH, 0,      1-lw3,  lw3,    1,      legC)
      isoRect(ctx, x, y, cubeH, 1-lw3,  1-lw3,  1,      1,      legC)
      break
    }

    case 'dining-table': {
      // 天板 (木目)
      const top2 = mix(topColor, '#fff', 0.12)
      isoRect(ctx, x, y, cubeH, 0.04, 0.04, 0.96, 0.96, top2 + 'cc')
      // 木目ライン
      const grain2 = mix(topColor, '#fff', 0.22)
      for (let i = 0; i < 3; i++)
        isoLine(ctx, x, y, cubeH, 0.15+i*0.28, 0.06, 0.2+i*0.28, 0.94, grain2, 0.6)
      // 天板厚みライン
      isoLine(ctx, x, y, cubeH, 0.04, 0.96, 0.96, 0.96, shade(color, 0.4), 1.5)
      break
    }

    case 'tv-stand': {
      // TV画面 (青黒)
      isoRect(ctx, x, y, cubeH, 0.06, 0.06, 0.94, 0.94, '#06060f')
      // 画面発光
      isoRect(ctx, x, y, cubeH, 0.08, 0.08, 0.92, 0.92, 'rgba(30,60,140,0.35)')
      // 光沢
      isoRect(ctx, x, y, cubeH, 0.08, 0.08, 0.40, 0.38, 'rgba(100,150,255,0.12)')
      // ベゼル枠
      isoLine(ctx, x, y, cubeH, 0.06, 0.06, 0.94, 0.06, '#1a1a40', 1)
      isoLine(ctx, x, y, cubeH, 0.06, 0.94, 0.94, 0.94, '#1a1a40', 1)
      break
    }

    case 'plant': {
      const [cx2, cy2] = isoUV(x, y, cubeH, 0.5, 0.5)
      // 鉢 (楕円)
      ctx.beginPath(); ctx.ellipse(cx2, cy2+4, 10, 5, 0, 0, Math.PI*2)
      ctx.fillStyle = mix(color, '#7a4820', 0.65); ctx.fill()
      ctx.strokeStyle = shade('#7a4820', 0.55); ctx.lineWidth = 0.8; ctx.stroke()
      // 葉クラスター
      const LC = ['#228814','#33a820','#44b830','#186808','#2a9018']
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        const lx2 = cx2 + Math.cos(a) * 11; const ly2 = cy2 + Math.sin(a) * 6 - 5
        ctx.beginPath(); ctx.ellipse(lx2, ly2, 8, 5, a, 0, Math.PI * 2)
        ctx.fillStyle = LC[i % LC.length]; ctx.fill()
      }
      // 中央葉
      ctx.beginPath(); ctx.arc(cx2, cy2-5, 5, 0, Math.PI*2)
      ctx.fillStyle = LC[0]; ctx.fill()
      break
    }

    case 'bathtub': {
      // 外縁 (白磁)
      const porcelain = mix(topColor, '#fff', 0.45)
      isoRect(ctx, x, y, cubeH, 0.06, 0.06, 0.94, 0.94, shade(porcelain, 0.88), shade(porcelain, 0.65))
      // 内側 (水色)
      isoRect(ctx, x, y, cubeH, 0.15, 0.15, 0.85, 0.85, mix(color, '#5ab0d0', 0.6))
      // 水面光沢
      isoRect(ctx, x, y, cubeH, 0.17, 0.17, 0.48, 0.42, 'rgba(255,255,255,0.18)')
      // 蛇口 (head端)
      if (localRow === 0) {
        const [fx, fy] = isoUV(x, y, cubeH, 0.5, 0.1)
        ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI*2)
        ctx.fillStyle = '#c0c0d0'; ctx.fill()
      }
      break
    }

    case 'toilet': {
      const porcelain2 = mix(topColor, '#fff', 0.42)
      // タンク (head側)
      if (localRow === 0) {
        isoRect(ctx, x, y, cubeH, 0.12, 0.06, 0.88, 0.44, porcelain2, shade(porcelain2, 0.7))
        // タンク上蓋ライン
        isoLine(ctx, x, y, cubeH, 0.12, 0.06, 0.88, 0.06, mix(porcelain2,'#fff',0.3), 1)
      }
      // 便座 (楕円)
      const [tcx, tcy] = isoUV(x, y, cubeH, 0.5, 0.62)
      ctx.beginPath(); ctx.ellipse(tcx, tcy, 14, 8, 0, 0, Math.PI*2)
      ctx.fillStyle = porcelain2; ctx.fill()
      ctx.strokeStyle = shade(porcelain2, 0.68); ctx.lineWidth = 1; ctx.stroke()
      // 穴
      ctx.beginPath(); ctx.ellipse(tcx, tcy+1, 8, 4.5, 0, 0, Math.PI*2)
      ctx.fillStyle = shade(topColor, 0.38); ctx.fill()
      break
    }
  }

  ctx.restore()
}

export default function IsometricCanvas({ room, darkMode = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wallH = (room.wallHeight ?? 3) * Z_PX
  const totalCells = room.width + room.height
  const canvasW = totalCells * TILE_W / 2 + TILE_W
  const canvasH = totalCells * TILE_H / 2 + wallH * 4 + TILE_H + 120

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const wallColor = room.wallColor ?? '#2d3050'
    const offsetX = room.height * TILE_W / 2 + TILE_W / 2
    const offsetY = wallH * 2 + TILE_H + 60

    // 整数化して sub-pixel ずれを排除 → 接地面ピクセル完全一致
    const toScreen = (col: number, row: number) => ({
      x: Math.round(offsetX + (col - row) * TILE_W / 2),
      y: Math.round(offsetY + (col + row) * TILE_H / 2),
    })

    // Background
    ctx.fillStyle = darkMode ? '#080912' : '#dce8f4'
    ctx.fillRect(0, 0, canvasW, canvasH)

    // 家具セルマップ構築
    type CellEntry = CellInfo & { screenZOff: number }
    const furnitureCellMap = new Map<string, CellEntry>()

    for (const pf of room.furniture) {
      const tmpl = getTemplate(pf.templateId)
      if (!tmpl) continue
      const sw = pf.scaleW ?? 1
      const sh = pf.scaleH ?? 1
      const z = Math.max(0, pf.z ?? 0)   // Rule 1: Z >= 0 を強制
      const rotated = rotateShape(tmpl.shape, pf.rotation)
      const shape = expandShape(rotated, sw, sh)
      const shapeRows = shape.length
      const shapeCols = shape[0]?.length ?? 1
      const effectiveColor = pf.colorOverride ?? tmpl.color
      const effectiveTopColor = pf.colorOverride ? shade(pf.colorOverride, 1.4) : tmpl.topColor

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue
          const gr = pf.y + r; const gc = pf.x + c
          // Rule 1: 境界外・壁セルをスキップ
          if (gr < 0 || gr >= room.height || gc < 0 || gc >= room.width) continue
          if (room.cells[gr][gc] !== 'floor') continue
          furnitureCellMap.set(`${gr},${gc}`, {
            color: effectiveColor,
            topColor: effectiveTopColor,
            height: tmpl.height,
            z,
            templateId: tmpl.id,
            instanceId: pf.instanceId,
            localRow: r,
            localCol: c,
            shapeRows,
            shapeCols,
            screenZOff: z * Z_PX,
          })
        }
      }
    }

    // Rule 2: depth sort — 奥(row+col小)から手前、同深度は floor→furniture→wall 順
    const allCells: Array<{ row: number; col: number }> = []
    for (let r = 0; r < room.height; r++)
      for (let c = 0; c < room.width; c++)
        allCells.push({ row: r, col: c })

    allCells.sort((a, b) => {
      const depthA = a.row + a.col
      const depthB = b.row + b.col
      if (depthA !== depthB) return depthA - depthB
      // 同深度: wall は floor+furniture より後（壁が手前オブジェクトを遮蔽）
      const wallA = room.cells[a.row][a.col] === 'wall' ? 1 : 0
      const wallB = room.cells[b.row][b.col] === 'wall' ? 1 : 0
      if (wallA !== wallB) return wallA - wallB
      return a.col - b.col
    })

    // Floor tile
    const drawFloorTile = (col: number, row: number) => {
      const { x, y } = toScreen(col, row)
      ctx.beginPath()
      ctx.moveTo(x, y); ctx.lineTo(x+TILE_W/2, y+TILE_H/2); ctx.lineTo(x, y+TILE_H); ctx.lineTo(x-TILE_W/2, y+TILE_H/2)
      ctx.closePath()
      ctx.fillStyle = darkMode ? '#1e3055' : '#8898b8'
      ctx.fill()
      ctx.strokeStyle = darkMode ? '#0d1535' : '#6070a0'
      ctx.lineWidth = 1; ctx.stroke()
    }

    // Wall cube using wallColor
    const drawWallCube = (col: number, row: number) => {
      const { x, y } = toScreen(col, row)
      const h = wallH
      const wLeft  = shade(wallColor, 0.82)
      const wRight = wallColor
      const wTop   = shade(wallColor, 1.55)
      const wStroke = shade(wallColor, 0.50)
      // left
      ctx.beginPath()
      ctx.moveTo(x-TILE_W/2,y+TILE_H/2); ctx.lineTo(x,y+TILE_H); ctx.lineTo(x,y+TILE_H+h); ctx.lineTo(x-TILE_W/2,y+TILE_H/2+h)
      ctx.closePath(); ctx.fillStyle=wLeft; ctx.fill(); ctx.strokeStyle=wStroke; ctx.lineWidth=1; ctx.stroke()
      // right
      ctx.beginPath()
      ctx.moveTo(x+TILE_W/2,y+TILE_H/2); ctx.lineTo(x,y+TILE_H); ctx.lineTo(x,y+TILE_H+h); ctx.lineTo(x+TILE_W/2,y+TILE_H/2+h)
      ctx.closePath(); ctx.fillStyle=wRight; ctx.fill(); ctx.strokeStyle=wStroke; ctx.lineWidth=1; ctx.stroke()
      // top
      ctx.beginPath()
      ctx.moveTo(x,y-h); ctx.lineTo(x+TILE_W/2,y+TILE_H/2-h); ctx.lineTo(x,y+TILE_H-h); ctx.lineTo(x-TILE_W/2,y+TILE_H/2-h)
      ctx.closePath(); ctx.fillStyle=wTop; ctx.fill(); ctx.strokeStyle=shade(wallColor, 1.8); ctx.lineWidth=1; ctx.stroke()
    }

    const isSameInstance = (row: number, col: number, instanceId: string): boolean =>
      furnitureCellMap.get(`${row},${col}`)?.instanceId === instanceId

    const drawFurnitureCube = (col: number, row: number, fc: CellEntry) => {
      const { x, y } = toScreen(col, row)
      const cubeH = fc.height * 18   // 18px/bit → 立体感向上
      const zOff = fc.screenZOff

      const baseY = y - zOff

      // top=最明, right=中間, left=最暗
      const topFace   = shade(fc.color, 1.60)
      const leftFace  = shade(fc.color, 0.38)
      const rightFace = shade(fc.color, 0.65)
      const outerEdge = shade(fc.color, 0.22)

      const leftInt  = isSameInstance(row+1, col, fc.instanceId)
      const rightInt = isSameInstance(row, col+1, fc.instanceId)

      // Left face (SW)
      ctx.beginPath()
      ctx.moveTo(x-TILE_W/2, baseY+TILE_H/2)
      ctx.lineTo(x,           baseY+TILE_H)
      ctx.lineTo(x,           baseY+TILE_H+cubeH)
      ctx.lineTo(x-TILE_W/2, baseY+TILE_H/2+cubeH)
      ctx.closePath()
      ctx.fillStyle = leftFace; ctx.fill()
      ctx.strokeStyle = leftInt ? shade(leftFace, 0.82) : outerEdge
      ctx.lineWidth = leftInt ? 0.5 : 1.2; ctx.stroke()

      // Right face (SE)
      ctx.beginPath()
      ctx.moveTo(x+TILE_W/2, baseY+TILE_H/2)
      ctx.lineTo(x,           baseY+TILE_H)
      ctx.lineTo(x,           baseY+TILE_H+cubeH)
      ctx.lineTo(x+TILE_W/2, baseY+TILE_H/2+cubeH)
      ctx.closePath()
      ctx.fillStyle = rightFace; ctx.fill()
      ctx.strokeStyle = rightInt ? shade(rightFace, 0.82) : outerEdge
      ctx.lineWidth = rightInt ? 0.5 : 1.2; ctx.stroke()

      // Bottom edge shadow
      ctx.beginPath()
      ctx.moveTo(x-TILE_W/2, baseY+TILE_H/2+cubeH)
      ctx.lineTo(x,           baseY+TILE_H+cubeH)
      ctx.lineTo(x+TILE_W/2, baseY+TILE_H/2+cubeH)
      ctx.strokeStyle = shade(fc.color, 0.12); ctx.lineWidth = 2; ctx.stroke()

      // Top face
      ctx.beginPath()
      ctx.moveTo(x,           baseY-cubeH)
      ctx.lineTo(x+TILE_W/2, baseY+TILE_H/2-cubeH)
      ctx.lineTo(x,           baseY+TILE_H-cubeH)
      ctx.lineTo(x-TILE_W/2, baseY+TILE_H/2-cubeH)
      ctx.closePath()
      ctx.fillStyle = topFace; ctx.fill()
      if (fc.topColor !== fc.color) {
        ctx.fillStyle = fc.topColor + '70'; ctx.fill()
      }

      // Top face outer edges
      const topY = baseY - cubeH
      if (!isSameInstance(row, col-1, fc.instanceId)) {
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2, topY+TILE_H/2); ctx.lineTo(x, topY)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 1.2; ctx.stroke()
      }
      if (!isSameInstance(row-1, col, fc.instanceId)) {
        ctx.beginPath()
        ctx.moveTo(x, topY); ctx.lineTo(x+TILE_W/2, topY+TILE_H/2)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 1.2; ctx.stroke()
      }
      if (!rightInt) {
        ctx.beginPath()
        ctx.moveTo(x+TILE_W/2, topY+TILE_H/2); ctx.lineTo(x, topY+TILE_H)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 1.2; ctx.stroke()
      }
      if (!leftInt) {
        ctx.beginPath()
        ctx.moveTo(x, topY+TILE_H); ctx.lineTo(x-TILE_W/2, topY+TILE_H/2)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 1.2; ctx.stroke()
      }

      // Top highlight (NW→N→NE)
      ctx.beginPath()
      ctx.moveTo(x-TILE_W/2, topY+TILE_H/2)
      ctx.lineTo(x, topY)
      ctx.lineTo(x+TILE_W/2, topY+TILE_H/2)
      ctx.strokeStyle = shade(fc.color, 2.8); ctx.lineWidth = 1.5; ctx.stroke()

      // Z > 0: 床への影
      if (fc.z > 0 && !leftInt && !rightInt) {
        const shadowAlpha = Math.min(0.4, fc.z * 0.08)
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2, y+TILE_H/2)
        ctx.lineTo(x, y+TILE_H)
        ctx.lineTo(x+TILE_W/2, y+TILE_H/2)
        ctx.lineTo(x, y)
        ctx.closePath()
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`
        ctx.fill()
      }

      drawDecoration(ctx, fc, x, baseY, cubeH)
    }

    // Rule 2: Pass 1 — 全床タイルを奥から手前へ描画
    for (const { row, col } of allCells) {
      if (room.cells[row][col] === 'floor') drawFloorTile(col, row)
    }

    // Rule 2: Pass 2 — 壁・家具を奥から手前・下から上へ描画
    // 家具は z でさらにソート（同セルは z 昇順）
    const objectCells = allCells.filter(({ row, col }) => room.cells[row][col] !== 'empty')
    // z 昇順の二次ソート（同 depth 内）
    objectCells.sort((a, b) => {
      const depthA = a.row + a.col; const depthB = b.row + b.col
      if (depthA !== depthB) return depthA - depthB
      const wallA = room.cells[a.row][a.col] === 'wall' ? 1 : 0
      const wallB = room.cells[b.row][b.col] === 'wall' ? 1 : 0
      if (wallA !== wallB) return wallA - wallB
      const zA = furnitureCellMap.get(`${a.row},${a.col}`)?.z ?? 0
      const zB = furnitureCellMap.get(`${b.row},${b.col}`)?.z ?? 0
      return zA - zB
    })
    for (const { row, col } of objectCells) {
      const cellType = room.cells[row][col]
      if (cellType === 'floor') {
        const fc = furnitureCellMap.get(`${row},${col}`)
        if (fc) drawFurnitureCube(col, row, fc)
      } else if (cellType === 'wall') {
        drawWallCube(col, row)
      }
    }

    // 軸ラベル
    ctx.save()
    const ax = 30; const ay = canvasH - 30; const arrowLen = 20
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax+arrowLen, ay); ctx.strokeStyle='#ff5555'; ctx.lineWidth=2; ctx.stroke()
    ctx.fillStyle='#ff5555'; ctx.font='9px monospace'; ctx.fillText('X', ax+arrowLen+3, ay+4)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax-arrowLen*0.7, ay+arrowLen*0.5); ctx.strokeStyle='#55ff55'; ctx.stroke()
    ctx.fillStyle='#55ff55'; ctx.fillText('Y', ax-arrowLen*0.7-12, ay+arrowLen*0.5+4)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay-arrowLen); ctx.strokeStyle='#5555ff'; ctx.stroke()
    ctx.fillStyle='#5555ff'; ctx.fillText('Z', ax+3, ay-arrowLen-3)
    ctx.restore()

  }, [room, canvasW, canvasH, wallH, darkMode])

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  )
}
