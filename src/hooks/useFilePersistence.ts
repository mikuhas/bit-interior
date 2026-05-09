import { useCallback } from 'react'
import { BitSettings, RoomState } from '../types'
import { saveToLocalStorage, loadFromLocalStorage, exportAsJson, importFromJson } from '../utils/save'

interface Options {
  bitSettings: BitSettings
  room: RoomState
  onRoomLoad: (room: RoomState) => void
  onSettingsLoad: (settings: BitSettings) => void
  onFlash: () => void
}

export function useFilePersistence({
  bitSettings,
  room,
  onRoomLoad,
  onSettingsLoad,
  onFlash,
}: Options) {
  const handleSave = useCallback(() => {
    saveToLocalStorage(bitSettings, room)
    onFlash()
  }, [bitSettings, room, onFlash])

  const handleLoad = useCallback(() => {
    const data = loadFromLocalStorage()
    if (data) {
      onRoomLoad(data.room)
      if (data.bitSettings) onSettingsLoad(data.bitSettings)
    }
  }, [onRoomLoad, onSettingsLoad])

  const handleExport = useCallback(() => {
    exportAsJson(bitSettings, room)
  }, [bitSettings, room])

  const handleImport = useCallback(async (file: File) => {
    try {
      const data = await importFromJson(file)
      onRoomLoad(data.room)
      if (data.bitSettings) onSettingsLoad(data.bitSettings)
    } catch (e) {
      console.error('Import failed', e)
    }
  }, [onRoomLoad, onSettingsLoad])

  return {
    handleSave,
    handleLoad,
    handleExport,
    handleImport,
  }
}
