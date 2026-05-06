import { useState } from 'react'
import { BitSettings, BitUnit } from '../types'

interface Props {
  onSave: (settings: BitSettings, roomWidth: number, roomHeight: number) => void
}

export default function SettingsModal({ onSave }: Props) {
  const [size, setSize] = useState(30)
  const [unit, setUnit] = useState<BitUnit>('cm')
  const [roomWidth, setRoomWidth] = useState(12)
  const [roomHeight, setRoomHeight] = useState(10)

  const handleStart = () => {
    onSave({ size, unit }, roomWidth, roomHeight)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            className="glow-title"
            style={{
              fontSize: 22,
              color: '#e43f5a',
              letterSpacing: 4,
              marginBottom: 8,
              fontFamily: "'Press Start 2P', monospace",
              lineHeight: 1.4,
            }}
          >
            BIT
          </div>
          <div
            className="glow-title"
            style={{
              fontSize: 22,
              color: '#ffcc00',
              letterSpacing: 4,
              marginBottom: 20,
              fontFamily: "'Press Start 2P', monospace",
              lineHeight: 1.4,
            }}
          >
            INTERIOR
          </div>
          <div style={{ fontSize: 8, color: '#7878aa', marginBottom: 4 }}>
            ─────────────────────────
          </div>
          <div
            className="blink"
            style={{ fontSize: 9, color: '#00ff88', marginTop: 8 }}
          >
            INITIAL SETTINGS
          </div>
        </div>

        {/* 設定フォーム */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1bit サイズ */}
          <div>
            <label>1 BIT SIZE</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={size}
                  onChange={e => setSize(Number(e.target.value))}
                />
              </div>
              <div style={{ width: 120 }}>
                <select value={unit} onChange={e => setUnit(e.target.value as BitUnit)}>
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="inch">inch</option>
                </select>
              </div>
            </div>
          </div>

          {/* 部屋サイズ */}
          <div>
            <label>ROOM SIZE (BIT)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 7, marginBottom: 4 }}>WIDTH</label>
                <input
                  type="number"
                  min={4}
                  max={40}
                  value={roomWidth}
                  onChange={e => setRoomWidth(Number(e.target.value))}
                />
              </div>
              <div style={{ color: '#4a4e69', fontSize: 14, paddingTop: 12 }}>×</div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 7, marginBottom: 4 }}>HEIGHT</label>
                <input
                  type="number"
                  min={4}
                  max={40}
                  value={roomHeight}
                  onChange={e => setRoomHeight(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* プレビュー */}
          <div
            style={{
              background: '#0a0a18',
              border: '2px solid #4a4e69',
              padding: '8px 12px',
              fontSize: 8,
              color: '#7878aa',
            }}
          >
            <span style={{ color: '#e0e0ff' }}>
              {roomWidth} × {roomHeight} bits
            </span>
            <span style={{ margin: '0 8px', color: '#4a4e69' }}>|</span>
            <span style={{ color: '#e0e0ff' }}>
              {roomWidth * size}{unit} × {roomHeight * size}{unit}
            </span>
          </div>

          {/* スタートボタン */}
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <button
              className="pixel-btn"
              onClick={handleStart}
              style={{
                background: '#1a3a6a',
                borderColor: '#4a8aff',
                color: '#aaddff',
                fontSize: 11,
                padding: '12px 40px',
                boxShadow: '4px 4px 0 #001040',
                letterSpacing: 3,
              }}
            >
              ▶ START
            </button>
          </div>
        </div>

        {/* デコレーション */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 7, color: '#4a4e69' }}>
          v0.1.0 &nbsp;|&nbsp; 8BIT ROOM DESIGNER
        </div>
      </div>
    </div>
  )
}
