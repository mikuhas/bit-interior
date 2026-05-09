import { useRef, useEffect } from 'react'
import { RoomState } from '../types'
import { getTemplate } from '../data/furniture'
import { rotateShape, expandShape } from '../utils/room'
import { TILE_W, TILE_H, Z_PX, shade, mix, isoUV, isoRect, isoLine, drawWindow, drawDoor } from '../utils/isometric'
import { FURNITURE_DRAWERS, DrawContext } from './iso/draw'

const WALL_TYPES = new Set(['wall','wallX','wallY','wallTop','wallRight','wallBottom','wallLeft','wallTopRight','wallTopLeft','wallBottomRight','wallBottomLeft','door','window'])
const EDGE_TH = 0.1
const WALL_ALPHA = 0.65

function drawEdgeWall(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,wc:string,
  top:boolean,right:boolean,bottom:boolean,left:boolean){
  const wTop=shade(wc,1.55);const wL=shade(wc,0.82);const wR=shade(wc,0.65);const wStk=shade(wc,0.5)
  
  if(bottom){
    ctx.beginPath()
    ctx.moveTo(x-TILE_W/2,y+TILE_H/2);ctx.lineTo(x,y+TILE_H);ctx.lineTo(x,y+TILE_H-h);ctx.lineTo(x-TILE_W/2,y+TILE_H/2-h)
    ctx.closePath();ctx.fillStyle=wL;ctx.fill();ctx.strokeStyle=wStk;ctx.lineWidth=1;ctx.stroke()
    isoRect(ctx,x,y,h,0,1-EDGE_TH,1,1,wTop)
  }
  if(right){
    ctx.beginPath()
    ctx.moveTo(x+TILE_W/2,y+TILE_H/2);ctx.lineTo(x,y+TILE_H);ctx.lineTo(x,y+TILE_H-h);ctx.lineTo(x+TILE_W/2,y+TILE_H/2-h)
    ctx.closePath();ctx.fillStyle=wR;ctx.fill();ctx.strokeStyle=wStk;ctx.lineWidth=1;ctx.stroke()
    isoRect(ctx,x,y,h,1-EDGE_TH,0,1,1,wTop)
  }
  if(top){
    const[ax,ay]=isoUV(x,y,0,0,EDGE_TH),[bx,by]=isoUV(x,y,0,1,EDGE_TH)
    const[ex,ey]=isoUV(x,y,h,1,EDGE_TH),[fx,fy]=isoUV(x,y,h,0,EDGE_TH)
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(ex,ey);ctx.lineTo(fx,fy)
    ctx.closePath();ctx.fillStyle=wL;ctx.fill();ctx.strokeStyle=wStk;ctx.lineWidth=1;ctx.stroke()
    isoRect(ctx,x,y,h,0,0,1,EDGE_TH,wTop)
  }
  if(left){
    const[ax,ay]=isoUV(x,y,0,EDGE_TH,0),[bx,by]=isoUV(x,y,0,EDGE_TH,1)
    const[ex,ey]=isoUV(x,y,h,EDGE_TH,1),[fx,fy]=isoUV(x,y,h,EDGE_TH,0)
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(ex,ey);ctx.lineTo(fx,fy)
    ctx.closePath();ctx.fillStyle=wR;ctx.fill();ctx.strokeStyle=wStk;ctx.lineWidth=1;ctx.stroke()
    isoRect(ctx,x,y,h,0,0,EDGE_TH,1,wTop)
  }
}

function sideLine(ctx:CanvasRenderingContext2D,x:number,y:number,cubeH:number,
  tU:number,side:'left'|'right',color:string,lw=0.8){
  ctx.beginPath()
  if(side==='left'){ctx.moveTo(x-TILE_W/2,y+TILE_H/2-cubeH*tU);ctx.lineTo(x,y+TILE_H-cubeH*tU)}
  else{ctx.moveTo(x+TILE_W/2,y+TILE_H/2-cubeH*tU);ctx.lineTo(x,y+TILE_H-cubeH*tU)}
  ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke()
}


