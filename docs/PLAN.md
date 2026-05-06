# PLAN: XYZ概念 + 立体感強化 + ビット設定 + 家具サイズ

## 実装タスク

- [x] types/index.ts: PlacedFurnitureに z, scaleW, scaleH 追加
- [x] utils/room.ts: expandShape追加, canPlaceFurniture をscale対応
- [x] hooks/useRoom.ts: updateFurnitureZ, updateFurnitureScale追加
- [x] IsometricCanvas.tsx: Z軸オフセット + 統一トップ面描画(内部線なし)
- [ ] TopDownCanvas.tsx: expandShape対応 (スケール家具の配置チェック)

## 追加実装
- [x] IsometricCanvas: 家具立体感強化 (cubeH×18, コントラスト強化, ボトムシャドウ)
- [x] RoomState: wallHeight/wallColor フィールド追加
- [x] IsometricCanvas: wallHeight/wallColor 動的反映
- [x] RoomEditor: 壁高さ・壁色をBIT SETTINGSパネルから変更可能
- [x] RoomEditor/Toolbar: Dark/Lightモード切替ボタン
- [x] useRoom: resizeRoom追加 (セル配列リサイズ + 範囲外家具除去)
- [x] RoomEditor: ⚙BITパネルのROOMセクションにW/H ±ボタン追加
- [x] FurniturePanel: SIZEをビット数表示 + ±ボタン + スライダー(max10)に変更
- [x] FurniturePanel.tsx: ZスライダーとW/Hスケールスライダー追加
- [x] Toolbar.tsx + RoomEditor.tsx: ビット設定(サイズ・単位)をエディタ内から変更可能に
- [x] RoomEditor.tsx: setBitSettings対応
