import { useRef, useEffect } from 'react'
import { RoomState } from '../types'
import { getTemplate } from '../data/furniture'
import { rotateShape, expandShape } from '../utils/room'

const TILE_W = 64
const TILE_H = 32
const WALL_H = 36
const Z_PX = 14   // 1bit高さあたりのピクセル数

// --- Color utilities ---
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

// アイソメUVマッピング: N=(0,0), E=(1,0), S=(1,1), W=(0,1)
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

interface Props { room: RoomState }

type CellInfo = {
  color: string; topColor: string; height: number; z: number
  templateId: string; instanceId: string
  localRow: number; localCol: number; shapeRows: number; shapeCols: number
}

// 家具固有デコレーション
function drawDecoration(ctx: CanvasRenderingContext2D, fc: CellInfo, x: number, y: number, cubeH: number) {
  const { templateId, localRow, shapeCols, color, topColor } = fc
  switch (templateId) {
    case 'bed-s': case 'bed-d': {
      for (let i = 1; i < 3; i++) {
        const t = i / 3
        ctx.beginPath()
        const [lx0, ly0] = isoUV(x, y, cubeH, t, 0); const [lx1, ly1] = isoUV(x, y, cubeH, t, 1)
        ctx.moveTo(lx0, ly0); ctx.lineTo(lx1, ly1)
        ctx.strokeStyle = mix(topColor, '#fff', 0.15); ctx.lineWidth = 1; ctx.stroke()
      }
      if (localRow === 0) {
        const pc = mix(color, '#f4ead8', 0.8)
        isoRect(ctx, x, y, cubeH, 0.1, 0.1, 0.9, 0.55, pc, shade(pc, 0.8))
      }
      if (localRow === 0 || localRow === fc.shapeRows - 1)
        isoRect(ctx, x, y, cubeH, 0, 0.72, 1, 1, shade(color, 0.65))
      break
    }
    case 'sofa': {
      isoRect(ctx, x, y, cubeH, 0.07, 0.07, 0.93, 0.93, mix(topColor, color, 0.35), shade(topColor, 0.75))
      if (localRow === 0) isoRect(ctx, x, y, cubeH, 0.05, 0.05, 0.95, 0.38, shade(color, 0.55))
      if (shapeCols > 1 && fc.localCol < shapeCols - 1) {
        ctx.beginPath()
        const [sx, sy] = isoUV(x, y, cubeH, 1, 0.12); const [ex, ey] = isoUV(x, y, cubeH, 1, 0.88)
        ctx.moveTo(sx, sy); ctx.lineTo(ex, ey)
        ctx.strokeStyle = shade(color, 0.5); ctx.lineWidth = 1.5; ctx.stroke()
      }
      break
    }
    case 'bookshelf': {
      const BC = ['#d04040','#4080d0','#40b050','#d09030','#a040c0','#40b0a0']
      for (let b = 0; b < 3; b++) {
        const bc = BC[(fc.localCol * 3 + b) % BC.length]
        isoRect(ctx, x, y, cubeH, b/3+0.05, 0.1, (b+1)/3-0.05, 0.9, bc, shade(bc, 0.7))
      }
      for (let s = 1; s < 3; s++) {
        const t = s / 3
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2, y+TILE_H/2+cubeH*t); ctx.lineTo(x, y+TILE_H+cubeH*t)
        ctx.strokeStyle = shade(color, 1.5); ctx.lineWidth = 1; ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x+TILE_W/2, y+TILE_H/2+cubeH*t); ctx.lineTo(x, y+TILE_H+cubeH*t); ctx.stroke()
      }
      break
    }
    case 'dresser': {
      isoRect(ctx, x, y, cubeH, 0.08, 0.1, 0.92, 0.9, shade(topColor, 0.88), shade(color, 0.55))
      const [hx, hy] = isoUV(x, y, cubeH, 0.5, 0.5)
      ctx.beginPath(); ctx.arc(hx, hy, 2.5, 0, Math.PI*2); ctx.fillStyle='#c8a820'; ctx.fill()
      const mh = cubeH*0.5
      ctx.beginPath(); ctx.moveTo(x-TILE_W/2, y+TILE_H/2+mh); ctx.lineTo(x, y+TILE_H+mh)
      ctx.strokeStyle = shade(color, 0.45); ctx.lineWidth=1; ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x+TILE_W/2, y+TILE_H/2+mh); ctx.lineTo(x, y+TILE_H+mh); ctx.stroke()
      break
    }
    case 'desk': {
      const gc = shade(topColor, 1.18)
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        const [lx0,ly0]=isoUV(x,y,cubeH,0.12+i*0.32,0.08); const [lx1,ly1]=isoUV(x,y,cubeH,0.21+i*0.32,0.92)
        ctx.moveTo(lx0,ly0); ctx.lineTo(lx1,ly1)
        ctx.strokeStyle=gc; ctx.lineWidth=0.5; ctx.stroke()
      }
      break
    }
    case 'chair':
      isoRect(ctx, x, y, cubeH, 0.1, 0.1, 0.9, 0.9, mix(topColor,'#fff',0.1), shade(color,0.65))
      if (localRow===0) isoRect(ctx, x, y, cubeH, 0.05, 0.05, 0.95, 0.35, shade(color,0.6))
      break
    case 'coffee-table':
      isoRect(ctx, x, y, cubeH, 0.05, 0.05, 0.95, 0.95, mix(topColor,'#fff',0.18), shade(color,0.65))
      break
    case 'dining-table': {
      const gc = mix(topColor,'#fff',0.15)
      for (let i=0;i<4;i++) {
        ctx.beginPath()
        const [lx0,ly0]=isoUV(x,y,cubeH,0.1+i*0.25,0.05); const [lx1,ly1]=isoUV(x,y,cubeH,0.15+i*0.25,0.95)
        ctx.moveTo(lx0,ly0); ctx.lineTo(lx1,ly1)
        ctx.strokeStyle=gc; ctx.lineWidth=0.7; ctx.stroke()
      }
      break
    }
    case 'tv-stand':
      isoRect(ctx, x, y, cubeH, 0.06, 0.06, 0.94, 0.94, '#0a0a18', '#1a1a28')
      isoRect(ctx, x, y, cubeH, 0.08, 0.08, 0.42, 0.42, 'rgba(255,255,255,0.07)')
      break
    case 'plant': {
      const [cx, cy] = isoUV(x, y, cubeH, 0.5, 0.5)
      ctx.beginPath(); ctx.ellipse(cx,cy,10,6,0,0,Math.PI*2); ctx.fillStyle=mix(color,'#704020',0.7); ctx.fill()
      const LC=['#2a8a18','#3ab020','#4ac030','#20700e','#35a818']
      for (let i=0;i<5;i++) {
        const a=(i/5)*Math.PI*2; const lx=cx+Math.cos(a)*11; const ly=cy+Math.sin(a)*6-4
        ctx.beginPath(); ctx.ellipse(lx,ly,9,5,a,0,Math.PI*2); ctx.fillStyle=LC[i%LC.length]; ctx.fill()
      }
      ctx.beginPath(); ctx.arc(cx,cy-3,5,0,Math.PI*2); ctx.fillStyle=LC[0]; ctx.fill()
      break
    }
    case 'bathtub':
      isoRect(ctx, x, y, cubeH, 0.12, 0.12, 0.88, 0.88, mix(color,'#6ab8d8',0.5), shade('#6ab8d8',0.75))
      isoRect(ctx, x, y, cubeH, 0.15, 0.15, 0.5, 0.4, 'rgba(255,255,255,0.15)')
      break
    case 'toilet': {
      const [tcx,tcy]=isoUV(x,y,cubeH,0.5,0.55)
      const sc=mix(topColor,'#fff',0.28)
      ctx.beginPath(); ctx.ellipse(tcx,tcy,13,7,0,0,Math.PI*2); ctx.fillStyle=sc; ctx.fill()
      ctx.strokeStyle=shade(sc,0.75); ctx.lineWidth=1; ctx.stroke()
      ctx.beginPath(); ctx.ellipse(tcx,tcy+1,7,4,0,0,Math.PI*2); ctx.fillStyle=shade(topColor,0.5); ctx.fill()
      if (localRow===0) isoRect(ctx,x,y,cubeH,0.15,0.1,0.85,0.48,mix(topColor,'#fff',0.18),shade(topColor,0.65))
      break
    }
  }
}

