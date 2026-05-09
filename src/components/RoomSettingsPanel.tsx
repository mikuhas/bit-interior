import { BitSettings, BitUnit } from '../types'

interface Props {
  bitSettings: BitSettings
  onBitSettingsChange: (s: BitSettings) => void
  roomWidth: number
  roomHeight: number
  wallHeight: number
  wallColor: string
  onApply: (settings: BitSettings, wallHeight: number, wallColor: string, roomW: number, roomH: number) => void
  onCancel: () => void
  // Local state managed by the parent or passed down?
  // To keep it simple, we can manage local state here and only call onApply when done.
}

import { useState } from 'react'

export default function RoomSettingsPanel({
  bitSettings,
  roomWidth,
  roomHeight,
  wallHeight,
  wallColor,
  onApply,
  onCancel,
}: Props) {
  const [editBitSize, setEditBitSize] = useState(bitSettings.size)
  const [editBitUnit, setEditBitUnit] = useState<BitUnit>(bitSettings.unit)
  const [editWallHeight, setEditWallHeight] = useState(wallHeight)
  const [editWallColor, setEditWallColor] = useState(wallColor)
  const [editRoomW, setEditRoomW] = useState(roomWidth)
  const [editRoomH, setEditRoomH] = useState(roomHeight)

  const handleApply = () => {
    onApply(
      { size: editBitSize, unit: editBitUnit },
      editWallHeight,
      editWallColor,
      editRoomW,
      editRoomH
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 55, right: 16, zIndex: 200,
      background: '#16162a', border: '2px solid #4a4e69',
      padding: '12px 16px', minWidth: 220,
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <div style={{ fontSize: 8, color: '#cc88ff', marginBottom: 10, letterSpacing: 1 }}>BIT SETTINGS</div>

      <div style={{ fontSize: 6, color: '#7878aa', marginBottom: 4 }}>1bit サイズ</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <input
          type="number" min={1} max={999} value={editBitSize}
          onChange={e => setEditBitSize(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            width: 60, background: '#0f0f22', border: '2px solid #4a4e69',
            color: '#e0e0ff', fontFamily: 'inherit', fontSize: 8,
            padding: '3px 6px', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['cm', 'mm', 'inch'] as BitUnit[]).map(u => (
            <button
              key={u}
              onClick={() => setEditBitUnit(u)}
              style={{
                background: editBitUnit === u ? '#4a4e69' : 'transparent',
                border: `2px solid ${editBitUnit === u ? '#8888aa' : '#4a4e69'}`,
                color: editBitUnit === u ? '#fff' : '#7878aa',
                fontFamily: 'inherit', fontSize: 6, padding: '2px 5px', cursor: 'pointer',
              }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 6, color: '#7878aa', marginBottom: 8 }}>
        プレビュー: 1bit = {editBitSize}{editBitUnit}
      </div>

      <div style={{ borderTop: '1px solid #2a2a4a', marginBottom: 8 }} />
      <div style={{ fontSize: 8, color: '#44aaff', marginBottom: 8, letterSpacing: 1 }}>ROOM</div>

      <div style={{ fontSize: 6, color: '#7878aa', marginBottom: 4 }}>サイズ (bit)</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {([['W', editRoomW, setEditRoomW], ['H', editRoomH, setEditRoomH]] as [string, number, (v: number) => void][]).map(([label, val, set]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 6, color: '#7878aa' }}>{label}:</span>
            <button onClick={() => set(Math.max(2, val - 1))} style={{ width: 18, height: 18, background: '#1a1a3a', border: '2px solid #4a4e69', color: '#e0e0ff', fontFamily: 'inherit', fontSize: 10, cursor: 'pointer', padding: 0 }}>-</button>
            <span style={{ fontSize: 8, color: '#e0e0ff', minWidth: 22, textAlign: 'center' }}>{val}</span>
            <button onClick={() => set(Math.min(60, val + 1))} style={{ width: 18, height: 18, background: '#1a1a3a', border: '2px solid #4a4e69', color: '#e0e0ff', fontFamily: 'inherit', fontSize: 10, cursor: 'pointer', padding: 0 }}>+</button>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 6, color: '#7878aa', marginBottom: 4 }}>壁の高さ: {editWallHeight} bit</div>
      <input
        type="range" min={1} max={8} step={1}
        value={editWallHeight}
        onChange={e => setEditWallHeight(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: '#44aaff', marginBottom: 10 }}
      />

      <div style={{ fontSize: 6, color: '#7878aa', marginBottom: 4 }}>壁の色</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <input
          type="color" value={editWallColor}
          onChange={e => setEditWallColor(e.target.value)}
          style={{ width: 36, height: 24, padding: 0, border: '2px solid #4a4e69', cursor: 'pointer', background: 'none' }}
        />
        <span style={{ fontSize: 6, color: '#5a5a8a', fontFamily: 'monospace' }}>{editWallColor.toUpperCase()}</span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={handleApply}
          style={{
            flex: 1, background: '#1a3a2a', border: '2px solid #00aa55',
            color: '#00ff88', fontFamily: 'inherit', fontSize: 7,
            padding: '5px 0', cursor: 'pointer',
          }}
        >
          APPLY
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1, background: 'transparent', border: '2px solid #4a4e69',
            color: '#7878aa', fontFamily: 'inherit', fontSize: 7,
            padding: '5px 0', cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}
