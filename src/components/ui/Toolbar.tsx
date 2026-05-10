import { useRef, useState, useEffect, memo } from 'react'
import { ViewMode, EditTool, BitSettings } from '../../types'
import { PDFSettingsModal } from './PDFSettingsModal'
import styles from './Toolbar.module.css'

interface Props {
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  tool: EditTool
  setTool: (t: EditTool) => void
  furnitureRotation: 0 | 1 | 2 | 3
  doorRotation: 0 | 1 | 2 | 3
  onRotate: () => void
  selectedInstanceId: string | null
  onDeleteSelected: () => void
  bitSettings: BitSettings
  roomSize: { width: number; height: number }
  room: any
  onSave: () => void
  onLoad: () => void
  onExport: () => void
  onImport: (file: File) => void
  hasSave: boolean
  onOpenSettings: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  onToggleHelp: () => void
}

const BASE_TOOLS: { id: EditTool; label: string }[] = [
  { id: 'floor', label: 'FLOOR' },
  { id: 'door', label: 'DOOR' },
  { id: 'erase', label: 'ERASE' },
  { id: 'select', label: 'SELECT' },
  { id: 'furniture', label: 'PLACE' },
]

const WALL_TOOLS: EditTool[] = [
  'wall', 'wallX', 'wallY', 'wallTop', 'wallRight', 'wallBottom', 'wallLeft',
  'wallTopRight', 'wallTopLeft', 'wallBottomRight', 'wallBottomLeft',
  'wallTopBottom', 'wallLeftRight',
  'wallTopRightBottom', 'wallRightBottomLeft', 'wallBottomLeftTop', 'wallLeftTopRight',
  'wallFull'
]
const WINDOW_TOOLS: EditTool[] = ['window', 'windowTop', 'windowRight', 'windowBottom', 'windowLeft']

function WindowEdgeSelector({ currentTool, onSelect, onClose }: { currentTool: EditTool; onSelect: (t: EditTool) => void; onClose: () => void }) {
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const selectWindow = (edge: 'top' | 'right' | 'bottom' | 'left' | 'none') => {
    if (edge === 'none') {
      onSelect('window')
    } else {
      const mapping: Record<string, EditTool> = {
        'top': 'windowTop',
        'right': 'windowRight',
        'bottom': 'windowBottom',
        'left': 'windowLeft'
      }
      onSelect(mapping[edge])
    }
  }

  const btnStyle = (edge: string, baseStyle: React.CSSProperties): React.CSSProperties => {
    const isSelected = (edge === 'none' && currentTool === 'window') || 
                       (edge === 'top' && currentTool === 'windowTop') ||
                       (edge === 'right' && currentTool === 'windowRight') ||
                       (edge === 'bottom' && currentTool === 'windowBottom') ||
                       (edge === 'left' && currentTool === 'windowLeft')
    
    return {
      ...baseStyle,
      position: 'absolute',
      cursor: 'pointer',
      background: isSelected ? '#00ff88' : '#2a2a4a',
      border: `2px solid ${isSelected ? '#fff' : '#4a4e69'}`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '8px',
      color: isSelected ? '#000' : '#7878aa',
      transition: 'all 0.15s ease',
      boxShadow: isSelected ? '0 0 10px rgba(0,255,136,0.5)' : 'none',
    }
  }

  return (
    <div 
      onPointerDown={e => {
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('.edge-btn')) return
        setIsDragging(true)
        dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={e => {
        if (!isDragging) return
        setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
      }}
      onPointerUp={() => setIsDragging(false)}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        background: '#16162a', border: '3px solid #6688cc', padding: '20px', zIndex: 10000,
        fontFamily: "'Press Start 2P', monospace", textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.7)',
        cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', width: 150, borderRadius: '8px'
      }}
    >
      <div style={{ fontSize: 6, color: '#88ccff', marginBottom: 20, pointerEvents: 'none', opacity: 0.7 }}>SELECT SIDE</div>
      
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
        <div style={{ position: 'absolute', left: 20, top: 20, width: 60, height: 60, border: '2px dashed #3a3a5a', borderRadius: '4px' }} />
        
        <div className="edge-btn" onClick={() => selectWindow('top')}    style={btnStyle('top',    { left: 20, top: 5,  width: 60, height: 10 })}></div>
        <div className="edge-btn" onClick={() => selectWindow('bottom')} style={btnStyle('bottom', { left: 20, top: 85, width: 60, height: 10 })}></div>
        <div className="edge-btn" onClick={() => selectWindow('left')}   style={btnStyle('left',   { left: 5,  top: 20, width: 10, height: 60 })}></div>
        <div className="edge-btn" onClick={() => selectWindow('right')}  style={btnStyle('right',  { left: 85, top: 20, width: 10, height: 60 })}></div>
        <div className="edge-btn" onClick={() => selectWindow('none')}   style={btnStyle('none',   { left: 35, top: 35, width: 30, height: 30 })}>C</div>
      </div>

      <button 
        className="pixel-btn" 
        onClick={onClose}
        style={{ width: '100%', background: '#444', color: '#fff', fontSize: 8, cursor: 'pointer', height: 32 }}
      >
        CLOSE
      </button>
    </div>
  )
}

