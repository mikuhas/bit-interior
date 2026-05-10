import { useState } from 'react'
import { BitSettings, BitUnit } from '../../types'
import styles from './SettingsModal.module.css'

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
    <div className={styles.container}>
      <div className={styles.title}>BIT INTERIOR</div>
      
      {/* 設定フォーム */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 7, color: '#7878aa' }}>1 BIT SIZE</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input type="number" value={size} onChange={e => setSize(Number(e.target.value))} />
            <select value={unit} onChange={e => setUnit(e.target.value as BitUnit)}>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="inch">inch</option>
            </select>
          </div>
        </div>

        <button onClick={handleStart} className={styles.button}>▶ START</button>
      </div>
    </div>
  )
}
