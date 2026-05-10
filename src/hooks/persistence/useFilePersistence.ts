import { useCallback } from 'react'
import { BitSettings, RoomState } from '../../types'
import { 
  useSaveRoomMutation, 
  useLoadRoomQuery, 
  useExportRoomMutation, 
  useImportRoomMutation 
} from './usePersistence'

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
  const saveMutation = useSaveRoomMutation()
  const exportMutation = useExportRoomMutation()
  const importMutation = useImportRoomMutation()
  
  // Load Query is manual, so we trigger refetch via manual interaction
  const loadQuery = useLoadRoomQuery(false)

  const handleSave = useCallback(() => {
    saveMutation.mutate({ bitSettings, room }, { onSuccess: onFlash })
  }, [bitSettings, room, onFlash, saveMutation])

  const handleLoad = useCallback(async () => {
    const data = await loadQuery.refetch()
    if (data.data && typeof data.data === 'object' && 'room' in data.data) {
      const payload = data.data as { room: RoomState, bitSettings?: BitSettings }
      onRoomLoad(payload.room)
      if (payload.bitSettings) onSettingsLoad(payload.bitSettings)
    }
  }, [loadQuery, onRoomLoad, onSettingsLoad])

  const handleExport = useCallback(() => {
    exportMutation.mutate({ bitSettings, room })
  }, [bitSettings, room, exportMutation])

  const handleImport = useCallback(async (file: File) => {
    try {
      const data = await importMutation.mutateAsync(file)
      onRoomLoad(data.room)
      if (data.bitSettings) onSettingsLoad(data.bitSettings)
    } catch (e) {
      console.error('Import failed', e)
    }
  }, [importMutation, onRoomLoad, onSettingsLoad])

  return {
    handleSave,
    handleLoad,
    handleExport,
    handleImport,
  }
}