const EDGE_MAP: Record<string, EditTool> = {
  'top': 'wallTop',
  'right': 'wallRight',
  'bottom': 'wallBottom',
  'left': 'wallLeft',
  'top,right': 'wallTopRight',
  'top,bottom': 'wallTopBottom',
  'top,left': 'wallTopLeft',
  'right,bottom': 'wallBottomRight',
  'right,left': 'wallLeftRight',
  'bottom,left': 'wallBottomLeft',
  'top,right,bottom': 'wallTopRightBottom',
  'top,right,left': 'wallLeftTopRight',
  'top,bottom,left': 'wallBottomLeftTop',
  'right,bottom,left': 'wallRightBottomLeft',
  'top,right,bottom,left': 'wallFull',
}

function WallEdgeSelector({ currentTool, onSelect, onClose }: { currentTool: EditTool; onSelect: (t: EditTool) => void; onClose: () => void }) {
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const getSelectedEdges = (): string[] => {
    switch (currentTool) {
      case 'wallTop': return ['top']
      case 'wallRight': return ['right']
      case 'wallBottom': return ['bottom']
      case 'wallLeft': return ['left']
      case 'wallTopRight': return ['top', 'right']
      case 'wallTopBottom': return ['top', 'bottom']
      case 'wallTopLeft': return ['top', 'left']
      case 'wallBottomRight': return ['right', 'bottom']
      case 'wallLeftRight': return ['right', 'left']
      case 'wallBottomLeft': return ['bottom', 'left']
      case 'wallTopRightBottom': return ['top', 'right', 'bottom']
      case 'wallLeftTopRight': return ['top', 'right', 'left']
      case 'wallBottomLeftTop': return ['top', 'bottom', 'left']
      case 'wallRightBottomLeft': return ['right', 'bottom', 'left']
      case 'wallFull': return ['top', 'right', 'bottom', 'left']
      default: return []
    }
  }

  const selectedEdges = getSelectedEdges()

  const toggleEdge = (edge: string) => {
    let next: string[] = []
    
    if (selectedEdges.includes(edge)) {
      next = selectedEdges.filter(e => e !== edge)
    } else {
      // 独立したトグルに変更（平行チェックを削除）
      next = [...selectedEdges, edge]
    }
    
    if (next.length === 0) {
      onSelect('floor')
      return
    }

    const order = ['top', 'right', 'bottom', 'left']
    const key = order.filter(o => next.includes(o)).join(',')
    const tool = EDGE_MAP[key]
    if (tool) onSelect(tool)
  }

  const WINDOW_MAP: Record<string, EditTool> = {
    'top': 'windowTop',
    'right': 'windowRight',
    'bottom': 'windowBottom',
    'left': 'windowLeft',
  }

  // WindowEdgeSelector のロジック修正
  const toggleWindowEdge = (edge: string) => {
    // 窓の場合はツールがウィンドウタイプか判定が必要
    // 既存の currentTool を利用して選択状態を計算
    const selectedWindowEdges = WINDOW_TOOLS.includes(currentTool) 
      ? Object.keys(WINDOW_MAP).filter(k => WINDOW_MAP[k] === currentTool).flatMap(k => k.split(','))
      : []

    let next: string[] = []
    if (selectedWindowEdges.includes(edge)) {
      next = selectedWindowEdges.filter((e: string) => e !== edge)
    } else {
      next = [...selectedWindowEdges, edge]
    }
    
    const order = ['top', 'right', 'bottom', 'left']
    const key = order.filter(o => next.includes(o)).join(',')
    const tool = WINDOW_MAP[key]
    if (tool) onSelect(tool)
    else if (next.length === 0) onSelect('window')
  }

  const btnStyle = (edge: string, baseStyle: React.CSSProperties): React.CSSProperties => ({
    ...baseStyle,
    position: 'absolute',
    cursor: 'pointer',
    background: selectedEdges.includes(edge) ? '#00ff88' : '#2a2a4a',
    border: `2px solid ${selectedEdges.includes(edge) ? '#fff' : '#4a4e69'}`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: selectedEdges.includes(edge) ? '#000' : '#7878aa',
    transition: 'all 0.15s ease',
    boxShadow: selectedEdges.includes(edge) ? '0 0 10px rgba(0,255,136,0.5)' : 'none',
  })

  return (
    <div 
      onPointerDown={e => {
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('.edge-btn')) return
        setIsDragging(true)
        dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={e => {
        if (!isDragging) return
        setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
      }}
      onPointerUp={() => setIsDragging(false)}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        background: '#16162a', border: '3px solid #4a4e69', padding: '20px', zIndex: 10000,
        fontFamily: "'Press Start 2P', monospace", textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.7)',
        cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', width: 150, borderRadius: '8px'
      }}
    >
      <div style={{ fontSize: 6, color: '#cc88ff', marginBottom: 20, pointerEvents: 'none', opacity: 0.7 }}>DRAG TO MOVE</div>
      
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
        <div style={{ position: 'absolute', left: 20, top: 20, width: 60, height: 60, border: '2px dashed #3a3a5a', borderRadius: '4px' }} />
        
        <div className="edge-btn" title="Top"    style={btnStyle('top',    { left: 20, top: 5,  width: 60, height: 10 })} onClick={() => toggleEdge('top')}></div>
        <div className="edge-btn" title="Bottom" style={btnStyle('bottom', { left: 20, top: 85, width: 60, height: 10 })} onClick={() => toggleEdge('bottom')}></div>
        <div className="edge-btn" title="Left"   style={btnStyle('left',   { left: 5,  top: 20, width: 10, height: 60 })} onClick={() => toggleEdge('left')}><div style={{ transform: 'rotate(-90deg)' }}></div></div>
        <div className="edge-btn" title="Right"  style={btnStyle('right',  { left: 85, top: 20, width: 10, height: 60 })} onClick={() => toggleEdge('right')}><div style={{ transform: 'rotate(90deg)' }}></div></div>
      </div>

      <button 
        className="pixel-btn" 
        onClick={onClose}
        style={{ width: '100%', background: '#444', color: '#fff', fontSize: 8, cursor: 'pointer', height: 32 }}
      >
        CLOSE
      </button>
    </div>
  )
}

