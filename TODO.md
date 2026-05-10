# Refactoring TODO List

## 1. CSS Modules Migration (Style Cleanup)
- [ ] RoomEditor.tsx
- [ ] Toolbar.tsx
- [ ] FurniturePanel.tsx
- [ ] RoomSettingsPanel.tsx
- [ ] SettingsModal.tsx
- [ ] ShortcutHelp.tsx

## 2. Component Performance & Cleanup
- [ ] Audit `useCallback`/`useMemo` dependencies in main components.
- [ ] Ensure all components are `memo`-ized.

## 3. Tech Debt
- [ ] Complete TanStack Query migration for remaining persistence operations.
- [ ] Type-safety audit (remove any remaining implicit `any`).
