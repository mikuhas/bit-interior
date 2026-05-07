import { useState, useCallback } from 'react'
import { BitSettings, EditTool, ViewMode, PlacedFurniture, CellType, BitUnit } from '../types'
import { useRoom } from '../hooks/useRoom'
import { saveToLocalStorage, loadFromLocalStorage, hasSaveData, exportAsJson, importFromJson } from '../utils/save'
import { canPlaceFurniture } from '../utils/room'
import { getTemplate } from '../data/furniture'
import Toolbar from './Toolbar'
import FurniturePanel from './FurniturePanel'
import TopDownCanvas from './TopDownCanvas'
import IsometricView from './IsometricView'

interface Props {
  bitSettings: BitSettings
  onBitSettingsChange: (s: BitSettings) => void
  initialWidth: number
  initialHeight: number
}

export default function RoomEditor({ bitSettings, onBitSettingsChange, initialWidth, initialHeight }: Props) {
  const {
    room, setCell, placeFurniture, moveFurniture, removeFurniture,
    updateFurnitureColor, updateFurnitureZ, updateFurnitureScale,
    updateRoomAppearance, resizeRoom, loadRoom,
  } = useRoom(initialWidth, initialHeight)

  const [viewMode, setViewMode] = useState<ViewMode>('topdown')
  const [tool, setTool] = useState<EditTool>('floor')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [furnitureRotation, setFurnitureRotation] = useState<0 | 1 | 2 | 3>(0)
  const [saveExists, setSaveExists] = useState(() => hasSaveData())
  const [saveFlash, setSaveFlash] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [editBitSize, setEditBitSize] = useState(bitSettings.size)
  const [editBitUnit, setEditBitUnit] = useState<BitUnit>(bitSettings.unit)
  const [editWallHeight, setEditWallHeight] = useState(3)
  const [editWallColor, setEditWallColor] = useState('#2d3050')
  const [editRoomW, setEditRoomW] = useState(initialWidth)
  const [editRoomH, setEditRoomH] = useState(initialHeight)

  const handleRotate = useCallback(() => {
    setFurnitureRotation(prev => ((prev + 1) % 4) as 0 | 1 | 2 | 3)
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (selectedInstanceId) {
      removeFurniture(selectedInstanceId)
      setSelectedInstanceId(null)
    }
  }, [selectedInstanceId, removeFurniture])

  const handleCellChange = useCallback(
    (row: number, col: number, type: CellType) => setCell(row, col, type), [setCell]
  )

  const handlePlaceFurniture = useCallback(
    (f: PlacedFurniture) => placeFurniture(f), [placeFurniture]
  )

  const handleSelectFurniture = useCallback((id: string | null) => {
    setSelectedInstanceId(id)
    if (id) setTool('select')
  }, [])

  const handleMoveFurniture = useCallback(
    (id: string, x: number, y: number) => {
      const pf = room.furniture.find(f => f.instanceId === id)
      if (!pf) return
      const tmpl = getTemplate(pf.templateId)
      if (!tmpl) return
      const valid = canPlaceFurniture(room, tmpl, x, y, pf.rotation, id, pf.scaleW ?? 1, pf.scaleH ?? 1)
      if (valid) moveFurniture(id, x, y)
    },
    [room, moveFurniture]
  )

  const handleSelectTemplate = useCallback((id: string) => {
    setSelectedTemplateId(id)
    setSelectedInstanceId(null)
  }, [])

  const handleSetTool = useCallback((t: EditTool) => {
    setTool(t)
    if (t !== 'furniture') setSelectedTemplateId(null)
    if (t !== 'select') setSelectedInstanceId(null)
  }, [])

  const handleScaleChange = useCallback((instanceId: string, scaleW: number, scaleH: number) => {
    updateFurnitureScale(instanceId, scaleW, scaleH)
  }, [updateFurnitureScale])

  // Save / Load
  const handleSave = useCallback(() => {
    saveToLocalStorage(bitSettings, room)
    setSaveExists(true)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1200)
  }, [bitSettings, room])

  const handleLoad = useCallback(() => {
    const data = loadFromLocalStorage()
    if (data) {
      loadRoom(data.room)
      if (data.bitSettings) onBitSettingsChange(data.bitSettings)
      setSelectedInstanceId(null)
      setSelectedTemplateId(null)
    }
  }, [loadRoom, onBitSettingsChange])

  const handleExport = useCallback(() => exportAsJson(bitSettings, room), [bitSettings, room])

  const handleImport = useCallback(async (file: File) => {
    try {
      const data = await importFromJson(file)
      loadRoom(data.room)
      if (data.bitSettings) onBitSettingsChange(data.bitSettings)
      setSelectedInstanceId(null)
      setSelectedTemplateId(null)
    } catch { /* silent */ }
  }, [loadRoom, onBitSettingsChange])

  const handleOpenSettings = useCallback(() => {
    setEditWallHeight(room.wallHeight ?? 3)
    setEditWallColor(room.wallColor ?? '#2d3050')
    setEditRoomW(room.width)
    setEditRoomH(room.height)
    setShowSettings(s => !s)
  }, [room.wallHeight, room.wallColor, room.width, room.height])

  const handleApplySettings = useCallback(() => {
    onBitSettingsChange({ size: editBitSize, unit: editBitUnit })
    updateRoomAppearance(editWallHeight, editWallColor)
    if (editRoomW !== room.width || editRoomH !== room.height) {
      resizeRoom(editRoomW, editRoomH)
    }
    setShowSettings(false)
  }, [editBitSize, editBitUnit, editWallHeight, editWallColor, editRoomW, editRoomH,
      room.width, room.height, onBitSettingsChange, updateRoomAppearance, resizeRoom])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: darkMode ? '#0f0f23' : '#c8d4e4', overflow: 'hidden' }}>
      <Toolbar
        viewMode={viewMode} setViewMode={setViewMode}
        tool={tool} setTool={handleSetTool}
        furnitureRotation={furnitureRotation} onRotate={handleRotate}
        selectedInstanceId={selectedInstanceId} onDeleteSelected={handleDeleteSelected}
        bitSettings={bitSettings} roomSize={{ width: room.width, height: room.height }}
        onSave={handleSave} onLoad={handleLoad} onExport={handleExport} onImport={handleImport}
        hasSave={saveExists} onOpenSettings={handleOpenSettings}
        darkMode={darkMode} onToggleDarkMode={() => setDarkMode(d => !d)}
      />

      {/* ビット設定パネル */}
      {showSettings && (
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
              onClick={handleApplySettings}
              style={{
                flex: 1, background: '#1a3a2a', border: '2px solid #00aa55',
                color: '#00ff88', fontFamily: 'inherit', fontSize: 7,
                padding: '5px 0', cursor: 'pointer',
              }}
            >
              APPLY
            </button>
            <button
              onClick={() => setShowSettings(false)}
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
      )}

      {/* Save flash */}
      {saveFlash && (
        <div style={{
          position: 'fixed', top: 60, right: 20,
          background: '#003322', border: '2px solid #00ff88', color: '#00ff88',
          padding: '6px 14px', fontSize: 9,
          fontFamily: "'Press Start 2P', monospace", zIndex: 100,
        }}>
          SAVED
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {viewMode === 'topdown' && (
          <FurniturePanel
            selectedTemplateId={selectedTemplateId}
            onSelect={handleSelectTemplate}
            tool={tool} setTool={handleSetTool}
            bitSettings={bitSettings}
            selectedInstanceId={selectedInstanceId}
            placedFurniture={room.furniture}
            onColorChange={updateFurnitureColor}
            onZChange={updateFurnitureZ}
            onScaleChange={handleScaleChange}
          />
        )}

        <div style={{
          flex: 1, overflow: 'auto', display: 'flex',
          alignItems: 'flex-start',
          justifyContent: viewMode === 'isometric' ? 'center' : 'flex-start',
          padding: 16, background: darkMode ? '#080912' : '#b8c8dc',
        }}>
          {viewMode === 'topdown' ? (
            <TopDownCanvas
              room={room} tool={tool}
              selectedTemplateId={selectedTemplateId}
              furnitureRotation={furnitureRotation}
              selectedInstanceId={selectedInstanceId}
              onCellChange={handleCellChange}
              onPlaceFurniture={handlePlaceFurniture}
              onSelectFurniture={handleSelectFurniture}
              onMoveFurniture={handleMoveFurniture}
              onKeyDelete={handleDeleteSelected}
              onRotate={handleRotate}
            />
          ) : (
            <IsometricView room={room} darkMode={darkMode} />
          )}
        </div>
      </div>

      <div className="status-bar">
        <span>MODE: <span style={{ color: '#ffcc00' }}>{viewMode === 'topdown' ? 'TOP DOWN' : 'ISOMETRIC'}</span></span>
        {viewMode === 'topdown' && (
          <>
            <span className="sep">|</span>
            <span>TOOL: <span style={{ color: '#00ff88' }}>{tool.toUpperCase()}</span></span>
            {tool === 'furniture' && selectedTemplateId && (
              <>
                <span className="sep">|</span>
                <span style={{ color: '#7878aa' }}>
                  ROTATE: <span style={{ color: '#e0e0ff' }}>[R]</span> {furnitureRotation * 90}°
                </span>
              </>
            )}
            {selectedInstanceId && tool === 'select' && (
              <>
                <span className="sep">|</span>
                <span style={{ color: '#7878aa' }}>
                  SELECTED <span style={{ color: '#ffff00' }}>✓</span>
                  {' | Z・サイズ・色: ←パネル | '}
                  <span style={{ color: '#e0e0ff' }}>[DEL]</span> REMOVE
                </span>
              </>
            )}
          </>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ color: '#4a4e69' }}>FURNITURE: <span style={{ color: '#e0e0ff' }}>{room.furniture.length}</span></span>
      </div>
    </div>
  )
}
