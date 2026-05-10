interface Props { onClose: () => void }

const GROUPS = [
  { label: 'TOOL', items: [
    { key: 'F', desc: 'Floor' },
    { key: 'W', desc: 'Wall' },
    { key: 'D', desc: 'Door' },
    { key: 'N', desc: 'Window' },
    { key: 'E', desc: 'Erase' },
    { key: 'S', desc: 'Select' },
    { key: 'P', desc: 'Place' },
  ]},
  { label: 'VIEW', items: [
    { key: '1', desc: 'Top-down' },
    { key: '2', desc: 'Isometric' },
    { key: '3', desc: 'Blueprint' },
  ]},
  { label: 'ACTION', items: [
    { key: 'Ctrl+Z', desc: 'Undo' },
    { key: 'Ctrl+S', desc: 'Save' },
    { key: 'R',      desc: 'Rotate' },
    { key: 'M',      desc: 'Mirror' },
    { key: 'Del',    desc: 'Delete' },
    { key: 'Esc',    desc: 'Deselect' },
    { key: '?',      desc: 'This list' },
  ]},
]

export default function ShortcutHelp({ onClose }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 40, right: 16, zIndex: 500,
      background: '#16162a', border: '2px solid #4a4e69',
      padding: '8px 12px',
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 8, color: '#ffcc00', letterSpacing: 1 }}>SHORTCUTS</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#7878aa', cursor: 'pointer', fontSize: 8, fontFamily: 'inherit', padding: 0 }}
        >✕</button>
      </div>
      {GROUPS.map(g => (
        <div key={g.label}>
          <div style={{ fontSize: 5, color: '#4a4e69', marginTop: 6, marginBottom: 3, letterSpacing: 1 }}>{g.label}</div>
          {g.items.map(({ key, desc }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
              <span style={{
                fontSize: 6, color: '#e0e0ff',
                background: '#2a2a4a', border: '1px solid #4a4e69',
                padding: '1px 5px', minWidth: 40, textAlign: 'center',
              }}>{key}</span>
              <span style={{ fontSize: 6, color: '#7878aa' }}>{desc}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
