# CLAUDE.md
## P
8bit風UIで部屋の内装を設計するアプリ
## C
- グリッド: 1bit (= cm/mm/inch)
- 視点: default=BEV / 切替=クォータービュー
- 配置: 家具はBEVのみ / 家具は8bit描画
- 部屋: グリッド拡張で形状変更 / 任意方向拡張可能
## UI
- 全UIは8bit / 部屋・家具ともにビット表現
## ARCH (必読→探索不要)
- 構成詳細: docs/architect.md
- Stack: React19 + TypeScript + Vite + Canvas2D
- 型: src/types/index.ts
- 家具テンプレ: src/data/furniture.ts
- 状態管理: src/hooks/useRoom.ts
- BEV描画: src/components/TopDownCanvas.tsx (CELL_SIZE=40)
- ISO描画: src/components/IsometricView.tsx (isometric-react DOM)
- ISO家具: src/components/iso/IsoFurniture.tsx
- メイン: src/components/RoomEditor.tsx
- 落とし穴: docs/architect.md の「isometric-react使用上の注意」必読
## R
- PLAN.mdにTODOを書き出してから実装
- 思考時間が5分を超える場合はPLAN.mdにメインタスクの下にサブタスクを書き出し
- TODOは常に更新(LIMIT前必須)
- 構成変更 → architect.md 更新
## O
- 説明禁止（要求がある場合のみ）
- 最小トークンで出力 / 冗長禁止 / 繰り返し禁止
## FORMAT
- 差分優先 / 箇条書き最小 / 改行最小 / コメント最小
## THINK
- 内部思考出力禁止 / 推測説明禁止 / 不確実な場合のみ最小質問
## SCOPE
- 指示外拡張禁止 / 勝手なリファクタ禁止 / ライブラリ追加は明示指示時のみ
## DEFAULT
- 不明点=最も単純な実装 / 説明禁止 / 最小トークン
- 冗長削除 / 繰り返し禁止 / 箇条書き優先 / 短文 / 推測しない / 最小実装優先
## STYLE
- 記号化優先（→, =）/ 単語圧縮
