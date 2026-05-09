import { FURNITURE_TEMPLATES } from '../data/furniture'
import { BitSettings } from '../types'

interface Props {
  selectedTemplateId: string | null
  onSelect: (id: string) => void
  bitSettings: BitSettings
}

export default function FurnitureList({ selectedTemplateId, onSelect, bitSettings }: Props) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
      {FURNITURE_TEMPLATES.map(tmpl => {
        const rows = tmpl.shape.length
        const cols = tmpl.shape[0].length
        const isSelected = selectedTemplateId === tmpl.id

        return (
          <button
            key={tmpl.id}
            onClick={() => onSelect(tmpl.id)}
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
  )
}
