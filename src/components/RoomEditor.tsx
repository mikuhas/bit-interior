import { useState, useCallback, useMemo } from 'react'
import { BitSettings, PlacedFurniture } from '../types'
import { useRoom } from '../hooks/useRoom'
import { useEditorState } from '../hooks/useEditorState'
import { useFilePersistence } from '../hooks/useFilePersistence'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { hasSaveData } from '../utils/save'
import { canPlaceFurniture } from '../utils/room'
import { getTemplate } from '../data/furniture'
import Toolbar from './Toolbar'
import FurniturePanel from './FurniturePanel'
import TopDownCanvas from './TopDownCanvas'
import IsometricView from './IsometricView'
import ShortcutHelp from './ShortcutHelp'
import RoomSettingsPanel from './RoomSettingsPanel'

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
    beginInteraction, undo, redo,
  } = useRoom(initialWidth, initialHeight)

  const {
    viewMode, setViewMode,
    tool, handleSetTool,
    selectedTemplateId, handleSelectTemplate,
    selectedInstanceId, handleSelectInstance,
    furnitureRotation, doorRotation, rotate,
    showSettings, setShowSettings, toggleSettings,
    showHelp, setShowHelp, toggleHelp,
    darkMode, toggleDarkMode,
  } = useEditorState()

  const [saveExists, setSaveExists] = useState(() => hasSaveData())
  const [saveFlash, setSaveFlash] = useState(false)

  const handleFlash = useCallback(() => {
    setSaveExists(true)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1200)
  }, [])

  const { handleSave, handleLoad, handleExport, handleImport } = useFilePersistence({
    bitSettings, room, onRoomLoad: loadRoom, onSettingsLoad: onBitSettingsChange, onFlash: handleFlash
  })

  const shortcutActions = useMemo(() => ({
    undo, redo, onSave: handleSave, 
    onSelectInstance: handleSelectInstance, onSelectTemplate: (id: string | null) => handleSelectTemplate(id ?? ''),
    toggleHelp, setViewMode, setTool: handleSetTool
  }), [undo, redo, handleSave, handleSelectInstance, handleSelectTemplate, toggleHelp, setViewMode, handleSetTool])

  useKeyboardShortcuts(shortcutActions)

  const handleDeleteSelected = useCallback(() => {
    if (selectedInstanceId) {
      removeFurniture(selectedInstanceId)
      handleSelectInstance(null)
    }
  }, [selectedInstanceId, removeFurniture, handleSelectInstance])

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

  const handleApplySettings = useCallback((
    newSettings: BitSettings,
    newWallHeight: number,
    newWallColor: string,
    newRoomW: number,
    newRoomH: number
  ) => {
    onBitSettingsChange(newSettings)
    updateRoomAppearance(newWallHeight, newWallColor)
    if (newRoomW !== room.width || newRoomH !== room.height) {
      resizeRoom(newRoomW, newRoomH)
    }
    setShowSettings(false)
  }, [room.width, room.height, onBitSettingsChange, updateRoomAppearance, resizeRoom, setShowSettings])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: darkMode ? '#0f0f23' : '#c8d4e4', overflow: 'hidden' }}>
      <Toolbar
        viewMode={viewMode} setViewMode={setViewMode}
        tool={tool} setTool={handleSetTool}
        furnitureRotation={furnitureRotation} doorRotation={doorRotation} onRotate={rotate}
        selectedInstanceId={selectedInstanceId} onDeleteSelected={handleDeleteSelected}
        bitSettings={bitSettings} roomSize={{ width: room.width, height: room.height }}
        onSave={handleSave} onLoad={handleLoad} onExport={handleExport} onImport={handleImport}
        hasSave={saveExists} onOpenSettings={toggleSettings}
        darkMode={darkMode} onToggleDarkMode={toggleDarkMode}
        onToggleHelp={toggleHelp}
      />

      {showSettings && (
        <RoomSettingsPanel
          bitSettings={bitSettings}
          onBitSettingsChange={onBitSettingsChange}
          roomWidth={room.width}
          roomHeight={room.height}
          wallHeight={room.wallHeight ?? 3}
          wallColor={room.wallColor ?? '#2d3050'}
          onApply={handleApplySettings}
          onCancel={() => setShowSettings(false)}
        />
      )}

      {showHelp && <ShortcutHelp onClose={toggleHelp} />}

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
        {(viewMode === 'topdown' || viewMode === 'blueprint') && (
          <FurniturePanel
            selectedTemplateId={selectedTemplateId}
            onSelect={handleSelectTemplate}
            tool={tool} setTool={handleSetTool}
            bitSettings={bitSettings}
            selectedInstanceId={selectedInstanceId}
            placedFurniture={room.furniture}
            onColorChange={updateFurnitureColor}
            onZChange={updateFurnitureZ}
            onScaleChange={updateFurnitureScale}
          />
        )}

        <div style={{
          flex: 1, overflow: 'auto', display: 'flex',
          alignItems: 'flex-start',
          justifyContent: viewMode === 'isometric' ? 'center' : 'flex-start',
          padding: 16, background: darkMode ? '#080912' : '#b8c8dc',
        }}>
          {viewMode === 'isometric' ? (
            <IsometricView room={room} darkMode={darkMode} />
          ) : (
            <TopDownCanvas
              room={room} tool={tool}
              selectedTemplateId={selectedTemplateId}
              furnitureRotation={furnitureRotation}
              doorRotation={doorRotation}
              selectedInstanceId={selectedInstanceId}
              onCellChange={setCell}
              onPlaceFurniture={placeFurniture}
              onSelectFurniture={handleSelectInstance}
              onMoveFurniture={handleMoveFurniture}
              onKeyDelete={handleDeleteSelected}
              onRotate={rotate}
              onInteractionStart={beginInteraction}
              blueprintMode={viewMode === 'blueprint'}
            />
          )}
        </div>
      </div>

      <div className="status-bar">
        <span>MODE: <span style={{ color: '#ffcc00' }}>{viewMode === 'topdown' ? 'TOP DOWN' : viewMode === 'isometric' ? 'ISOMETRIC' : 'BLUEPRINT'}</span></span>
        {(viewMode === 'topdown' || viewMode === 'blueprint') && (
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
