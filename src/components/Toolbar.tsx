import { useRef, useState, useEffect } from 'react'
import { ViewMode, EditTool, BitSettings } from '../types'

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
  { id: 'window', label: 'WIN' },
  { id: 'erase', label: 'ERASE' },
  { id: 'select', label: 'SELECT' },
  { id: 'furniture', label: 'PLACE' },
]

const WALL_TOOLS: EditTool[] = ['wallTop', 'wallRight', 'wallBottom', 'wallLeft', 'wallTopRight', 'wallTopLeft', 'wallBottomRight', 'wallBottomLeft']

const WALL_ICON: Partial<Record<EditTool, string>> = {
  wallTop: '▲', wallRight: '▶', wallBottom: '▼', wallLeft: '◀',
  wallTopRight: '◥', wallTopLeft: '◤', wallBottomRight: '◢', wallBottomLeft: '◣',
}

const ROTATION_LABELS = ['0°', '90°', '180°', '270°']

function WallEdgeBtn({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 20, height: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? '#4a4e69' : '#2a2a4a',
        border: `1px solid ${active ? '#8888cc' : '#4a4e69'}`,
        color: active ? '#ffffff' : '#9090bb',
        fontSize: 8,
        cursor: 'pointer',
        fontFamily: "'Press Start 2P', monospace",
        userSelect: 'none',
        lineHeight: 1,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#3a3a60'; e.currentTarget.style.color = '#c0c0e0' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = '#2a2a4a'; e.currentTarget.style.color = '#9090bb' } }}
    >
      {label}
    </div>
  )
}

export default function Toolbar({
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
  const wallBtnRef = useRef<HTMLDivElement>(null)
  const [showWallPicker, setShowWallPicker] = useState(false)
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const isWallActive = WALL_TOOLS.includes(tool)

  useEffect(() => {
    if (!isWallActive) setShowWallPicker(false)
  }, [isWallActive])

  useEffect(() => {
    if (!showWallPicker) return
    const handler = (e: MouseEvent) => {
      if (wallBtnRef.current && !wallBtnRef.current.contains(e.target as Node)) {
        setShowWallPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showWallPicker])

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

            {/* WALL + picker */}
            <div ref={wallBtnRef}>
              <button
                className={`pixel-btn ${isWallActive ? 'active' : ''}`}
                onClick={() => {
                  if (!showWallPicker && wallBtnRef.current) {
                    const r = wallBtnRef.current.getBoundingClientRect()
                    setPickerPos({ x: r.left, y: r.bottom + 4 })
                  }
                  setShowWallPicker(p => !p)
                }}
              >
                WALL{isWallActive ? ` ${WALL_ICON[tool] ?? ''}` : ''}
              </button>
              {showWallPicker && (
                <div style={{
                  position: 'fixed',
                  left: pickerPos.x,
                  top: pickerPos.y,
                  background: '#16162a',
                  border: '2px solid #4a4e69',
                  padding: 4,
                  zIndex: 9999,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 20px)',
                  gridTemplateRows: 'repeat(3, 20px)',
                  gap: 2,
                }}>
                  <WallEdgeBtn id="wallTopLeft"     label="◤" active={tool === 'wallTopLeft'}     onClick={() => { setTool('wallTopLeft');     setShowWallPicker(false) }} />
                  <WallEdgeBtn id="wallTop"          label="▲" active={tool === 'wallTop'}          onClick={() => { setTool('wallTop');          setShowWallPicker(false) }} />
                  <WallEdgeBtn id="wallTopRight"    label="◥" active={tool === 'wallTopRight'}    onClick={() => { setTool('wallTopRight');    setShowWallPicker(false) }} />
                  <WallEdgeBtn id="wallLeft"         label="◀" active={tool === 'wallLeft'}         onClick={() => { setTool('wallLeft');         setShowWallPicker(false) }} />
                  <div style={{ background: '#0c0c1e', border: '1px dashed #3a3a5a' }} />
                  <WallEdgeBtn id="wallRight"        label="▶" active={tool === 'wallRight'}        onClick={() => { setTool('wallRight');        setShowWallPicker(false) }} />
                  <WallEdgeBtn id="wallBottomLeft"  label="◣" active={tool === 'wallBottomLeft'}  onClick={() => { setTool('wallBottomLeft');  setShowWallPicker(false) }} />
                  <WallEdgeBtn id="wallBottom"       label="▼" active={tool === 'wallBottom'}       onClick={() => { setTool('wallBottom');       setShowWallPicker(false) }} />
                  <WallEdgeBtn id="wallBottomRight" label="◢" active={tool === 'wallBottomRight'} onClick={() => { setTool('wallBottomRight'); setShowWallPicker(false) }} />
                </div>
              )}
            </div>

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