type CellInfo={color:string;topColor:string;height:number;z:number;
  templateId:string;instanceId:string;localRow:number;localCol:number;shapeRows:number;shapeCols:number}

function drawDecoration(ctx:CanvasRenderingContext2D,fc:CellInfo,x:number,y:number,cubeH:number){
  const{templateId,localRow,localCol,shapeCols,shapeRows,color,topColor}=fc
  
  // 1セルずつ描画するのではなく、(0,0)のタイミングで家具全体を一気に描画する
  if(localRow !== 0 || localCol !== 0) return

  const drawer = FURNITURE_DRAWERS[templateId]
  if (!drawer) return

  const highlight = 'rgba(255,255,255,0.25)'
  const shadow = 'rgba(0,0,0,0.15)'

  const drawCtx: DrawContext = {
    ctx, x, y, cubeH, 
    W: shapeCols, D: shapeRows, 
    color, topColor, highlight, shadow
  }

  drawer(drawCtx)
}


interface Props { room: RoomState; darkMode?: boolean }

export default function IsometricView({ room, darkMode=true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wallH = (room.wallHeight??3)*Z_PX
  const totalCells = room.width+room.height
  const canvasW = totalCells*TILE_W/2+TILE_W
  const canvasH = totalCells*TILE_H/2+wallH*4+TILE_H+120

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d'); if(!ctx) return
    const wallColor=room.wallColor??'#2d3050'
    const offsetX=room.height*TILE_W/2+TILE_W/2
    const offsetY=wallH*2+TILE_H+60
    const toScreen=(col:number,row:number)=>({
      x:Math.round(offsetX+(col-row)*TILE_W/2),
      y:Math.round(offsetY+(col+row)*TILE_H/2),
    })

    ctx.fillStyle=darkMode?'#080912':'#dce8f4'
    ctx.fillRect(0,0,canvasW,canvasH)

    // 家具セルマップ
    type CellEntry=CellInfo&{screenZOff:number}
    const furnitureCellMap=new Map<string,CellEntry>()
    for(const pf of room.furniture){
      const tmpl=getTemplate(pf.templateId); if(!tmpl) continue
      const sw=pf.scaleW??1; const sh=pf.scaleH??1; const z=Math.max(0,pf.z??0)
      const shape=expandShape(rotateShape(tmpl.shape,pf.rotation),sw,sh)
      const shapeRows=shape.length; const shapeCols=shape[0]?.length??1
      const effectiveColor=pf.colorOverride??tmpl.color
      const effectiveTopColor=pf.colorOverride?shade(pf.colorOverride,1.4):tmpl.topColor
      for(let r=0;r<shape.length;r++) for(let c=0;c<shape[r].length;c++){
        if(!shape[r][c]) continue
        const gr=pf.y+r; const gc=pf.x+c
        if(gr<0||gr>=room.height||gc<0||gc>=room.width) continue
        if(room.cells[gr][gc]!=='floor'&&room.cells[gr][gc]!=='autoFloor') continue
        furnitureCellMap.set(`${gr},${gc}`,{
          color:effectiveColor,topColor:effectiveTopColor,height:tmpl.height,z,
          templateId:tmpl.id,instanceId:pf.instanceId,
          localRow:r,localCol:c,shapeRows,shapeCols,screenZOff:z*Z_PX,
        })
      }
    }

    // depth sort
    const allCells:Array<{row:number;col:number}>=[]
    for(let r=0;r<room.height;r++) for(let c=0;c<room.width;c++) allCells.push({row:r,col:c})
    allCells.sort((a,b)=>{
      const dA=a.row+a.col; const dB=b.row+b.col
      if(dA!==dB) return dA-dB
      const wA=WALL_TYPES.has(room.cells[a.row][a.col])?1:0
      const wB=['wall','wallX','wallY'].includes(room.cells[b.row][b.col])?1:0
      if(wA!==wB) return wA-wB
      return a.col-b.col
    })

    // floor pass
    for(const{row,col} of allCells){
      const cell=room.cells[row][col]
      if(cell==='empty') continue
      if(cell==='floor'||cell==='autoFloor'||WALL_TYPES.has(cell)){
        const{x,y}=toScreen(col,row)
        ctx.beginPath()
        ctx.moveTo(x,y);ctx.lineTo(x+TILE_W/2,y+TILE_H/2);ctx.lineTo(x,y+TILE_H);ctx.lineTo(x-TILE_W/2,y+TILE_H/2)
        ctx.closePath()
        ctx.fillStyle=darkMode?'#1e3055':'#8898b8'; ctx.fill()
        ctx.strokeStyle=darkMode?'#0d1535':'#6070a0'; ctx.lineWidth=1; ctx.stroke()
      }
    }

    // object pass (wall/door/window/furniture)
    const objectCells = allCells.filter(({ row, col }) => room.cells[row][col] !== 'empty')
    objectCells.sort((a, b) => {
      const dA = a.row + a.col; const dB = b.row + b.col
      if (dA !== dB) return dA - dB
      return a.col - b.col
    })

    const isSameInst = (row: number, col: number, id: string) =>
      furnitureCellMap.get(`${row},${col}`)?.instanceId === id

    for (const { row, col } of objectCells) {
      const cell = room.cells[row][col]
      const { x, y } = toScreen(col, row)

      // 1. 床の描画 (Z=0基準)
      ctx.save()
      ctx.globalAlpha = 1
      isoRect(ctx, x, y, 0, 0, 0, 1, 1, '#1a2d50', '#0d1535')
      ctx.restore()

      // 2. 壁・窓・ドアの描画
      if (cell === 'wall' || cell === 'wallTop' || cell === 'wallRight' || cell === 'wallBottom' || cell === 'wallLeft' ||
        cell === 'wallTopRight' || cell === 'wallTopLeft' || cell === 'wallBottomRight' || cell === 'wallBottomLeft' ||
        cell === 'wallTopBottom' || cell === 'wallLeftRight' ||
        cell === 'wallTopRightBottom' || cell === 'wallRightBottomLeft' ||
        cell === 'wallBottomLeftTop' || cell === 'wallLeftTopRight' ||
        cell === 'wallFull' ||
        cell === 'window' || cell === 'windowTop' || cell === 'windowRight' || cell === 'windowBottom' || cell === 'windowLeft' ||
        cell === 'door' || cell === 'door90' || cell === 'door180' || cell === 'door270') {

        ctx.save(); ctx.globalAlpha = WALL_ALPHA

        // 壁の描画
        const isWall = ['wall', 'wallTop', 'wallRight', 'wallBottom', 'wallLeft', 'wallTopRight', 'wallTopLeft', 'wallBottomRight', 'wallBottomLeft', 'wallTopBottom', 'wallLeftRight', 'wallTopRightBottom', 'wallRightBottomLeft', 'wallBottomLeftTop', 'wallLeftTopRight', 'wallFull'].includes(cell)
        if (isWall) {
          const isTop = ['wallTop', 'wallTopRight', 'wallTopLeft', 'wallTopBottom', 'wallTopRightBottom', 'wallBottomLeftTop', 'wallLeftTopRight', 'wallFull', 'windowTop'].includes(cell)
          const isRight = ['wallRight', 'wallTopRight', 'wallBottomRight', 'wallLeftRight', 'wallTopRightBottom', 'wallRightBottomLeft', 'wallLeftTopRight', 'wallFull', 'windowRight'].includes(cell)
          const isBottom = ['wallBottom', 'wallBottomRight', 'wallBottomLeft', 'wallTopBottom', 'wallTopRightBottom', 'wallRightBottomLeft', 'wallBottomLeftTop', 'wallFull', 'windowBottom'].includes(cell)
          const isLeft = ['wallLeft', 'wallTopLeft', 'wallBottomLeft', 'wallLeftRight', 'wallRightBottomLeft', 'wallBottomLeftTop', 'wallLeftTopRight', 'wallFull', 'windowLeft'].includes(cell)
          drawEdgeWall(ctx, x, y, wallH, wallColor, isTop, isRight, isBottom, isLeft)
        }

        // 窓の描画
        if (cell === 'windowTop') drawWindow(ctx, x, y, wallH, 'top')
        if (cell === 'windowRight') drawWindow(ctx, x, y, wallH, 'right')
        if (cell === 'windowBottom') drawWindow(ctx, x, y, wallH, 'bottom')
        if (cell === 'windowLeft') drawWindow(ctx, x, y, wallH, 'left')

        // ドアの描画
        if (cell === 'door') drawDoor(ctx, x, y, wallH, 'bottom')
        if (cell === 'door90') drawDoor(ctx, x, y, wallH, 'right')
        if (cell === 'door180') drawDoor(ctx, x, y, wallH, 'top')
        if (cell === 'door270') drawDoor(ctx, x, y, wallH, 'left')

        ctx.restore()
        }

      // 3. 家具の描画
      const fc = furnitureCellMap.get(`${row},${col}`)
      if (fc) {
        const cubeH = fc.height * 18
        const zOff = fc.screenZOff // Z=0を基準とした高さ
        const baseY = y - zOff
        
        const topFace = shade(fc.color, 1.60); const leftFace = shade(fc.color, 0.38)
        const rightFace = shade(fc.color, 0.65); const outerEdge = shade(fc.color, 0.22)
        const leftInt = isSameInst(row + 1, col, fc.instanceId)
        const rightInt = isSameInst(row, col + 1, fc.instanceId)

        // left face
        ctx.beginPath()
        ctx.moveTo(x - TILE_W / 2, baseY + TILE_H / 2); ctx.lineTo(x, baseY + TILE_H)
        ctx.lineTo(x, baseY + TILE_H - cubeH); ctx.lineTo(x - TILE_W / 2, baseY + TILE_H / 2 - cubeH)
        ctx.closePath(); ctx.fillStyle = leftFace; ctx.fill()
        ctx.strokeStyle = leftInt ? shade(leftFace, 0.82) : outerEdge; ctx.lineWidth = leftInt ? 0.5 : 1.2; ctx.stroke()
        
        // right face
        ctx.beginPath()
        ctx.moveTo(x + TILE_W / 2, baseY + TILE_H / 2); ctx.lineTo(x, baseY + TILE_H)
        ctx.lineTo(x, baseY + TILE_H - cubeH); ctx.lineTo(x + TILE_W / 2, baseY + TILE_H / 2 - cubeH)
        ctx.closePath(); ctx.fillStyle = rightFace; ctx.fill()
        ctx.strokeStyle = rightInt ? shade(rightFace, 0.82) : outerEdge; ctx.lineWidth = rightInt ? 0.5 : 1.2; ctx.stroke()
        
        // base shadow
        ctx.beginPath()
        ctx.moveTo(x - TILE_W / 2, baseY + TILE_H / 2); ctx.lineTo(x, baseY + TILE_H); ctx.lineTo(x + TILE_W / 2, baseY + TILE_H / 2)
        ctx.strokeStyle = shade(fc.color, 0.12); ctx.lineWidth = 2; ctx.stroke()
        
        // top face
        ctx.beginPath()
        ctx.moveTo(x, baseY - cubeH); ctx.lineTo(x + TILE_W / 2, baseY + TILE_H / 2 - cubeH)
        ctx.lineTo(x, baseY + TILE_H - cubeH); ctx.lineTo(x - TILE_W / 2, baseY + TILE_H / 2 - cubeH)
        ctx.closePath(); ctx.fillStyle = topFace; ctx.fill()
        if (fc.topColor !== fc.color) { ctx.fillStyle = fc.topColor + '70'; ctx.fill() }
        drawDecoration(ctx, fc, x, baseY, cubeH)
      }
    }
  },[room,canvasW,canvasH,wallH,darkMode])

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      style={{ display:'block', imageRendering:'pixelated' }}
    />
  )
}
