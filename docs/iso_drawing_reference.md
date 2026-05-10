# ISO家具描画リファレンス

このドキュメントは、本プロジェクトにおけるISO（等角投影）視点の家具描画ロジックと使用ライブラリについてまとめたものです。

## 1. 使用ライブラリ

プロジェクトの `package.json` に基づく主要なライブラリ構成です。

- **isometric-react (^2.0.13)**: Reactコンポーネントベースの等角投影描画用ライブラリ。一部のコンポーネントで使用されています。
- **jspdf (^4.2.1)**: PDF出力用。キャンバス内容をPDF化する際に使用されます。
- **React 19**: アプリケーションのベースフレームワーク。
- **Canvas API**: メインのレンダリングエンジン（`isometricRenderer.ts`）で使用されています。

---

## 2. 描画アーキテクチャ

描画システムは「レンダラ」と「ドロワー」に分かれています。

### A. レンダリングエンジン (`src/utils/isometricRenderer.ts`)
部屋全体のセルを走査し、正しい順序で描画します。
1. **Depth Sorting**: 奥から手前（(row + col) の昇順）にソートして、重なりを正しく表現します。
2. **Floor Pass**: 床タイルを先に描画します。
3. **Object Pass**: 各セルに対して「ベースの立方体（家具の土台）」を描画します。
4. **Decoration Pass**: 家具が複数セルにまたがる場合、**最も手前（ローカル座標が最大値）のセル**を処理するタイミングで `drawDecoration` を実行します。これにより、家具の全ての土台が描画された後に、その上に詳細な装飾が乗るようになります。

### B. 家具ドロワー (`src/components/iso/draw/`)
`FURNITURE_DRAWERS` に登録された関数群で、特定の家具の細部を描画します。
`drawDecoration` は内部で家具の「原点（localRow=0, localCol=0）」のスクリーン座標を逆算し、ドロワーに渡します。

```typescript
function drawDecoration(
  ctx: CanvasRenderingContext2D,
  fc: CellInfo,
  x: number,
  y: number,
  cubeH: number,
  row: number,
  col: number,
  toScreen: (c: number, r: number) => { x: number, y: number },
  zOff: number
) {
  // ...
  // 家具の描画原点（localRow=0, localCol=0 のセルのスクリーン座標）を算出
  const originRow = row - localRow
  const originCol = col - localCol
  const originPos = toScreen(originCol, originRow)
  const originX = originPos.x
  const originY = originPos.y - zOff
  // ...
}
```

```typescript
export interface DrawContext {
  ctx: CanvasRenderingContext2D
  x: number; y: number; // 描画基準点（スクリーン座標）
  cubeH: number         // ベースの高さ
  W: number; D: number; // 家具の幅と奥行き（グリッド単位）
  color: string; topColor: string; highlight: string; shadow: string
}
```

---

## 3. 基本ユーティリティ (`src/utils/isometric.ts`)

描画の核となる座標変換関数です。

- **`isoUV(x, y, h, u, v)`**: グリッド座標 (u, v) と高さ h をスクリーン座標 [x, y] に変換します。
- **`isoRect(...)`**: ISO視点の四角形（天板など）を塗りつぶし描画します。
- **`shade(hex, f)`**: 色の明るさを調整します。

---

## 4. 各家具の描画ロジック（ソースコード）

### 共通: `src/components/iso/draw/index.ts`
全ての家具ドロワーを統合管理するエントリーポイントです。

```typescript
export const FURNITURE_DRAWERS: Record<string, FurnitureDrawer> = {
  'bed-s': drawBed(false),
  'bed-d': drawBed(true),
  'sofa': drawSofa,
  'desk': drawDesk,
  'dining-table': drawTable,
  // ... (以下略)
}
```

