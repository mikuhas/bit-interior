import { BitSettings, EditTool, PlacedFurniture } from '../types'
import FurnitureList from './FurnitureList'
import FurnitureProperties from './FurnitureProperties'

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

  const isSelectMode = tool === 'select' && selectedInstanceId !== null

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

      {isSelectMode ? (
        <FurnitureProperties
          selectedInstanceId={selectedInstanceId!}
          placedFurniture={placedFurniture}
          bitSettings={bitSettings}
          onColorChange={onColorChange}
          onZChange={onZChange}
          onScaleChange={onScaleChange}
        />
      ) : (
        <FurnitureList
          selectedTemplateId={selectedTemplateId}
          onSelect={handleSelect}
          bitSettings={bitSettings}
        />
      )}

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
  )
}
