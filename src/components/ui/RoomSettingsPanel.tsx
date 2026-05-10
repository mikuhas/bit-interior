import { useState } from 'react'
import { BitSettings, BitUnit } from '../../types'
import { WindowStyle, DoorStyle } from '../../types/styles'
import styles from './RoomSettingsPanel.module.css'
import clsx from 'clsx'

interface Props {
  bitSettings: BitSettings
  onBitSettingsChange: (s: BitSettings) => void
  roomWidth: number
  roomHeight: number
  wallHeight: number
  doorHeight: number
  wallColor: string
  windowStyle: WindowStyle
  doorStyle: DoorStyle
  onApply: (settings: BitSettings, wallHeight: number, doorHeight: number, wallColor: string, roomW: number, roomH: number, windowStyle: WindowStyle, doorStyle: DoorStyle) => void
  onCancel: () => void
}

export default function RoomSettingsPanel({
  bitSettings,
  roomWidth,
  roomHeight,
  wallHeight,
  doorHeight,
  wallColor,
  windowStyle,
  doorStyle,
  onApply,
  onCancel,
}: Props) {
  const [editBitSize, setEditBitSize] = useState(bitSettings.size)
  const [editBitUnit, setEditBitUnit] = useState<BitUnit>(bitSettings.unit)
  const [editWallHeight, setEditWallHeight] = useState(wallHeight)
  const [editDoorHeight, setEditDoorHeight] = useState(doorHeight)
  const [editWallColor, setEditWallColor] = useState(wallColor)
  const [editRoomW, setEditRoomW] = useState(roomWidth)
  const [editRoomH, setEditRoomH] = useState(roomHeight)
  const [editWindowStyle, setEditWindowStyle] = useState<WindowStyle>(windowStyle)
  const [editDoorStyle, setEditDoorStyle] = useState<DoorStyle>(doorStyle)

  const handleApply = () => {
    onApply(
      { size: editBitSize, unit: editBitUnit },
      editWallHeight,
      editDoorHeight,
      editWallColor,
      editRoomW,
      editRoomH,
      editWindowStyle,
      editDoorStyle
    )
  }

  return (
    <div className={styles.panel}>
      <div className={clsx(styles.sectionTitle, styles.sectionTitleBit)}>BIT SETTINGS</div>

      <div className={styles.label}>1bit サイズ</div>
      <div className={styles.inputGroup}>
        <input
          type="number" min={1} max={999} value={editBitSize}
          onChange={e => setEditBitSize(Math.max(1, parseInt(e.target.value) || 1))}
          className={styles.inputNumber}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['cm', 'mm', 'inch'] as BitUnit[]).map(u => (
            <button
              key={u}
              onClick={() => setEditBitUnit(u)}
              className={clsx(styles.button, editBitUnit === u && styles.buttonActive)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2a2a4a', marginBottom: 8 }} />
      <div className={clsx(styles.sectionTitle, styles.sectionTitleRoom)}>ROOM</div>

      <div className={styles.label}>サイズ (bit)</div>
      <div className={styles.inputGroup}>
        {([['W', editRoomW, setEditRoomW], ['H', editRoomH, setEditRoomH]] as [string, number, (v: number) => void][]).map(([label, val, set]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 6, color: '#7878aa' }}>{label}:</span>
            <button onClick={() => set(Math.max(2, val - 1))} className={styles.button} style={{ width: 18, height: 18 }}>-</button>
            <span style={{ fontSize: 8, color: '#e0e0ff', minWidth: 22, textAlign: 'center' }}>{val}</span>
            <button onClick={() => set(Math.min(60, val + 1))} className={styles.button} style={{ width: 18, height: 18 }}>+</button>
          </div>
        ))}
      </div>

      <div className={styles.label}>壁の高さ: {editWallHeight} bit</div>
      <input
        type="range" min={1} max={8} step={1}
        value={editWallHeight}
        onChange={e => setEditWallHeight(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: '#44aaff', marginBottom: 10 }}
      />

      <div className={styles.label}>ドアの高さ: {editDoorHeight.toFixed(1)} bit</div>
      <input
        type="range" min={0.5} max={10} step={0.1}
        value={editDoorHeight}
        onChange={e => setEditDoorHeight(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#44ffaa', marginBottom: 10 }}
      />

      <div className={styles.label}>壁の色</div>
      <div className={styles.inputGroup}>
        <input
          type="color" value={editWallColor}
          onChange={e => setEditWallColor(e.target.value)}
          style={{ width: 36, height: 24, padding: 0, border: '2px solid #4a4e69', cursor: 'pointer', background: 'none' }}
        />
        <span style={{ fontSize: 6, color: '#5a5a8a', fontFamily: 'monospace' }}>{editWallColor.toUpperCase()}</span>
      </div>

      <div style={{ borderTop: '1px solid #2a2a4a', marginBottom: 8 }} />
      <div className={clsx(styles.sectionTitle, styles.sectionTitleStyles)}>STYLES</div>

      <div className={styles.label}>窓スタイル</div>
      <select value={editWindowStyle} onChange={e => setEditWindowStyle(e.target.value as WindowStyle)}
        className={styles.inputNumber} style={{ width: '100%', marginBottom: 8 }}>
        <option value="basic">Basic</option>
        <option value="modern">Modern</option>
        <option value="classic">Classic</option>
      </select>

      <div className={styles.label}>ドアスタイル</div>
      <select value={editDoorStyle} onChange={e => setEditDoorStyle(e.target.value as DoorStyle)}
        className={styles.inputNumber} style={{ width: '100%', marginBottom: 12 }}>
        <option value="basic">Basic</option>
        <option value="panel">Panel</option>
        <option value="glass">Glass</option>
      </select>

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={handleApply} className={styles.applyButton}>APPLY</button>
        <button onClick={onCancel} className={styles.cancelButton}>CANCEL</button>
      </div>
    </div>
  )
}
