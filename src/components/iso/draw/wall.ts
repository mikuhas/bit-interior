import { TILE_W, TILE_H, isoUV, isoRect, shade } from '../../../utils/isometric'

const EDGE_TH = 0.1

export function drawEdgeWall(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,wc:string,
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
