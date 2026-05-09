interface Props {
  currentColor: string
  onChange: (color: string) => void
}

const PRESETS = [
  // 木材系
  '#c8a060', '#a07840', '#7a5428', '#5a3810', '#3a2008',
  // グレー系
  '#e8e8e8', '#c0c0c0', '#909090', '#585858', '#282828',
  // ブルー系
  '#b8d8f0', '#6098d0', '#2858a0', '#10306a', '#081830',
  // グリーン系
  '#a8d8a8', '#58b858', '#1a7830', '#0a4018', '#051e0c',
  // レッド/暖色
  '#f0c0a8', '#e07850', '#c03818', '#801010', '#3a0808',
  // パープル/クール
  '#d0b8e8', '#9870c8', '#5830a0', '#301870', '#180840',
  // イエロー/オレンジ
  '#f0e080', '#d0a820', '#906800', '#503a00', '#281c00',
  // ティール/シアン
  '#90d8d0', '#30a8a0', '#107870', '#084840', '#042420',
]

export default function ColorPicker({ currentColor, onChange }: Props) {
  return (
    <div
      style={{
        padding: '8px 10px',
        borderTop: '2px solid #4a4e69',
        background: '#0f0f22',
      }}
    >
      <div
        style={{
          fontSize: 7,
          color: '#7878aa',
          marginBottom: 6,
          letterSpacing: 1,
        }}
      >
        COLOR
      </div>

      {/* プリセットカラーグリッド */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 2,
          marginBottom: 6,
        }}
      >
        {PRESETS.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            title={color}
            style={{
              width: '100%',
              aspectRatio: '1',
              background: color,
              border: currentColor.toLowerCase() === color.toLowerCase()
                ? '2px solid #ffffff'
                : '2px solid #2a2a3a',
              cursor: 'pointer',
              padding: 0,
              borderRadius: 0,
            }}
          />
        ))}
      </div>

      {/* カスタムカラー入力 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <input
          type="color"
          value={currentColor}
          onChange={e => onChange(e.target.value)}
          style={{
            width: 28,
            height: 22,
            padding: 0,
            border: '2px solid #4a4e69',
            cursor: 'pointer',
            background: 'none',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 6, color: '#5a5a8a', fontFamily: 'monospace' }}>
          {currentColor.toUpperCase()}
        </span>
      </div>
    </div>
  )
}
