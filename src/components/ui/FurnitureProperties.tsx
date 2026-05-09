import { BitSettings, PlacedFurniture } from '../../types'
import { getTemplate } from '../../data/furniture'
import ColorPicker from './ColorPicker'

interface Props {
  selectedInstanceId: string
  placedFurniture: PlacedFurniture[]
  bitSettings: BitSettings
  onColorChange: (instanceId: string, color: string) => void
  onZChange: (instanceId: string, z: number) => void
  onScaleChange: (instanceId: string, scaleW: number, scaleH: number) => void
}

const sliderStyle: React.CSSProperties = {
  width: '100%',
  accentColor: '#4a8aff',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: 6,
  color: '#7878aa',
  letterSpacing: 1,
  marginBottom: 2,
}

export default function FurnitureProperties({
  selectedInstanceId,
  placedFurniture,
  bitSettings,
  onColorChange,
  onZChange,
  onScaleChange,
}: Props) {
  const selectedInstance = placedFurniture.find(f => f.instanceId === selectedInstanceId)
  const selectedTemplate = selectedInstance ? getTemplate(selectedInstance.templateId) : null
  
  if (!selectedInstance || !selectedTemplate) return null

  const currentColor = selectedInstance.colorOverride ?? selectedTemplate.color ?? '#808080'
  const currentZ = selectedInstance.z ?? 0
  const currentScaleW = selectedInstance.scaleW ?? 1
  const currentScaleH = selectedInstance.scaleH ?? 1

  const baseCols = selectedTemplate.shape[0]?.length ?? 1
  const baseRows = selectedTemplate.shape.length ?? 1
  const actualW = currentScaleW * baseCols
  const actualH = currentScaleH * baseRows
  
  const pmStyle: React.CSSProperties = {
    width: 18, height: 18, background: '#1a1a3a', border: '2px solid #4a4e69',
    color: '#e0e0ff', fontFamily: 'inherit', fontSize: 10, cursor: 'pointer', padding: 0,
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* 家具名 */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 14, height: 14, background: currentColor, border: '2px solid #6a6a9a', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 7, color: '#e0e0ff', lineHeight: 1.6 }}>{selectedTemplate.nameJa}</div>
          <div style={{ fontSize: 6, color: '#7878aa' }}>
            H:{Math.round(selectedTemplate.height * bitSettings.size)}{bitSettings.unit}
          </div>
        </div>
      </div>

      {/* XYZスライダー */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #2a2a4a' }}>
        <div style={{ fontSize: 7, color: '#5555ff', letterSpacing: 1, marginBottom: 6 }}>Z-AXIS</div>
        <div style={labelStyle}>Z (高さ位置): {currentZ.toFixed(1)} bit</div>
        <input
          type="range" min={0} max={10} step={0.5}
          value={currentZ}
          onChange={e => onZChange(selectedInstanceId, parseFloat(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* サイズ */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #2a2a4a' }}>
        <div style={{ fontSize: 7, color: '#ff8844', letterSpacing: 1, marginBottom: 6 }}>SIZE</div>
        <div style={labelStyle}>幅 (W): {actualW} bit</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId, Math.max(1, currentScaleW - 1), currentScaleH)}>-</button>
          <input
            type="range" min={1} max={10} step={1}
            value={currentScaleW}
            onChange={e => onScaleChange(selectedInstanceId, parseInt(e.target.value), currentScaleH)}
            style={{ ...sliderStyle, flex: 1 }}
          />
          <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId, Math.min(10, currentScaleW + 1), currentScaleH)}>+</button>
        </div>
        <div style={{ ...labelStyle, marginTop: 2 }}>奥行 (H): {actualH} bit</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId, currentScaleW, Math.max(1, currentScaleH - 1))}>-</button>
          <input
            type="range" min={1} max={10} step={1}
            value={currentScaleH}
            onChange={e => onScaleChange(selectedInstanceId, currentScaleW, parseInt(e.target.value))}
            style={{ ...sliderStyle, flex: 1 }}
          />
          <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId, currentScaleW, Math.min(10, currentScaleH + 1))}>+</button>
        </div>
      </div>

      {/* カラーピッカー */}
      <ColorPicker
        currentColor={currentColor}
        onChange={color => onColorChange(selectedInstanceId, color)}
      />
    </div>
  )
}
