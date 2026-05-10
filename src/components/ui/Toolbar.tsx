import { useRef, useState, useEffect, memo } from 'react'
import { ViewMode, EditTool, BitSettings } from '../../types'
import { PDFSettingsModal } from './PDFSettingsModal'

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

const WALL_TOOLS: EditTool[] = ['wallTop', 'wallRight', 'wallBottom', 'wallLeft', 'wallTopRight', 'wallTopLeft', 'wallBottomRight', 'wallBottomLeft']
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
      // すでに選択されている場合は解除
      next = selectedEdges.filter(e => e !== edge)
    } else {
      // 平行な辺がすでに選ばれているかチェック
      const isParallel = (e1: string, e2: string) => 
        (e1 === 'top' && e2 === 'bottom') || (e1 === 'bottom' && e2 === 'top') ||
        (e1 === 'left' && e2 === 'right') || (e1 === 'right' && e2 === 'left')

      if (selectedEdges.length === 1 && isParallel(selectedEdges[0], edge)) {
        // 平行な辺が選ばれたら、古い方を捨てて新しい方だけにする
        next = [edge]
      } else {
        // それ以外は最大2辺まで保持
        next = [...selectedEdges, edge].slice(-2)
      }
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
        {/* 四角形のガイド */}
        <div style={{ position: 'absolute', left: 20, top: 20, width: 60, height: 60, border: '2px dashed #3a3a5a', borderRadius: '4px' }} />
        
        {/* 各辺ボタン (ヒットエリアを拡大) */}
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

const MemoizedToolbar = memo(Toolbar)
export default MemoizedToolbar;

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
  const [showPDFModal, setShowPDFModal] = useState(false)
  const isWallActive = WALL_TOOLS.includes(tool)
  const isWindowActive = WINDOW_TOOLS.includes(tool)

  const ROTATION_LABELS = ['0°', '90°', '180°', '270°']

  return (
    <div
      style={{
        background: '#16162a',
        borderBottom: '3px solid #4a4e69',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        height: 48,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* ロゴ */}
      <div
        style={{
          fontSize: 10,
          color: '#e43f5a',
          letterSpacing: 2,
          marginRight: 8,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#e43f5a' }}>BIT</span>
        <span style={{ color: '#ffcc00', marginLeft: 6 }}>INT</span>
      </div>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      {/* ビュー切り替え */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          className={`pixel-btn ${viewMode === 'topdown' ? 'view-active' : ''}`}
          onClick={() => setViewMode('topdown')}
          title="BEVビュー"
        >
          BEV
        </button>
        <button
          className={`pixel-btn ${viewMode === 'isometric' ? 'view-active' : ''}`}
          onClick={() => setViewMode('isometric')}
          title="アイソメトリックビュー"
        >
          ISO
        </button>
        <button
          className={`pixel-btn ${viewMode === 'blueprint' ? 'view-active' : ''}`}
          onClick={() => setViewMode('blueprint')}
          title="図面モード"
        >
          PLAN
        </button>
      </div>

      {/* 編集ツール (BEV・図面モード) */}
      {(viewMode === 'topdown' || viewMode === 'blueprint') && (
        <>
          <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
            {/* FLOOR */}
            <button
              className={`pixel-btn ${tool === 'floor' ? 'active' : ''}`}
              onClick={() => setTool('floor')}
            >FLOOR</button>

            {/* WALL */}
            <button
              className={`pixel-btn ${isWallActive ? 'active' : ''}`}
              onClick={() => setShowWallPicker(true)}
            >
              WALL
            </button>
            {showWallPicker && (
              <WallEdgeSelector 
                currentTool={tool} 
                onSelect={setTool} 
                onClose={() => setShowWallPicker(false)} 
              />
            )}

            {/* WINDOW */}
            <button
              className={`pixel-btn ${isWindowActive ? 'active' : ''}`}
              onClick={() => setShowWindowPicker(true)}
            >
              WIN
            </button>
            {showWindowPicker && (
              <WindowEdgeSelector 
                currentTool={tool} 
                onSelect={setTool} 
                onClose={() => setShowWindowPicker(false)} 
              />
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
                className="pixel-btn tooltip"
                onClick={onRotate}
                data-tip="R key"
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
                className="pixel-btn danger"
                onClick={onDeleteSelected}
                title="Delete key"
              >
                ✕ DELETE
              </button>
            </>
          )}
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* 保存・読込ボタン */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          className="pixel-btn"
          onClick={onSave}
          title="ローカルに保存"
          style={{ color: '#00ff88', borderColor: '#00aa55' }}
        >
          SAVE
        </button>
        {hasSave && (
          <button
            className="pixel-btn"
            onClick={onLoad}
            title="保存データを読み込む"
            style={{ color: '#88aaff', borderColor: '#4466aa' }}
          >
            LOAD
          </button>
        )}
        <button
          className="pixel-btn"
          onClick={() => setShowPDFModal(true)}
          title="PDFとして図面を出力"
          style={{ color: '#ffcc00', borderColor: '#aa8800' }}
        >
          PDF
        </button>
        {showPDFModal && (
          <PDFSettingsModal 
            room={room}
            bitSettings={bitSettings}
            onClose={() => setShowPDFModal(false)} 
          />
        )}
        <button
          className="pixel-btn"
          onClick={onExport}
          title="JSONとしてダウンロード"
          style={{ color: '#ffcc00', borderColor: '#aa8800' }}
        >
          ↓JSON
        </button>
        <button
          className="pixel-btn"
          onClick={() => fileInputRef.current?.click()}
          title="JSONファイルを読み込む"
          style={{ color: '#ffcc00', borderColor: '#aa8800' }}
        >
          ↑JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) {
              onImport(file)
              e.target.value = ''
            }
          }}
        />
      </div>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      {/* Dark/Light トグル */}
      <button
        className="pixel-btn"
        onClick={onToggleDarkMode}
        title="Dark/Light切替"
        style={{ color: darkMode ? '#ffcc44' : '#4488ff', borderColor: darkMode ? '#aa8800' : '#2255aa' }}
      >
        {darkMode ? 'DARK' : 'LIGHT'}
      </button>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      {/* ビット設定 */}
      <button
        className="pixel-btn"
        onClick={onOpenSettings}
        title="ビット設定を変更"
        style={{ color: '#cc88ff', borderColor: '#7744aa' }}
      >
        ⚙ BIT
      </button>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      {/* ショートカットヘルプ */}
      <button
        className="pixel-btn"
        onClick={onToggleHelp}
        title="Shortcut list (? key)"
        style={{ color: '#88ccff', borderColor: '#446688' }}
      >
        ?
      </button>

      <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />

      {/* ステータス */}
      <div
        style={{
          fontSize: 8,
          color: '#7878aa',
          flexShrink: 0,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#e0e0ff' }}>
          1bit = <span style={{ color: '#ffcc00' }}>{bitSettings.size}{bitSettings.unit}</span>
        </span>
        <span style={{ color: '#4a4e69' }}>|</span>
        <span style={{ color: '#e0e0ff' }}>
          <span style={{ color: '#00ff88' }}>{roomSize.width}</span>
          <span style={{ color: '#4a4e69' }}>×</span>
          <span style={{ color: '#00ff88' }}>{roomSize.height}</span>
          <span style={{ color: '#7878aa' }}> bit</span>
        </span>
      </div>
    </div>
  )
}
