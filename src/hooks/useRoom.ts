import { useState, useCallback } from 'react'
import { RoomState, CellType, PlacedFurniture } from '../types'
import { createInitialRoom, detectAutoFloor } from '../utils/room'

export function useRoom(initialWidth = 12, initialHeight = 10) {
  const [room, setRoom] = useState<RoomState>(() => createInitialRoom(initialWidth, initialHeight))
  const [history, setHistory] = useState<RoomState[]>([])

  const beginInteraction = useCallback(() => {
    setHistory(prev => [...prev.slice(-49), room])
  }, [room])

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setRoom(last)
      return prev.slice(0, -1)
    })
  }, [])

  const setCell = useCallback((row: number, col: number, type: CellType) => {
    setRoom(prev => {
      if (row < 0 || row >= prev.height || col < 0 || col >= prev.width) return prev
      if (prev.cells[row][col] === type) return prev
      const newCells = prev.cells.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? type : c)) : r
      )
      return { ...prev, cells: detectAutoFloor(newCells, prev.width, prev.height) }
    })
  }, [])

  const placeFurniture = useCallback((f: PlacedFurniture) => {
    setRoom(prev => ({ ...prev, furniture: [...prev.furniture, f] }))
  }, [])

  const moveFurniture = useCallback((instanceId: string, x: number, y: number) => {
    setRoom(prev => ({
      ...prev,
      furniture: prev.furniture.map(f => f.instanceId === instanceId ? { ...f, x, y } : f),
    }))
  }, [])

  const removeFurniture = useCallback((instanceId: string) => {
    setRoom(prev => ({
      ...prev,
      furniture: prev.furniture.filter(f => f.instanceId !== instanceId),
    }))
  }, [])

  const updateFurnitureColor = useCallback((instanceId: string, color: string) => {
    setRoom(prev => ({
      ...prev,
      furniture: prev.furniture.map(f =>
        f.instanceId === instanceId ? { ...f, colorOverride: color } : f
      ),
    }))
  }, [])

  const updateFurnitureZ = useCallback((instanceId: string, z: number) => {
    setRoom(prev => ({
      ...prev,
      furniture: prev.furniture.map(f =>
        f.instanceId === instanceId ? { ...f, z } : f
      ),
    }))
  }, [])

  const updateFurnitureScale = useCallback((instanceId: string, scaleW: number, scaleH: number) => {
    setRoom(prev => ({
      ...prev,
      furniture: prev.furniture.map(f =>
        f.instanceId === instanceId ? { ...f, scaleW, scaleH } : f
      ),
    }))
  }, [])

  const resizeRoom = useCallback((newWidth: number, newHeight: number) => {
    setRoom(prev => {
      const w = Math.max(2, newWidth)
      const h = Math.max(2, newHeight)
      const newCells: CellType[][] = Array.from({ length: h }, (_, r) =>
        Array.from({ length: w }, (_, c) =>
          r < prev.height && c < prev.width ? prev.cells[r][c] : 'empty'
        )
      )
      const furniture = prev.furniture.filter(f => f.y < h && f.x < w)
      return { ...prev, width: w, height: h, cells: detectAutoFloor(newCells, w, h), furniture }
    })
  }, [])

  const resetRoom = useCallback((width: number, height: number) => {
    setRoom(createInitialRoom(width, height))
  }, [])

  const updateRoomAppearance = useCallback((wallHeight: number, wallColor: string) => {
    setRoom(prev => ({ ...prev, wallHeight, wallColor }))
  }, [])

  const loadRoom = useCallback((newRoom: RoomState) => {
    const furniture = newRoom.furniture.map(f => ({
      ...f,
      z: f.z ?? 0,
      scaleW: f.scaleW ?? 1,
      scaleH: f.scaleH ?? 1,
    }))
    setRoom({
      ...newRoom,
      furniture,
      wallHeight: newRoom.wallHeight ?? 3,
      wallColor: newRoom.wallColor ?? '#2d3050',
    })
  }, [])

  return {
    room,
    setCell,
    placeFurniture,
    moveFurniture,
    removeFurniture,
    updateFurnitureColor,
    updateFurnitureZ,
    updateFurnitureScale,
    updateRoomAppearance,
    resizeRoom,
    resetRoom,
    loadRoom,
    beginInteraction,
    undo,
  }
}
