# architect.md

## Stack
- React 19 + TypeScript + Vite
- Canvas 2D API (IsometricCanvas, TopDownCanvas)
- No CSS framework (inline styles + index.css)

## ファイル責務

| ファイル | 責務 |
|---|---|
| src/types/index.ts | 全型定義 (CellType, EditTool, RoomState, PlacedFurniture, FurnitureTemplate) |
| src/data/furniture.ts | 家具テンプレート定義 (FURNITURE_TEMPLATES, getTemplate) |
| src/utils/room.ts | グリッドロジック (rotateShape, expandShape, canPlaceFurniture, createInitialRoom) |
| src/utils/save.ts | LocalStorage/JSON 保存・読込 |
| src/hooks/useRoom.ts | RoomState 管理 Hook |
| src/components/RoomEditor.tsx | メインコンポーネント (状態・イベント統括) |
| src/components/TopDownCanvas.tsx | BEV Canvas描画・マウス操作 |
| src/components/IsometricView.tsx | ISO描画 (isometric-react DOM) |
| src/components/iso/IsoFurniture.tsx | ISO家具コンポーネント (Bed/Chair/Desk/Sofa/Bookshelf) |
| src/components/IsometricCanvas.tsx | 旧ISO Canvas (未使用・参照用) |
| src/components/Toolbar.tsx | ツールバーUI |
| src/components/FurniturePanel.tsx | 家具パネル・プロパティ編集 |
| docs/PLAN.md | 実装タスク管理 |

## 主要型

```ts
type CellType = 'empty' | 'floor' | 'wall' | 'door' | 'window'
type EditTool  = 'floor' | 'wall' | 'door' | 'window' | 'erase' | 'select' | 'furniture'

interface PlacedFurniture {
  instanceId: string; templateId: string
  x: number; y: number; z: number
  rotation: 0|1|2|3; scaleW: number; scaleH: number
  colorOverride?: string
}

interface RoomState {
  width: number; height: number; wallHeight: number; wallColor: string
  cells: CellType[][]; furniture: PlacedFurniture[]
}
```

## Canvas定数
- TopDown: `CELL_SIZE = 40`px
- Isometric: `TILE_W=64, TILE_H=32, Z_PX=14`
- ISO座標変換: `isoUV(x,y,h,u,v)` → screenXY

## ISOライティングルール
- 上面 (top): `shade(color, 1.60)` 最明
- 右面 (SE): `shade(color, 0.65)` 中間
- 左面 (SW): `shade(color, 0.38)` 最暗

## 家具追加手順
1. `src/data/furniture.ts` に FurnitureTemplate 追加
2. `TopDownCanvas.tsx` の `drawFurnitureIcon` に case 追加
3. `IsometricCanvas.tsx` の `drawDecoration` に case 追加

## 新ツール追加手順
1. `types/index.ts`: CellType / EditTool に追加
2. `Toolbar.tsx`: TOOLS 配列に追加
3. `TopDownCanvas.tsx`: onMouseDown/onMouseMove の tool 判定に追加、drawCell に描画追加

## 家具追加手順 (IsometricView対応)
1. `src/data/furniture.ts` に FurnitureTemplate 追加
2. `TopDownCanvas.tsx` の `drawFurnitureIcon` に case 追加
3. `IsoFurniture.tsx` に新コンポーネント追加 (Cube ヘルパー使用)
4. `IsometricView.tsx` の `renderFurniture` に case 追加

## ライブラリ
- 追加済み: `isometric-react` (ISO DOM描画)
- 追加指示があった場合のみ追加インストール

## isometric-react 使用上の注意

### 値の単位 (必須)
- 数値を渡すと **rem 変換**される (`60 → "60rem" = 960px`)
- **全ての長さは必ず `px` 文字列で渡す**
  ```ts
  // NG
  size={{ width: 60, height: 60 }}
  depth={10}
  position={{ left: 120, top: 60 }}
  // OK
  size={{ width: "60px", height: "60px" }}
  depth="10px"
  position={{ left: "120px", top: "60px", elevation: "0px" }}
  ```

### Isometric コンポーネントの構造
- `<Isometric>` は自身で `.isometric-container` div を出力する
- サイズは `<Isometric style={{ width, height }}>` で直接渡す
- **外側に別の `.isometric-container` を作らない**
  ```tsx
  // NG: 二重 container になりサイズ0でクリップ
  <div className="isometric-container" style={{ width: cW }}>
    <Isometric>...</Isometric>
  </div>
  // OK: position:relative 必須 (.isometric が position:absolute のため containing block が必要)
  <Isometric style={{ width: cW, height: cH, position: 'relative' }}>
    ...
  </Isometric>
  ```

### インポートパス
```ts
import { Isometric }     from 'isometric-react/isometric'
import { IsometricCube } from 'isometric-react/isometric-cube'
// CSS は main.tsx に一度だけ
import 'isometric-react/isometric.css'
```

### Cube のSide名とライティング
```tsx
<IsometricCube.Side side="top"         style={{ background: colors[0] }} />  // 最明
<IsometricCube.Side side="front-left"  style={{ background: colors[1] }} />  // 最暗
<IsometricCube.Side side="front-right" style={{ background: colors[2] }} />  // 中間
```

## Vite + TypeScript 注意
- CSS import の型エラー → `src/vite-env.d.ts` に `/// <reference types="vite/client" />` が必要
