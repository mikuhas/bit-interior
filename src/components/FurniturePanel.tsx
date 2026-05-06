import { BitSettings, EditTool, PlacedFurniture } from '../types'
import { FURNITURE_TEMPLATES, getTemplate } from '../data/furniture'
import ColorPicker from './ColorPicker'

interface Props {
  selectedTemplateId: string | null
  onSelect: (id: string) => void
  tool: EditTool
  setTool: (t: EditTool) => void
  bitSettings: BitSettings
  selectedInstanceId: string | null
  placedFurniture: PlacedFurniture[]
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

export default function FurniturePanel({
  selectedTemplateId,
  onSelect,
  tool,
  setTool,
  bitSettings,
  selectedInstanceId,
  placedFurniture,
  onColorChange,
  onZChange,
  onScaleChange,
}: Props) {
  const handleSelect = (id: string) => {
    onSelect(id)
    setTool('furniture')
  }

  const selectedInstance = selectedInstanceId
    ? placedFurniture.find(f => f.instanceId === selectedInstanceId)
    : null
  const selectedTemplate = selectedInstance ? getTemplate(selectedInstance.templateId) : null
  const currentColor = selectedInstance?.colorOverride ?? selectedTemplate?.color ?? '#808080'
  const currentZ = selectedInstance?.z ?? 0
  const currentScaleW = selectedInstance?.scaleW ?? 1
  const currentScaleH = selectedInstance?.scaleH ?? 1

  const isSelectMode = tool === 'select' && selectedInstance !== null

  return (
    <div
      style={{
        width: 170,
        background: '#16162a',
        borderRight: '3px solid #4a4e69',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: '8px 10px',
          borderBottom: '2px solid #4a4e69',
          fontSize: 8,
          color: isSelectMode ? '#ffcc00' : '#7878aa',
          flexShrink: 0,
          letterSpacing: 1,
        }}
      >
        {isSelectMode ? 'PROPERTIES' : 'FURNITURE'}
      </div>

      {isSelectMode && selectedTemplate ? (
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
              onChange={e => onZChange(selectedInstanceId!, parseFloat(e.target.value))}
              style={sliderStyle}
            />
          </div>

          {/* サイズ */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #2a2a4a' }}>
            <div style={{ fontSize: 7, color: '#ff8844', letterSpacing: 1, marginBottom: 6 }}>SIZE</div>
            {(() => {
              const baseCols = selectedTemplate?.shape[0]?.length ?? 1
              const baseRows = selectedTemplate?.shape.length ?? 1
              const actualW = currentScaleW * baseCols
              const actualH = currentScaleH * baseRows
              const pmStyle: React.CSSProperties = {
                width: 18, height: 18, background: '#1a1a3a', border: '2px solid #4a4e69',
                color: '#e0e0ff', fontFamily: 'inherit', fontSize: 10, cursor: 'pointer', padding: 0,
              }
              return (
                <>
                  <div style={labelStyle}>幅 (W): {actualW} bit</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId!, Math.max(1, currentScaleW - 1), currentScaleH)}>-</button>
                    <input
                      type="range" min={1} max={10} step={1}
                      value={currentScaleW}
                      onChange={e => onScaleChange(selectedInstanceId!, parseInt(e.target.value), currentScaleH)}
                      style={{ ...sliderStyle, flex: 1 }}
                    />
                    <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId!, Math.min(10, currentScaleW + 1), currentScaleH)}>+</button>
                  </div>
                  <div style={{ ...labelStyle, marginTop: 2 }}>奥行 (H): {actualH} bit</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId!, currentScaleW, Math.max(1, currentScaleH - 1))}>-</button>
                    <input
                      type="range" min={1} max={10} step={1}
                      value={currentScaleH}
                      onChange={e => onScaleChange(selectedInstanceId!, currentScaleW, parseInt(e.target.value))}
                      style={{ ...sliderStyle, flex: 1 }}
                    />
                    <button style={pmStyle} onClick={() => onScaleChange(selectedInstanceId!, currentScaleW, Math.min(10, currentScaleH + 1))}>+</button>
                  </div>
                </>
              )
            })()}
          </div>

          {/* カラーピッカー */}
          <ColorPicker
            currentColor={currentColor}
            onChange={color => onColorChange(selectedInstanceId!, color)}
          />

          <div
            style={{
              padding: '6px 8px',
              marginTop: 'auto',
              borderTop: '2px solid #4a4e69',
              fontSize: 6,
              color: '#4a4e69',
              lineHeight: 1.8,
            }}
          >
            <div>[R] ROTATE</div>
            <div>[DEL] REMOVE</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
            {FURNITURE_TEMPLATES.map(tmpl => {
              const rows = tmpl.shape.length
              const cols = tmpl.shape[0].length
              const isSelected = selectedTemplateId === tmpl.id

              return (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelect(tmpl.id)}
                  style={{
                    width: '100%',
                    background: isSelected ? '#1a3a6a' : 'transparent',
                    border: isSelected ? '2px solid #4a8aff' : '2px solid transparent',
                    color: isSelected ? '#aaddff' : '#e0e0ff',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 2,
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8,
                    borderRadius: 0,
                    outline: 'none',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#22224a' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ width: 12, height: 12, background: tmpl.color, border: `2px solid ${tmpl.topColor}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 7, lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tmpl.nameJa}
                    </div>
                    <div style={{ fontSize: 6, color: '#7878aa', lineHeight: 1.4 }}>
                      {cols}×{rows}
                      {' '}
                      <span style={{ color: '#5a8aaa' }}>H:{Math.round(tmpl.height * bitSettings.size)}{bitSettings.unit}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div style={{ padding: '6px 8px', borderTop: '2px solid #4a4e69', fontSize: 6, color: '#4a4e69', lineHeight: 1.8 }}>
            <div>[R] ROTATE</div>
            <div>[DEL] REMOVE</div>
          </div>
        </>
      )}
    </div>
  )
}
