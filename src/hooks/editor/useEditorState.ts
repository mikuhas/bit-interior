import { useState, useCallback } from 'react'
import { EditTool, ViewMode } from '../../types'

export function useEditorState() {
  const [viewMode, setViewMode] = useState<ViewMode>('topdown')
  const [tool, setTool] = useState<EditTool>('floor')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [furnitureRotation, setFurnitureRotation] = useState<0 | 1 | 2 | 3>(0)
  const [doorRotation, setDoorRotation] = useState<0 | 1 | 2 | 3>(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const handleSetTool = useCallback((t: EditTool) => {
    setTool(t)
    if (t !== 'furniture') setSelectedTemplateId(null)
    if (t !== 'select') setSelectedInstanceId(null)
  }, [])

  const handleSelectTemplate = useCallback((id: string) => {
    setSelectedTemplateId(id)
    setSelectedInstanceId(null)
  }, [])

  const handleSelectInstance = useCallback((id: string | null) => {
    setSelectedInstanceId(id)
    if (id) setTool('select')
  }, [])

  const rotate = useCallback(() => {
    if (tool === 'door') {
      setDoorRotation(prev => ((prev + 1) % 4) as 0 | 1 | 2 | 3)
    } else {
      setFurnitureRotation(prev => ((prev + 1) % 4) as 0 | 1 | 2 | 3)
    }
  }, [tool])

  const toggleSettings = useCallback(() => setShowSettings(s => !s), [])
  const toggleHelp = useCallback(() => setShowHelp(h => !h), [])
  const toggleDarkMode = useCallback(() => setDarkMode(d => !d), [])

  return {
    viewMode, setViewMode,
    tool, handleSetTool,
    selectedTemplateId, handleSelectTemplate,
    selectedInstanceId, handleSelectInstance,
    furnitureRotation, doorRotation, rotate,
    showSettings, setShowSettings, toggleSettings,
    showHelp, setShowHelp, toggleHelp,
    darkMode, toggleDarkMode,
  }
}
