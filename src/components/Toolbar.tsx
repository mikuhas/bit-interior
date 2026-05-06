import { useRef } from 'react'
import { ViewMode, EditTool, BitSettings } from '../types'

interface Props {
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  tool: EditTool
  setTool: (t: EditTool) => void
  furnitureRotation: 0 | 1 | 2 | 3
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
}

const TOOLS: { id: EditTool; label: string }[] = [
  { id: 'floor', label: 'FLOOR' },
  { id: 'wall', label: 'WALL' },
  { id: 'erase', label: 'ERASE' },
  { id: 'select', label: 'SELECT' },
  { id: 'furniture', label: 'PLACE' },
]

const ROTATION_LABELS = ['0°', '90°', '180°', '270°']

export default function Toolbar({
  viewMode,
  setViewMode,
  tool,
  setTool,
  furnitureRotation,
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
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          title="俯瞰ビュー"
        >
          俯瞰
        </button>
        <button
          className={`pixel-btn ${viewMode === 'isometric' ? 'view-active' : ''}`}
          onClick={() => setViewMode('isometric')}
          title="アイソメトリックビュー"
        >
          ISO
        </button>
      </div>

      {/* 編集ツール (俯瞰モードのみ) */}
      {viewMode === 'topdown' && (
        <>
          <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {TOOLS.map(t => (
              <button
                key={t.id}
                className={`pixel-btn ${tool === t.id ? 'active' : ''}`}
                onClick={() => setTool(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tool === 'furniture' && (
            <>
              <div style={{ width: 2, height: 28, background: '#4a4e69', flexShrink: 0 }} />
              <button
                className="pixel-btn tooltip"
                onClick={onRotate}
                data-tip="R key"
                style={{ color: '#ffcc00', borderColor: '#ffcc00' }}
              >
                ↻ {ROTATION_LABELS[furnitureRotation]}
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
