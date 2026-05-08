import { Isometric } from 'isometric-react/isometric'
import { IsometricCube } from 'isometric-react/isometric-cube'

// 1グリッド = 60px
const U = 60

export type IsoColors = [top: string, left: string, right: string]

// ─── 内部ヘルパー ───────────────────────────────────────────────
interface CubeProps {
  px: number; py: number; pz: number   // グリッド単位のポジション
  w?: number; d?: number; h: number    // グリッド単位の寸法
  colors: IsoColors
}

function Cube({ px, py, pz, w = 1, d = 1, h, colors }: CubeProps) {
  return (
    <IsometricCube
      size={{ width: `${w * U}px`, height: `${d * U}px` }}
      depth={`${h * U}px`}
      position={{ left: `${px * U}px`, top: `${py * U}px`, elevation: `${pz * U}px` }}
    >
      <IsometricCube.Side side="top"         style={{ background: colors[0] }} />
      <IsometricCube.Side side="front-left"  style={{ background: colors[1] }} />
      <IsometricCube.Side side="front-right" style={{ background: colors[2] }} />
    </IsometricCube>
  )
}

// ─── Bed ────────────────────────────────────────────────────────
interface FurnitureProps {
  x?: number; y?: number; z?: number
  colors: IsoColors
}

/** ベッド(S): 1×2 フレーム + マットレス + 枕 */
export function BedS({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const frame:    IsoColors = [dim(t, 0.7),  dim(l, 0.7),  dim(r, 0.7)]
  const mattress: IsoColors = [bright(t, 1.35), bright(l, 1.25), bright(r, 1.25)]
  const pillow:   IsoColors = ['#f0e8d0', '#d8d2b8', '#e4dcc8']
  return (
    <>
      <Cube px={x}      py={y}      pz={z+0.01} w={1}    d={2}    h={0.3}  colors={frame} />
      <Cube px={x+0.05} py={y+0.05} pz={z+0.31} w={0.9}  d={1.9}  h={0.2}  colors={mattress} />
      <Cube px={x+0.2}  py={y+0.1}  pz={z+0.51} w={0.6}  d={0.4}  h={0.1}  colors={pillow} />
    </>
  )
}

/** ベッド(D): 2×2 フレーム + マットレス + 枕×2 */
export function BedD({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const frame:    IsoColors = [dim(t, 0.7),  dim(l, 0.7),  dim(r, 0.7)]
  const mattress: IsoColors = [bright(t, 1.35), bright(l, 1.25), bright(r, 1.25)]
  const pillow:   IsoColors = ['#f0e8d0', '#d8d2b8', '#e4dcc8']
  return (
    <>
      <Cube px={x}      py={y}      pz={z+0.01} w={2}    d={2}    h={0.3}  colors={frame} />
      <Cube px={x+0.05} py={y+0.05} pz={z+0.31} w={1.9}  d={1.9}  h={0.2}  colors={mattress} />
      <Cube px={x+0.2}  py={y+0.1}  pz={z+0.51} w={0.6}  d={0.4}  h={0.1}  colors={pillow} />
      <Cube px={x+1.2}  py={y+0.1}  pz={z+0.51} w={0.6}  d={0.4}  h={0.1}  colors={pillow} />
    </>
  )
}

/** @deprecated use BedS / BedD */
export function Bed({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  return <BedS x={x} y={y} z={z} colors={colors} />
}

// ─── Chair ──────────────────────────────────────────────────────
/** 椅子: 脚×4 + 座面 + 背もたれ */
export function Chair({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const leg:  IsoColors = [dim(t, 0.55), dim(l, 0.5),  dim(r, 0.55)]
  const seat: IsoColors = [bright(t, 1.2), l, bright(r, 1.1)]
  const back: IsoColors = [dim(t, 0.8), dim(l, 0.7), dim(r, 0.75)]
  const LW = 0.1

  return (
    <>
      <Cube px={x}       py={y}       pz={z+0.01} w={LW} d={LW} h={0.45} colors={leg} />
      <Cube px={x+1-LW}  py={y}       pz={z+0.01} w={LW} d={LW} h={0.45} colors={leg} />
      <Cube px={x}       py={y+1-LW}  pz={z+0.01} w={LW} d={LW} h={0.45} colors={leg} />
      <Cube px={x+1-LW}  py={y+1-LW}  pz={z+0.01} w={LW} d={LW} h={0.45} colors={leg} />
      <Cube px={x}       py={y}        pz={z+0.46} w={1}   d={1}   h={0.05} colors={seat} />
      <Cube px={x}       py={y+0.9}    pz={z+0.51} w={1}   d={0.1}  h={0.4}  colors={back} />
    </>
  )
}

// ─── Desk ───────────────────────────────────────────────────────
/** デスク: 脚×4 + 天板(厚み) */
export function Desk({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const leg: IsoColors = [dim(t, 0.55), dim(l, 0.5), dim(r, 0.55)]
  const top: IsoColors = [bright(t, 1.15), l, bright(r, 1.08)]
  const LW = 0.1
  const W = 3; const D = 2

  return (
    <>
      <Cube px={x}       py={y}       pz={z+0.01} w={LW} d={LW} h={0.7}  colors={leg} />
      <Cube px={x+W-LW}  py={y}       pz={z+0.01} w={LW} d={LW} h={0.7}  colors={leg} />
      <Cube px={x}       py={y+D-LW}  pz={z+0.01} w={LW} d={LW} h={0.7}  colors={leg} />
      <Cube px={x+W-LW}  py={y+D-LW}  pz={z+0.01} w={LW} d={LW} h={0.7}  colors={leg} />
      <Cube px={x}       py={y}        pz={z+0.71} w={W}   d={D}   h={0.05} colors={top} />
    </>
  )
}

// ─── DiningTable ────────────────────────────────────────────────
/** ダイニングテーブル: 脚×4 + 天板 */
export function DiningTable({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const leg: IsoColors = [dim(t, 0.55), dim(l, 0.5), dim(r, 0.55)]
  const top: IsoColors = [bright(t, 1.15), l, bright(r, 1.08)]
  const LW = 0.1
  const W = 3; const D = 2

  return (
    <>
      <Cube px={x}       py={y}       pz={z+0.01} w={LW} d={LW} h={0.75} colors={leg} />
      <Cube px={x+W-LW}  py={y}       pz={z+0.01} w={LW} d={LW} h={0.75} colors={leg} />
      <Cube px={x}       py={y+D-LW}  pz={z+0.01} w={LW} d={LW} h={0.75} colors={leg} />
      <Cube px={x+W-LW}  py={y+D-LW}  pz={z+0.01} w={LW} d={LW} h={0.75} colors={leg} />
      <Cube px={x}       py={y}        pz={z+0.76} w={W}   d={D}   h={0.05} colors={top} />
    </>
  )
}

// ─── CoffeeTable ────────────────────────────────────────────────
/** コーヒーテーブル: 脚×4 + 天板 */
export function CoffeeTable({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const leg: IsoColors = [dim(t, 0.55), dim(l, 0.5), dim(r, 0.55)]
  const top: IsoColors = [bright(t, 1.15), l, bright(r, 1.08)]
  const LW = 0.1
  const W = 2; const D = 2

  return (
    <>
      <Cube px={x}       py={y}       pz={z+0.01} w={LW} d={LW} h={0.4}  colors={leg} />
      <Cube px={x+W-LW}  py={y}       pz={z+0.01} w={LW} d={LW} h={0.4}  colors={leg} />
      <Cube px={x}       py={y+D-LW}  pz={z+0.01} w={LW} d={LW} h={0.4}  colors={leg} />
      <Cube px={x+W-LW}  py={y+D-LW}  pz={z+0.01} w={LW} d={LW} h={0.4}  colors={leg} />
      <Cube px={x}       py={y}        pz={z+0.41} w={W}   d={D}   h={0.05} colors={top} />
    </>
  )
}

// ─── Sofa ───────────────────────────────────────────────────────
/** ソファ [3x1]: ベース + 背もたれ + 肘置き×2 + 座面クッション×3 */
export function Sofa({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const base:    IsoColors = [dim(t, 0.75), dim(l, 0.65), dim(r, 0.7)]
  const cushion: IsoColors = [bright(t, 1.2), l, bright(r, 1.1)]
  const back:    IsoColors = [dim(t, 0.82), dim(l, 0.72), dim(r, 0.78)]
  const arm:     IsoColors = [dim(t, 0.88), dim(l, 0.78), dim(r, 0.84)]
  const W = 3

  return (
    <>
      <Cube px={x}        py={y}      pz={z+0.01} w={W}    d={1}    h={0.2}  colors={base} />
      <Cube px={x}        py={y+0.8}  pz={z+0.21} w={W}    d={0.2}  h={0.6}  colors={back} />
      <Cube px={x}        py={y}      pz={z+0.21} w={0.1}  d={0.8}  h={0.4}  colors={arm} />
      <Cube px={x+W-0.1}  py={y}      pz={z+0.21} w={0.1}  d={0.8}  h={0.4}  colors={arm} />
      {[0, 1, 2].map(i => (
        <Cube
          key={i}
          px={x + 0.1 + i * 0.93} py={y}  pz={z+0.21}
          w={0.9} d={0.8} h={0.3}
          colors={cushion}
        />
      ))}
    </>
  )
}

// ─── Bookshelf ──────────────────────────────────────────────────
const BOOK_COLORS: IsoColors[] = [
  ['#e04040', '#a02020', '#c03030'],
  ['#4080e0', '#2050a0', '#3068c0'],
  ['#40b050', '#208030', '#30a040'],
  ['#d09030', '#906010', '#b07820'],
  ['#a040c0', '#6020a0', '#8030b0'],
  ['#40b0a0', '#208070', '#309888'],
]

/** 本棚 [1x1]: 外枠 + 棚板×3 + 本 */
export function Bookshelf({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const frame: IsoColors = [dim(t, 0.72), dim(l, 0.62), dim(r, 0.68)]
  const shelf: IsoColors = [bright(t, 1.1), l, r]
  const W = 3; const D = 1; const H = 2.0

  return (
    <>
      {/* 左板 */}
      <Cube px={x}       py={y} pz={z+0.01} w={0.05} d={D} h={H}    colors={frame} />
      {/* 右板 */}
      <Cube px={x+W-0.05} py={y} pz={z+0.01} w={0.05} d={D} h={H}   colors={frame} />
      {/* 背板 */}
      <Cube px={x} py={y+D-0.05} pz={z+0.01} w={W}    d={0.05} h={H} colors={frame} />
      {/* 天板 */}
      <Cube px={x} py={y}         pz={z+H+0.01} w={W}  d={D}    h={0.05} colors={frame} />
      {/* 棚板×3 */}
      {[0.5, 1.0, 1.5].map(sh => (
        <Cube key={sh} px={x} py={y} pz={z+sh} w={W} d={D} h={0.02} colors={shelf} />
      ))}
      {/* 本 (2段×3冊) */}
      {[0, 1, 2].map(col =>
        [0, 1].map(row => {
          const bc = BOOK_COLORS[(col + row * 3) % BOOK_COLORS.length]
          return (
            <Cube
              key={`${col}-${row}`}
              px={x + col * 0.95 + 0.07}
              py={y + 0.06}
              pz={z + row * 0.5 + 0.02}
              w={0.82} d={0.88} h={0.44}
              colors={bc}
            />
          )
        })
      )}
    </>
  )
}

// ─── Wardrobe ───────────────────────────────────────────────────
/** ワードローブ [2x1]: 外枠高2.0 + 観音開き扉×2 */
export function Wardrobe({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const body: IsoColors = [dim(t, 0.75), dim(l, 0.65), dim(r, 0.7)]
  const door: IsoColors = [bright(t, 1.08), bright(l, 1.05), bright(r, 1.06)]
  const W = 2; const D = 1

  return (
    <>
      <Cube px={x}        py={y} pz={z+0.01} w={W}      d={D}    h={2.0}  colors={body} />
      <Cube px={x}        py={y} pz={z+0.01} w={W/2-0.02} d={0.02} h={1.9} colors={door} />
      <Cube px={x+W/2+0.02} py={y} pz={z+0.01} w={W/2-0.02} d={0.02} h={1.9} colors={door} />
    </>
  )
}

// ─── TvStand ────────────────────────────────────────────────────
/** テレビ台 [2x1]: 本体 + 棚板×2 */
export function TvStand({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const body:  IsoColors = [dim(t, 0.75), dim(l, 0.65), dim(r, 0.7)]
  const shelf: IsoColors = [bright(t, 1.1), l, r]
  const W = 2; const D = 1

  return (
    <>
      <Cube px={x}       py={y} pz={z+0.01} w={W}   d={D} h={0.5}  colors={body} />
      <Cube px={x+0.05}  py={y} pz={z+0.21} w={W-0.1} d={D} h={0.02} colors={shelf} />
      <Cube px={x+0.05}  py={y} pz={z+0.41} w={W-0.1} d={D} h={0.02} colors={shelf} />
    </>
  )
}

// ─── Plant ──────────────────────────────────────────────────────
/** 観葉植物 [1x1]: 鉢 + 葉(十字) */
export function Plant({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const pot:   IsoColors = ['#8b6040', '#5c3a20', '#704a28']
  const leaf1: IsoColors = [bright(colors[0], 1.3), colors[1], bright(colors[2], 1.1)]
  const leaf2: IsoColors = [bright(colors[0], 1.1), dim(colors[1], 0.9), colors[2]]

  return (
    <>
      <Cube px={x+0.35} py={y+0.35} pz={z+0.01} w={0.3} d={0.3} h={0.3}  colors={pot} />
      <Cube px={x+0.2}  py={y+0.4}  pz={z+0.31} w={0.6} d={0.2} h={0.45} colors={leaf1} />
      <Cube px={x+0.4}  py={y+0.2}  pz={z+0.31} w={0.2} d={0.6} h={0.45} colors={leaf2} />
    </>
  )
}

// ─── Bathtub ────────────────────────────────────────────────────
/** バスタブ [2x3]: 外枠 + 内部 */
export function Bathtub({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const outer: IsoColors = [bright(t, 1.15), l, bright(r, 1.05)]
  const inner: IsoColors = ['#aad8f0', '#78b0d0', '#90c8e0']
  const W = 2; const D = 3

  return (
    <>
      <Cube px={x}      py={y}      pz={z+0.01} w={W}     d={D}     h={0.6}  colors={outer} />
      <Cube px={x+0.1}  py={y+0.1}  pz={z+0.11} w={W-0.2} d={D-0.2} h={0.5}  colors={inner} />
    </>
  )
}

// ─── Toilet ─────────────────────────────────────────────────────
/** トイレ [1x2]: 便器本体 + タンク */
export function Toilet({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const bowl: IsoColors = [bright(t, 1.2),  l,           bright(r, 1.1)]
  const tank: IsoColors = [bright(t, 1.1),  dim(l, 0.9), r]

  return (
    <>
      <Cube px={x+0.25} py={y+0.2} pz={z+0.01} w={0.5} d={0.6} h={0.4}  colors={bowl} />
      <Cube px={x+0.25} py={y+0.8} pz={z+0.4}  w={0.5} d={0.2} h={0.4}  colors={tank} />
    </>
  )
}

// ─── IsoStage (デモ用ラッパー) ───────────────────────────────────
interface IsoStageProps {
  children: React.ReactNode
  width?: number
  height?: number
}

/** IsometricCubeを内包するラッパー。個別コンポーネントはこの中に配置する */
export function IsoStage({ children, width = 600, height = 500 }: IsoStageProps) {
  return (
    <Isometric style={{ width, height, position: 'relative', overflow: 'hidden' }}>
      {children}
    </Isometric>
  )
}

// ─── ユーティリティ ──────────────────────────────────────────────
function dim(hex: string, factor: number): string {
  return adjustBrightness(hex, factor)
}
function bright(hex: string, factor: number): string {
  return adjustBrightness(hex, factor)
}
function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)))
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('')
}
