# PLAN: 家具リアル化 & 高さ概念追加 + 追加機能

## 完了済み
- [x] IsometricCanvas: 色ユーティリティ, 照明モデル, エッジハイライト, 家具タイプ別デコレーション
- [x] TopDownCanvas: 高さ比例ドロップシャドウ
- [x] FurniturePanel: 高さcm表示
- [x] RoomEditor: bitSettings渡す

## 新規タスク

### 俯瞰: 家具識別アイコン ✅
- [x] TopDownCanvas: drawFurnitureIcon() 関数実装 (全13種)

### ISO: 3D立体感強化 ✅
- [x] IsometricCanvas: 隣接セル検出 (row+1同instanceでLEFT面内部, col+1でRIGHT面内部)
- [x] IsometricCanvas: 内部エッジのストロークをパネルライン化
- [x] IsometricCanvas: colorOverride対応

### 保存機能 ✅
- [x] utils/save.ts: localStorage保存/読込 + JSON export/import
- [x] Toolbar: SAVE/LOAD/↓JSON/↑JSON ボタン
- [x] RoomEditor: save/load ロジック接続, SAVED フラッシュ表示

### 家具カラーピッカー ✅
- [x] types/index.ts: colorOverride追加
- [x] hooks/useRoom.ts: updateFurnitureColor, loadRoom追加
- [x] components/ColorPicker.tsx: プリセット40色 + カスタム入力
- [x] FurniturePanel: SELECT+選択中にPROPERTIESモード表示
- [x] IsometricCanvas + TopDownCanvas: colorOverride対応
- [x] RoomEditor: カラー変更ロジック接続