export default function IsometricCanvas({ room }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const totalCells = room.width + room.height
  const canvasW = totalCells * TILE_W / 2 + TILE_W
  const canvasH = totalCells * TILE_H / 2 + WALL_H * 4 + TILE_H + 120

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const offsetX = room.height * TILE_W / 2 + TILE_W / 2
    const offsetY = WALL_H * 2 + TILE_H + 60

    const toScreen = (col: number, row: number) => ({
      x: offsetX + (col - row) * TILE_W / 2,
      y: offsetY + (col + row) * TILE_H / 2,
    })

    ctx.fillStyle = '#080912'
    ctx.fillRect(0, 0, canvasW, canvasH)

    // ---- 家具セルマップ構築 ----
    type CellEntry = CellInfo & { screenZOff: number }
    const furnitureCellMap = new Map<string, CellEntry>()

    for (const pf of room.furniture) {
      const tmpl = getTemplate(pf.templateId)
      if (!tmpl) continue
      const sw = pf.scaleW ?? 1
      const sh = pf.scaleH ?? 1
      const z = pf.z ?? 0
      const rotated = rotateShape(tmpl.shape, pf.rotation)
      const shape = expandShape(rotated, sw, sh)
      const shapeRows = shape.length
      const shapeCols = shape[0]?.length ?? 1
      const effectiveColor = pf.colorOverride ?? tmpl.color
      const effectiveTopColor = pf.colorOverride ? shade(pf.colorOverride, 1.4) : tmpl.topColor

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            furnitureCellMap.set(`${pf.y + r},${pf.x + c}`, {
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
    }

    // ---- ソート: row+col が同じ場合は z で昇順 ----
    const allCells: Array<{ row: number; col: number }> = []
    for (let r = 0; r < room.height; r++)
      for (let c = 0; c < room.width; c++)
        allCells.push({ row: r, col: c })

    const getFcZ = (r: number, c: number) => furnitureCellMap.get(`${r},${c}`)?.z ?? 0
    allCells.sort((a, b) => {
      const ka = (a.row + a.col) * 100 + getFcZ(a.row, a.col)
      const kb = (b.row + b.col) * 100 + getFcZ(b.row, b.col)
      return ka - kb
    })

    // ---- 描画関数群 ----
    const drawFloorTile = (col: number, row: number) => {
      const { x, y } = toScreen(col, row)
      ctx.beginPath()
      ctx.moveTo(x, y); ctx.lineTo(x+TILE_W/2, y+TILE_H/2); ctx.lineTo(x, y+TILE_H); ctx.lineTo(x-TILE_W/2, y+TILE_H/2)
      ctx.closePath(); ctx.fillStyle='#1e3055'; ctx.fill()
      ctx.strokeStyle='#0d1535'; ctx.lineWidth=1; ctx.stroke()
    }

    const drawWallCube = (col: number, row: number) => {
      const { x, y } = toScreen(col, row)
      const h = WALL_H
      // left
      ctx.beginPath()
      ctx.moveTo(x-TILE_W/2,y+TILE_H/2); ctx.lineTo(x,y+TILE_H); ctx.lineTo(x,y+TILE_H+h); ctx.lineTo(x-TILE_W/2,y+TILE_H/2+h)
      ctx.closePath(); ctx.fillStyle='#252840'; ctx.fill(); ctx.strokeStyle='#1a1c2e'; ctx.lineWidth=1; ctx.stroke()
      // right
      ctx.beginPath()
      ctx.moveTo(x+TILE_W/2,y+TILE_H/2); ctx.lineTo(x,y+TILE_H); ctx.lineTo(x,y+TILE_H+h); ctx.lineTo(x+TILE_W/2,y+TILE_H/2+h)
      ctx.closePath(); ctx.fillStyle='#2d3050'; ctx.fill(); ctx.strokeStyle='#1a1c2e'; ctx.lineWidth=1; ctx.stroke()
      // top
      ctx.beginPath()
      ctx.moveTo(x,y-h); ctx.lineTo(x+TILE_W/2,y+TILE_H/2-h); ctx.lineTo(x,y+TILE_H-h); ctx.lineTo(x-TILE_W/2,y+TILE_H/2-h)
      ctx.closePath(); ctx.fillStyle='#4a4e69'; ctx.fill(); ctx.strokeStyle='#5a5e80'; ctx.lineWidth=1; ctx.stroke()
    }

    const isSameInstance = (row: number, col: number, instanceId: string): boolean =>
      furnitureCellMap.get(`${row},${col}`)?.instanceId === instanceId

    const drawFurnitureCube = (col: number, row: number, fc: CellEntry) => {
      const { x, y } = toScreen(col, row)
      const cubeH = fc.height * 12
      const zOff = fc.screenZOff    // Z軸オフセット: 上方向 (y が減る)

      // y座標をZOff分上にシフト
      const baseY = y - zOff

      const topFace  = shade(fc.color, 1.35)
      const leftFace = shade(fc.color, 0.80)
      const rightFace= shade(fc.color, 0.54)
      const outerEdge= shade(fc.color, 0.28)

      // 隣接インスタンス判定
      const leftInt  = isSameInstance(row+1, col, fc.instanceId)
      const rightInt = isSameInstance(row, col+1, fc.instanceId)

      // --- Left face (SW) ---
      ctx.beginPath()
      ctx.moveTo(x-TILE_W/2, baseY+TILE_H/2)
      ctx.lineTo(x,           baseY+TILE_H)
      ctx.lineTo(x,           baseY+TILE_H+cubeH)
      ctx.lineTo(x-TILE_W/2, baseY+TILE_H/2+cubeH)
      ctx.closePath()
      ctx.fillStyle = leftFace; ctx.fill()
      ctx.strokeStyle = leftInt ? shade(leftFace, 0.82) : outerEdge
      ctx.lineWidth  = leftInt ? 0.5 : 0.9; ctx.stroke()

      // --- Right face (SE) ---
      ctx.beginPath()
      ctx.moveTo(x+TILE_W/2, baseY+TILE_H/2)
      ctx.lineTo(x,           baseY+TILE_H)
      ctx.lineTo(x,           baseY+TILE_H+cubeH)
      ctx.lineTo(x+TILE_W/2, baseY+TILE_H/2+cubeH)
      ctx.closePath()
      ctx.fillStyle = rightFace; ctx.fill()
      ctx.strokeStyle = rightInt ? shade(rightFace, 0.82) : outerEdge
      ctx.lineWidth  = rightInt ? 0.5 : 0.9; ctx.stroke()

      // --- Top face ---
      // Fill のみ (outer edge は後で個別に描く)
      ctx.beginPath()
      ctx.moveTo(x,           baseY-cubeH)
      ctx.lineTo(x+TILE_W/2, baseY+TILE_H/2-cubeH)
      ctx.lineTo(x,           baseY+TILE_H-cubeH)
      ctx.lineTo(x-TILE_W/2, baseY+TILE_H/2-cubeH)
      ctx.closePath()
      ctx.fillStyle = topFace; ctx.fill()

      // topColor オーバーレイ (素材感)
      if (fc.topColor !== fc.color) {
        ctx.fillStyle = fc.topColor + '70'; ctx.fill()
      }

      // Top face 外周エッジのみ描画 (内部は描かない)
      const topY = baseY - cubeH
      // NW edge: outer if (col-1, row) not same
      if (!isSameInstance(row, col-1, fc.instanceId)) {
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2, topY+TILE_H/2)
        ctx.lineTo(x, topY)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 0.9; ctx.stroke()
      }
      // NE edge: outer if (col, row-1) not same
      if (!isSameInstance(row-1, col, fc.instanceId)) {
        ctx.beginPath()
        ctx.moveTo(x, topY)
        ctx.lineTo(x+TILE_W/2, topY+TILE_H/2)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 0.9; ctx.stroke()
      }
      // SE edge: outer if (col+1, row) not same
      if (!rightInt) {
        ctx.beginPath()
        ctx.moveTo(x+TILE_W/2, topY+TILE_H/2)
        ctx.lineTo(x, topY+TILE_H)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 0.9; ctx.stroke()
      }
      // SW edge: outer if (col, row+1) not same
      if (!leftInt) {
        ctx.beginPath()
        ctx.moveTo(x, topY+TILE_H)
        ctx.lineTo(x-TILE_W/2, topY+TILE_H/2)
        ctx.strokeStyle = outerEdge; ctx.lineWidth = 0.9; ctx.stroke()
      }

      // 上辺ハイライト (常に)
      ctx.beginPath()
      ctx.moveTo(x-TILE_W/2, topY+TILE_H/2)
      ctx.lineTo(x, topY)
      ctx.lineTo(x+TILE_W/2, topY+TILE_H/2)
      ctx.strokeStyle = shade(fc.color, 2.0); ctx.lineWidth = 1.2; ctx.stroke()

      // Z > 0 なら床への「脚/影」描画
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

      // 家具固有デコレーション
      // baseY を使った x,y をデコレーション関数に渡すため調整
      const decorCtx = ctx
      const decorX = x
      const decorY = baseY
      drawDecoration(decorCtx, fc, decorX, decorY, cubeH)
    }

    // ---- セルを順番に描画 ----
    for (const { row, col } of allCells) {
      const cellType = room.cells[row][col]
      if (cellType === 'floor') {
        drawFloorTile(col, row)
        const fc = furnitureCellMap.get(`${row},${col}`)
        if (fc) drawFurnitureCube(col, row, fc)
      } else if (cellType === 'wall') {
        drawWallCube(col, row)
      }
    }

    // ---- XYZラベル (デバッグ用・右下) ----
    ctx.save()
    const ax = 30; const ay = canvasH - 30
    const arrowLen = 20
    // X軸 (右)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax+arrowLen, ay); ctx.strokeStyle='#ff5555'; ctx.lineWidth=2; ctx.stroke()
    ctx.fillStyle='#ff5555'; ctx.font='9px monospace'; ctx.fillText('X', ax+arrowLen+3, ay+4)
    // Y軸 (手前)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax-arrowLen*0.7, ay+arrowLen*0.5); ctx.strokeStyle='#55ff55'; ctx.stroke()
    ctx.fillStyle='#55ff55'; ctx.fillText('Y', ax-arrowLen*0.7-12, ay+arrowLen*0.5+4)
    // Z軸 (上)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay-arrowLen); ctx.strokeStyle='#5555ff'; ctx.stroke()
    ctx.fillStyle='#5555ff'; ctx.fillText('Z', ax+3, ay-arrowLen-3)
    ctx.restore()

  }, [room, canvasW, canvasH])

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  )
}