function Toolbar({
  viewMode,
  setViewMode,
  tool,
  setTool,
  furnitureRotation,
  doorRotation,
  onRotate,
  selectedInstanceId,
  onDeleteSelected,
  bitSettings,
  roomSize,
  room,
  onSave,
  onLoad,
  onExport,
  onImport,
  hasSave,
  onOpenSettings,
  darkMode,
  onToggleDarkMode,
  onToggleHelp,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showWallPicker, setShowWallPicker] = useState(false)
  const [showWindowPicker, setShowWindowPicker] = useState(false)

  const openWallPicker = () => {
    setShowWallPicker(true)
    setShowWindowPicker(false)
  }

  const openWindowPicker = () => {
    setShowWindowPicker(true)
    setShowWallPicker(false)
  }

  // WallEdgeSelector/WindowEdgeSelector を呼び出すボタンの onClick を修正
  // <button onClick={openWallPicker}>WALL</button>
  // <button onClick={openWindowPicker}>WIN</button>

  // WallEdgeSelector 内で、選択時に setTool を適切に呼び出すように修正
  // 選択時 (toggleEdge) に setTool('wall...') を呼び出せば自動的に配置モードになるはず

  const [showPDFModal, setShowPDFModal] = useState(false)
  const isWallActive = WALL_TOOLS.includes(tool)
  const isWindowActive = WINDOW_TOOLS.includes(tool)

  const ROTATION_LABELS = ['0°', '90°', '180°', '270°']

  return (
    <div className={styles.toolbar}>
      <div className={styles.logo}>BIT <span style={{ color: '#ffcc00' }}>INT</span></div>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          className={`pixel-btn ${viewMode === 'topdown' ? 'view-active' : ''}`}
          onClick={() => setViewMode('topdown')}
        >
          BEV
        </button>
        <button
          className={`pixel-btn ${viewMode === 'isometric' ? 'view-active' : ''}`}
          onClick={() => setViewMode('isometric')}
        >
          ISO
        </button>
        <button
          className={`pixel-btn ${viewMode === 'blueprint' ? 'view-active' : ''}`}
          onClick={() => setViewMode('blueprint')}
        >
          PLAN
        </button>
      </div>

      {(viewMode === 'topdown' || viewMode === 'blueprint') && (
        <>
          <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
            <button
              className={`pixel-btn ${tool === 'floor' ? 'active' : ''}`}
              onClick={() => setTool('floor')}
            >FLOOR</button>

            <button
              className={`pixel-btn ${isWallActive ? 'active' : ''}`}
              onClick={openWallPicker}
            >WALL</button>
            {showWallPicker && (
              <WallEdgeSelector currentTool={tool} onSelect={setTool} onClose={() => setShowWallPicker(false)} />
            )}

            <button
              className={`pixel-btn ${isWindowActive ? 'active' : ''}`}
              onClick={openWindowPicker}
            >WIN</button>
            {showWindowPicker && (
              <WindowEdgeSelector currentTool={tool} onSelect={setTool} onClose={() => setShowWindowPicker(false)} />
            )}

            {BASE_TOOLS.slice(1).map(t => (
              <button
                key={t.id}
                className={`pixel-btn ${tool === t.id ? 'active' : ''}`}
                onClick={() => setTool(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {(tool === 'furniture' || tool === 'door') && (
            <>
              <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />
              <button
                className="pixel-btn"
                onClick={onRotate}
                style={{ color: '#ffcc00', borderColor: '#ffcc00' }}
              >
                ↻ {ROTATION_LABELS[tool === 'door' ? doorRotation : furnitureRotation]}
              </button>
            </>
          )}

          {tool === 'select' && selectedInstanceId && (
            <>
              <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />
              <button
                className="pixel-btn"
                onClick={onDeleteSelected}
              >
                ✕ DELETE
              </button>
            </>
          )}
        </>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button className="pixel-btn" onClick={onSave} style={{ color: '#00ff88', borderColor: '#00aa55' }}>SAVE</button>
        {hasSave && <button className="pixel-btn" onClick={onLoad} style={{ color: '#88aaff', borderColor: '#4466aa' }}>LOAD</button>}
        <button className="pixel-btn" onClick={() => setShowPDFModal(true)} style={{ color: '#ffcc00', borderColor: '#aa8800' }}>PDF</button>
        {showPDFModal && <PDFSettingsModal room={room} bitSettings={bitSettings} onClose={() => setShowPDFModal(false)} />}
        <button className="pixel-btn" onClick={onExport} style={{ color: '#ffcc00', borderColor: '#aa8800' }}>↓JSON</button>
        <button className="pixel-btn" onClick={() => fileInputRef.current?.click()} style={{ color: '#ffcc00', borderColor: '#aa8800' }}>↑JSON</button>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => { const file = e.target.files?.[0]; if (file) { onImport(file); e.target.value = '' } }} />
      </div>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      <button className="pixel-btn" onClick={onToggleDarkMode} style={{ color: darkMode ? '#ffcc44' : '#4488ff', borderColor: darkMode ? '#aa8800' : '#2255aa' }}>
        {darkMode ? 'DARK' : 'LIGHT'}
      </button>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      <button className="pixel-btn" onClick={onOpenSettings} style={{ color: '#cc88ff', borderColor: '#7744aa' }}>⚙ BIT</button>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      <button className="pixel-btn" onClick={onToggleHelp} style={{ color: '#88ccff', borderColor: '#446688' }}>?</button>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      <div className={styles.statusBar}>
        <span style={{ color: '#e0e0ff' }}>1bit = <span style={{ color: '#ffcc00' }}>{bitSettings.size}{bitSettings.unit}</span></span>
        <span style={{ color: '#4a4e69' }}>|</span>
        <span style={{ color: '#e0e0ff' }}>
          <span style={{ color: '#00ff88' }}>{roomSize.width}</span>×<span style={{ color: '#00ff88' }}>{roomSize.height}</span>
          <span style={{ color: '#7878aa' }}> bit</span>
        </span>
      </div>
    </div>
  )
}

export default memo(Toolbar)
