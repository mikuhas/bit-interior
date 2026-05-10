import { useRef, useEffect } from 'react'
import { RoomState } from '../../types'
import { Z_PX, TILE_W, TILE_H } from '../../utils/isometric'
import { renderIsometric } from '../../utils/isometricRenderer'

interface Props { room: RoomState; darkMode?: boolean }

export default function IsometricView({ room, darkMode=true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wallH = (room.wallHeight??3)*Z_PX
  const totalCells = room.width+room.height
  const canvasW = totalCells*(TILE_W/2) + TILE_W
  const canvasH = totalCells*(TILE_H/2) + wallH*4 + TILE_H + 120

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d'); if(!ctx) return
    
    renderIsometric(ctx, room, canvas.width, canvas.height, wallH, darkMode)
  },[room, wallH, darkMode])

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      style={{ display:'block', imageRendering:'pixelated' }}
    />
  )
}