### ベッド (`src/components/iso/draw/bed.ts`)
```typescript
import { DrawContext } from './types'
import { isoRect, shade, mix } from '../../../utils/isometric'

export const drawBed: (isDouble: boolean) => (c: DrawContext) => void = (isDouble) => ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}) => {
  const frame = shade(color, 0.7)
  const sheetColor = topColor

  // 1. フレーム：家具全体に描画
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, frame)
  // 2. シーツ：フレームより少し小さく描画
  isoRect(ctx, x, y, cubeH, 0.08, 0.08, W - 0.08, D - 0.08, sheetColor)
  isoRect(ctx, x, y, cubeH, 0.08, 0.08, W - 0.08, 0.2, highlight)

  // 3. 枕
  const pColor = mix(sheetColor, '#fff', 0.4)
  const pSize = 0.6; // 枕のサイズ

  if (!isDouble) {
    // シングルベッド：1つの枕を描画
    const pOffset = (1 - pSize) / 2; // 中央に配置
    isoRect(ctx, x, y, cubeH + 3, pOffset, 0.15, pSize, 0.45, pColor, shade(pColor, 0.9))
  } else {
    // ダブルベッド：各セルに枕を描画
    const numPillows = W; // セルの数（幅）
    for (let i = 0; i < numPillows; i++) {
      // 各セルの枕のX座標を計算（中央に配置）
      const pX = (i + 0.5) * (1 / numPillows) - (pSize / (2 * numPillows));
      isoRect(ctx, x, y, cubeH + 3, pX, 0.15, pSize / numPillows, 0.45, pColor, shade(pColor, 0.9))
    }
  }
}
```

### ソファ (`src/components/iso/draw/sofa.ts`)
```typescript
import { DrawContext } from './types'
import { isoRect, isoLine, isoUV, shade } from '../../../utils/isometric'

export const drawSofa = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight, shadow
}: DrawContext) => {
  const fabric = color
  const cushion = topColor
  const fabricL = shade(fabric, 0.85)
  const fabricR = shade(fabric, 0.7)
  const border = shade(fabric, 0.5)

  // 1. 座面
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, cushion)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.15, highlight)

  // 2. 背もたれ
  const bh = 26; const v_back = 0.35
  isoRect(ctx, x, y, cubeH + bh, 0, 0, W, v_back, fabric)
  isoRect(ctx, x, y, cubeH + bh, 0, 0, W, 0.08, highlight)
  const [p1x, p1y] = isoUV(x, y, cubeH + bh, 0, v_back)
  const [p2x, p2y] = isoUV(x, y, cubeH + bh, W, v_back)
  const [p3x, p3y] = isoUV(x, y, cubeH, W, v_back)
  const [p4x, p4y] = isoUV(x, y, cubeH, 0, v_back)
  ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.closePath()
  ctx.fillStyle = fabricL; ctx.fill()

  // 3. ひじ掛け (両サイド)
  // ... (ループ処理で左右のひじ掛けを描画)
}
```

### テーブル・デスク (`src/components/iso/draw/table.ts`)
```typescript
export const drawTable = ({
  ctx, x, y, cubeH, W, D, color, topColor, highlight
}: DrawContext) => {
  isoRect(ctx, x, y, cubeH, 0, 0, W, D, topColor)
  isoRect(ctx, x, y, cubeH, 0, 0, W, 0.08, highlight)
  const lw = 0.15
  isoRect(ctx, x, y, 0, 0.1, 0.1, lw, lw, color)
  isoRect(ctx, x, y, 0, W - lw, 0.1, W, lw, color)
  isoRect(ctx, x, y, 0, 0.1, D - lw, lw, D, color)
  isoRect(ctx, x, y, 0, W - lw, D - lw, W, D, color)
}
```

### 家電・キッチン (`src/components/iso/draw/appliances.ts`)
- **冷蔵庫**: 上下のドア分割線とハンドルを描画。
- **キッチン**: シンク（凹み）と蛇口のディテールを描画。
- **チェスト**: 引き出しの段差と取っ手を描画。

### その他 (`src/components/iso/draw/misc.ts`)
- **本棚**: 多彩な色の本を並べて描画。
- **観葉植物**: 鉢と、円を組み合わせた葉を描画。
- **テレビ台**: テレビ本体と土台を描画。

---

## 5. 壁の描画 (`src/components/iso/draw/wall.ts`)
壁は `drawEdgeWall` 関数で描画され、隣接するセルの状態に応じて上面、左側面、右側面の表示・非表示を切り替えます。

---

このリファレンスを参照することで、新しい家具の追加や既存の描画ロジックの修正をスムーズに行うことができます。
