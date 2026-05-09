import { useState } from 'react'
import { BitSettings } from './types'
import SettingsModal from './components/ui/SettingsModal'
import RoomEditor from './components/RoomEditor'

export default function App() {
  const [showSettings, setShowSettings] = useState(true)
  const [bitSettings, setBitSettings] = useState<BitSettings>({ size: 30, unit: 'cm' })
  const [initialRoomSize, setInitialRoomSize] = useState({ width: 12, height: 10 })

  const handleSave = (settings: BitSettings, roomWidth: number, roomHeight: number) => {
    setBitSettings(settings)
    setInitialRoomSize({ width: roomWidth, height: roomHeight })
    setShowSettings(false)
  }

  if (showSettings) {
    return <SettingsModal onSave={handleSave} />
  }

  return (
    <RoomEditor
      bitSettings={bitSettings}
      onBitSettingsChange={setBitSettings}
      initialWidth={initialRoomSize.width}
      initialHeight={initialRoomSize.height}
    />
  )
}
