import { useState, useCallback } from 'react'
import { RoomState, CellType, PlacedFurniture } from '../types'
import { createInitialRoom } from '../utils/room'

export function useRoom(initialWidth = 12, initialHeight = 10) {
  const [room, setRoom] = useState<RoomState>(() => createInitialRoom(initialWidth, initialHeight))

  const setCell = useCallback((row: number, col: number, type: CellType) => {
    setRoom(prev => {
      if (row < 0 || row >= prev.height || col < 0 || col >= prev.width) return prev
      if (prev.cells[row][col] === type) return prev
      const newCells = prev.cells.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? type : c)) : r
      )
      return { ...prev, cells: newCells }
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

  const resetRoom = useCallback((width: number, height: number) => {
    setRoom(createInitialRoom(width, height))
  }, [])

  const loadRoom = useCallback((newRoom: RoomState) => {
    // 古いセーブデータに z/scaleW/scaleH がない場合のデフォルト補完
    const furniture = newRoom.furniture.map(f => ({
      ...f,
      z: f.z ?? 0,
      scaleW: f.scaleW ?? 1,
      scaleH: f.scaleH ?? 1,
    }))
    setRoom({ ...newRoom, furniture })
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
    resetRoom,
    loadRoom,
  }
}
