import { useEffect } from 'react'
import { EditTool, ViewMode } from '../../types'

interface Actions {
  undo: () => void
  redo: () => void
  onSave: () => void
  onSelectInstance: (id: string | null) => void
  onSelectTemplate: (id: string | null) => void
  toggleHelp: () => void
  setViewMode: (m: ViewMode) => void
  setTool: (t: EditTool) => void
}

export function useKeyboardShortcuts(actions: Actions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const key = e.key.toLowerCase()
      
      if (ctrl && key === 'z') {
        e.preventDefault()
        if (shift) actions.redo()
        else actions.undo()
        return
      }
      if (ctrl && key === 'y') { e.preventDefault(); actions.redo(); return }
      if (ctrl && key === 's') { e.preventDefault(); actions.onSave(); return }
      
      if (e.key === 'Escape') {
        actions.onSelectInstance(null)
        actions.onSelectTemplate(null)
        return
      }
      
      if (e.key === '?') { actions.toggleHelp(); return }
      
      if (e.key === '1') { actions.setViewMode('topdown'); return }
      if (e.key === '2') { actions.setViewMode('isometric'); return }
      if (e.key === '3') { actions.setViewMode('blueprint'); return }
      
      if (key === 'f') actions.setTool('floor')
      else if (key === 'w') actions.setTool('wallBottom')
      else if (key === 'd') actions.setTool('door')
      else if (key === 'n') actions.setTool('window')
      else if (key === 'e') actions.setTool('erase')
      else if (key === 's' && !ctrl) actions.setTool('select')
      else if (key === 'p') actions.setTool('furniture')
    }
    
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [actions])
}
