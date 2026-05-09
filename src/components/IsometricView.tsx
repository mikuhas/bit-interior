import { useRef, useEffect } from 'react'
import { RoomState } from '../types'
import { getTemplate } from '../data/furniture'
import { rotateShape, expandShape } from '../utils/room'
import { TILE_W, TILE_H, Z_PX, shade, mix, isoUV, isoRect, isoLine } from '../utils/isometric'
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
    const objectCells=allCells.filter(({row,col})=>room.cells[row][col]!=='empty')
    objectCells.sort((a,b)=>{
      const dA=a.row+a.col; const dB=b.row+b.col
      if(dA!==dB) return dA-dB
      const wA=WALL_TYPES.has(room.cells[a.row][a.col])?1:0
      const wB=['wall','wallX','wallY'].includes(room.cells[b.row][b.col])?1:0
      if(wA!==wB) return wA-wB
      const zA=furnitureCellMap.get(`${a.row},${a.col}`)?.z??0
      const zB=furnitureCellMap.get(`${b.row},${b.col}`)?.z??0
      return zA-zB
    })

    const isSameInst=(row:number,col:number,id:string)=>
      furnitureCellMap.get(`${row},${col}`)?.instanceId===id

    for(const{row,col} of objectCells){
      const cell=room.cells[row][col]
      const{x,y}=toScreen(col,row)

      if(cell==='wall'||cell==='door'||cell==='window'){
        const h=wallH
        let wc=wallColor
        if(cell==='door')   wc='#6a4820'
        if(cell==='window') wc='#2a4868'
        const wLeft=shade(wc,0.82); const wRight=shade(wc,0.65); const wTop=shade(wc,1.55)
        ctx.save(); ctx.globalAlpha=WALL_ALPHA
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2,y+TILE_H/2);ctx.lineTo(x,y+TILE_H);ctx.lineTo(x,y+TILE_H-h);ctx.lineTo(x-TILE_W/2,y+TILE_H/2-h)
        ctx.closePath();ctx.fillStyle=wLeft;ctx.fill();ctx.strokeStyle=shade(wc,0.5);ctx.lineWidth=1;ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x+TILE_W/2,y+TILE_H/2);ctx.lineTo(x,y+TILE_H);ctx.lineTo(x,y+TILE_H-h);ctx.lineTo(x+TILE_W/2,y+TILE_H/2-h)
        ctx.closePath();ctx.fillStyle=wRight;ctx.fill();ctx.strokeStyle=shade(wc,0.5);ctx.lineWidth=1;ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x,y-h);ctx.lineTo(x+TILE_W/2,y+TILE_H/2-h);ctx.lineTo(x,y+TILE_H-h);ctx.lineTo(x-TILE_W/2,y+TILE_H/2-h)
        ctx.closePath();ctx.fillStyle=wTop;ctx.fill()
        if(cell==='door'){
          const[fx,fy]=isoUV(x,y,h,0.5,0.5)
          ctx.beginPath();ctx.arc(fx,fy,8,0,Math.PI*2);ctx.fillStyle='#e8c050';ctx.fill()
        }
        if(cell==='window'){
          isoRect(ctx,x,y,h,0.1,0.1,0.9,0.9,'rgba(100,200,255,0.28)','rgba(160,230,255,0.5)')
          isoLine(ctx,x,y,h,0.5,0.1,0.5,0.9,'rgba(160,230,255,0.6)',1)
          isoLine(ctx,x,y,h,0.1,0.5,0.9,0.5,'rgba(160,230,255,0.6)',1)
        }
        ctx.restore()
      }

      if(cell==='wallX'||cell==='wallBottom'){
        ctx.save(); ctx.globalAlpha=WALL_ALPHA
        const h=wallH; const wTop=shade(wallColor,1.55); const wFace=shade(wallColor,0.82)
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2,y+TILE_H/2);ctx.lineTo(x,y+TILE_H);ctx.lineTo(x,y+TILE_H-h);ctx.lineTo(x-TILE_W/2,y+TILE_H/2-h)
        ctx.closePath();ctx.fillStyle=wFace;ctx.fill();ctx.strokeStyle=shade(wallColor,0.5);ctx.lineWidth=1;ctx.stroke()
        isoRect(ctx,x,y,h,0,0.9,1,1,wTop)
        ctx.restore()
      }

      if(cell==='wallY'||cell==='wallRight'){
        ctx.save(); ctx.globalAlpha=WALL_ALPHA
        const h=wallH; const wTop=shade(wallColor,1.55); const wFace=shade(wallColor,0.65)
        ctx.beginPath()
        ctx.moveTo(x+TILE_W/2,y+TILE_H/2);ctx.lineTo(x,y+TILE_H);ctx.lineTo(x,y+TILE_H-h);ctx.lineTo(x+TILE_W/2,y+TILE_H/2-h)
        ctx.closePath();ctx.fillStyle=wFace;ctx.fill();ctx.strokeStyle=shade(wallColor,0.5);ctx.lineWidth=1;ctx.stroke()
        isoRect(ctx,x,y,h,0.9,0,1,1,wTop)
        ctx.restore()
      }

      if(cell==='wallTop'||cell==='wallLeft'||
         cell==='wallTopRight'||cell==='wallTopLeft'||
         cell==='wallBottomRight'||cell==='wallBottomLeft' ||
         cell==='wallTopBottom' || cell==='wallLeftRight' ||
         cell==='wallTopRightBottom' || cell==='wallRightBottomLeft' || 
         cell==='wallBottomLeftTop' || cell==='wallLeftTopRight' ||
         cell==='wallFull'){
        ctx.save(); ctx.globalAlpha=WALL_ALPHA
        drawEdgeWall(ctx,x,y,wallH,wallColor,
          ['wallTop','wallTopRight','wallTopLeft','wallTopBottom','wallTopRightBottom','wallBottomLeftTop','wallLeftTopRight','wallFull'].includes(cell),
          ['wallRight','wallTopRight','wallBottomRight','wallLeftRight','wallTopRightBottom','wallRightBottomLeft','wallLeftTopRight','wallFull'].includes(cell),
          ['wallBottom','wallBottomRight','wallBottomLeft','wallTopBottom','wallTopRightBottom','wallRightBottomLeft','wallBottomLeftTop','wallFull'].includes(cell),
          ['wallLeft','wallTopLeft','wallBottomLeft','wallLeftRight','wallRightBottomLeft','wallBottomLeftTop','wallLeftTopRight','wallFull'].includes(cell)
        )
        ctx.restore()
      }

      // コーナーピラー
      if(cell==='wallX'||cell==='wallY'){
        const h=wallH
        const wc=wallColor
        const pTop=shade(wc,1.55); const pLeft=shade(wc,0.82); const pRight=shade(wc,0.65)
        const isWX=(r:number,c:number)=>r>=0&&r<room.height&&c>=0&&c<room.width&&room.cells[r][c]==='wallX'
        const isWY=(r:number,c:number)=>r>=0&&r<room.height&&c>=0&&c<room.width&&room.cells[r][c]==='wallY'
        if(cell==='wallX'){
          if(isWY(row,col-1)){
            const[ax,ay]=isoUV(x,y,0,0,0.9); const[bx,by]=isoUV(x,y,0,0.1,0.9)
            const[cx2,cy2]=isoUV(x,y,0,0.1,1); const[dx,dy]=isoUV(x,y,0,0,1)
            ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.lineTo(dx,dy);ctx.closePath()
            ctx.fillStyle=pTop;ctx.fill()
            ctx.beginPath();ctx.moveTo(dx,dy);ctx.lineTo(cx2,cy2);ctx.lineTo(cx2,cy2-h);ctx.lineTo(dx,dy-h);ctx.closePath()
            ctx.fillStyle=pRight;ctx.fill()
          }
          if(isWY(row,col+1)){
            const[ax,ay]=isoUV(x,y,0,0.9,0.9); const[bx,by]=isoUV(x,y,0,1,0.9)
            const[cx2,cy2]=isoUV(x,y,0,1,1); const[dx,dy]=isoUV(x,y,0,0.9,1)
            ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.lineTo(dx,dy);ctx.closePath()
            ctx.fillStyle=pTop;ctx.fill()
            ctx.beginPath();ctx.moveTo(cx2,cy2);ctx.lineTo(bx,by);ctx.lineTo(bx,by-h);ctx.lineTo(cx2,cy2-h);ctx.closePath()
            ctx.fillStyle=pLeft;ctx.fill()
          }
        }
        if(cell==='wallY'){
          if(isWX(row-1,col)){
            const[ax,ay]=isoUV(x,y,0,0.9,0); const[bx,by]=isoUV(x,y,0,1,0)
            const[cx2,cy2]=isoUV(x,y,0,1,0.1); const[dx,dy]=isoUV(x,y,0,0.9,0.1)
            ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.lineTo(dx,dy);ctx.closePath()
            ctx.fillStyle=pTop;ctx.fill()
            ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(dx,dy);ctx.lineTo(dx,dy-h);ctx.lineTo(ax,ay-h);ctx.closePath()
            ctx.fillStyle=pLeft;ctx.fill()
          }
          if(isWX(row+1,col)){
            const[ax,ay]=isoUV(x,y,0,0.9,0.9); const[bx,by]=isoUV(x,y,0,1,0.9)
            const[cx2,cy2]=isoUV(x,y,0,1,1); const[dx,dy]=isoUV(x,y,0,0.9,1)
            ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(cx2,cy2);ctx.lineTo(dx,dy);ctx.closePath()
            ctx.fillStyle=pTop;ctx.fill()
            ctx.beginPath();ctx.moveTo(cx2,cy2);ctx.lineTo(dx,dy);ctx.lineTo(dx,dy-h);ctx.lineTo(cx2,cy2-h);ctx.closePath()
            ctx.fillStyle=pRight;ctx.fill()
          }
        }
      }

      if(cell==='floor'||cell==='autoFloor'){
        const fc=furnitureCellMap.get(`${row},${col}`)
        if(!fc) continue
        const cubeH=fc.height*18; const zOff=fc.screenZOff; const baseY=y-zOff
        const topFace=shade(fc.color,1.60); const leftFace=shade(fc.color,0.38)
        const rightFace=shade(fc.color,0.65); const outerEdge=shade(fc.color,0.22)
        const leftInt=isSameInst(row+1,col,fc.instanceId)
        const rightInt=isSameInst(row,col+1,fc.instanceId)
        // left face
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2,baseY+TILE_H/2);ctx.lineTo(x,baseY+TILE_H)
        ctx.lineTo(x,baseY+TILE_H-cubeH);ctx.lineTo(x-TILE_W/2,baseY+TILE_H/2-cubeH)
        ctx.closePath();ctx.fillStyle=leftFace;ctx.fill()
        ctx.strokeStyle=leftInt?shade(leftFace,0.82):outerEdge;ctx.lineWidth=leftInt?0.5:1.2;ctx.stroke()
        // right face
        ctx.beginPath()
        ctx.moveTo(x+TILE_W/2,baseY+TILE_H/2);ctx.lineTo(x,baseY+TILE_H)
        ctx.lineTo(x,baseY+TILE_H-cubeH);ctx.lineTo(x+TILE_W/2,baseY+TILE_H/2-cubeH)
        ctx.closePath();ctx.fillStyle=rightFace;ctx.fill()
        ctx.strokeStyle=rightInt?shade(rightFace,0.82):outerEdge;ctx.lineWidth=rightInt?0.5:1.2;ctx.stroke()
        // base shadow
        ctx.beginPath()
        ctx.moveTo(x-TILE_W/2,baseY+TILE_H/2);ctx.lineTo(x,baseY+TILE_H);ctx.lineTo(x+TILE_W/2,baseY+TILE_H/2)
        ctx.strokeStyle=shade(fc.color,0.12);ctx.lineWidth=2;ctx.stroke()
        // top face
        ctx.beginPath()
        ctx.moveTo(x,baseY-cubeH);ctx.lineTo(x+TILE_W/2,baseY+TILE_H/2-cubeH)
        ctx.lineTo(x,baseY+TILE_H-cubeH);ctx.lineTo(x-TILE_W/2,baseY+TILE_H/2-cubeH)
        ctx.closePath();ctx.fillStyle=topFace;ctx.fill()
        if(fc.topColor!==fc.color){ctx.fillStyle=fc.topColor+'70';ctx.fill()}
        drawDecoration(ctx,fc,x,baseY,cubeH)
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
