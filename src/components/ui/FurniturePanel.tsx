import { BitSettings, EditTool, PlacedFurniture } from '../../types'
import FurnitureList from '../FurnitureList'
import FurnitureProperties from './FurnitureProperties'
import styles from './FurniturePanel.module.css'
import clsx from 'clsx'

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
    <div className={styles.panel}>
      <div className={clsx(styles.header, isSelectMode ? styles.headerProperties : styles.headerFurniture)}>
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

      <div className={styles.footer}>
        <div>[R] ROTATE</div>
        <div>[DEL] REMOVE</div>
      </div>
    </div>
  )
}
