import { BitSettings, RoomState } from '../types'

const SAVE_KEY = 'bit-interior-v1'

interface SaveData {
  version: number
  bitSettings: BitSettings
  room: RoomState
}

export function saveToLocalStorage(bitSettings: BitSettings, room: RoomState): void {
  const data: SaveData = { version: 1, bitSettings, room }
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

export function loadFromLocalStorage(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (data.version !== 1) return null
    return data
  } catch {
    return null
  }
}

export function hasSaveData(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function exportAsJson(bitSettings: BitSettings, room: RoomState): void {
  const data: SaveData = { version: 1, bitSettings, room }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bit-interior-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromJson(file: File): Promise<SaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string) as SaveData
        if (data.version !== 1) reject(new Error('Unsupported version'))
        else resolve(data)
      } catch {
        reject(new Error('Invalid file'))
      }
    }
    reader.onerror = () => reject(new Error('Read error'))
    reader.readAsText(file)
  })
}
