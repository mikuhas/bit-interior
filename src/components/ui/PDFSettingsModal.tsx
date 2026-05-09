import { generateRoomPDF } from '../../utils/pdf'
import { RoomState, BitSettings } from '../../types'

export function PDFSettingsModal({ 
  room, 
  bitSettings, 
  onClose 
}: { 
  room: RoomState; 
  bitSettings: BitSettings; 
  onClose: () => void 
}) {
  const handleExport = (includeFurniture: boolean) => {
    generateRoomPDF(room, bitSettings, includeFurniture)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', top: '30%', left: '35%', background: '#16162a',
      border: '3px solid #4a4e69', padding: '20px', zIndex: 20000,
      fontFamily: "'Press Start 2P', monospace", color: '#fff', textAlign: 'center', width: 250
    }}>
      <div style={{ fontSize: 10, marginBottom: 20 }}>PDF Export Options</div>
      <button className="pixel-btn" style={{ width: '100%', marginBottom: 10 }} onClick={() => handleExport(true)}>With Furniture</button>
      <button className="pixel-btn" style={{ width: '100%', marginBottom: 10 }} onClick={() => handleExport(false)}>Structure Only</button>
      <button className="pixel-btn" onClick={onClose} style={{ width: '100%', background: '#444' }}>CANCEL</button>
    </div>
  )
}
