import { useMutation, useQuery } from '@tanstack/react-query'
import { BitSettings, RoomState } from '../../types'
import { saveToLocalStorage, loadFromLocalStorage, exportAsJson, importFromJson } from '../../utils/save'

export const useSaveRoomMutation = () => {
  return useMutation({
    mutationFn: async ({ bitSettings, room }: { bitSettings: BitSettings, room: RoomState }) => {
      saveToLocalStorage(bitSettings, room)
    },
  })
}

export const useLoadRoomQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: ['roomData'],
    queryFn: () => loadFromLocalStorage(),
    enabled,
    staleTime: 0,
  })
}

export const useExportRoomMutation = () => {
  return useMutation({
    mutationFn: async ({ bitSettings, room }: { bitSettings: BitSettings, room: RoomState }) => {
      exportAsJson(bitSettings, room)
    },
  })
}

export const useImportRoomMutation = () => {
  return useMutation({
    mutationFn: async (file: File) => importFromJson(file),
  })
}
