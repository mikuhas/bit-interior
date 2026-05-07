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

/** ベッド: フレーム(2×3) + マットレス + 枕 */
export function Bed({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const frame:    IsoColors = [dim(t, 0.7),  dim(l, 0.7),  dim(r, 0.7)]
  const mattress: IsoColors = [bright(t, 1.35), bright(l, 1.25), bright(r, 1.25)]
  const pillow:   IsoColors = ['#f0e8d0', '#d8d2b8', '#e4dcc8']

  return (
    <>
      {/* フレーム */}
      <Cube px={x}      py={y}      pz={z}       w={2}   d={3}   h={0.18} colors={frame} />
      {/* マットレス */}
      <Cube px={x+0.06} py={y+0.06} pz={z+0.18}  w={1.88} d={2.88} h={0.28} colors={mattress} />
      {/* 枕 */}
      <Cube px={x+0.22} py={y+0.12} pz={z+0.46}  w={1.56} d={0.65} h={0.14} colors={pillow} />
    </>
  )
}

// ─── Chair ──────────────────────────────────────────────────────
/** 椅子: 脚×4 + 座面 + 背もたれ */
export function Chair({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const leg:  IsoColors = [dim(t, 0.55), dim(l, 0.5),  dim(r, 0.55)]
  const seat: IsoColors = [bright(t, 1.2), l, bright(r, 1.1)]
  const back: IsoColors = [dim(t, 0.8), dim(l, 0.7), dim(r, 0.75)]
  const LW = 0.13  // 脚の太さ

  return (
    <>
      {/* 脚×4 */}
      <Cube px={x}         py={y}         pz={z} w={LW} d={LW} h={0.72} colors={leg} />
      <Cube px={x+1-LW}    py={y}         pz={z} w={LW} d={LW} h={0.72} colors={leg} />
      <Cube px={x}         py={y+1.8-LW}  pz={z} w={LW} d={LW} h={0.72} colors={leg} />
      <Cube px={x+1-LW}    py={y+1.8-LW}  pz={z} w={LW} d={LW} h={0.72} colors={leg} />
      {/* 座面 */}
      <Cube px={x+0.05}    py={y+0.05}    pz={z+0.72} w={0.9} d={0.9} h={0.1} colors={seat} />
      {/* 背もたれ */}
      <Cube px={x+0.05}    py={y+0.05}    pz={z+0.82} w={0.9} d={0.14} h={0.65} colors={back} />
    </>
  )
}

// ─── Desk ───────────────────────────────────────────────────────
/** デスク: 脚×4 + 天板(厚み) */
export function Desk({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const leg: IsoColors = [dim(t, 0.55), dim(l, 0.5), dim(r, 0.55)]
  const top: IsoColors = [bright(t, 1.15), l, bright(r, 1.08)]
  const LW = 0.12
  const W = 3; const D = 2

  return (
    <>
      {/* 脚×4 */}
      <Cube px={x}       py={y}       pz={z} w={LW} d={LW} h={0.85} colors={leg} />
      <Cube px={x+W-LW}  py={y}       pz={z} w={LW} d={LW} h={0.85} colors={leg} />
      <Cube px={x}       py={y+D-LW}  pz={z} w={LW} d={LW} h={0.85} colors={leg} />
      <Cube px={x+W-LW}  py={y+D-LW}  pz={z} w={LW} d={LW} h={0.85} colors={leg} />
      {/* 天板 */}
      <Cube px={x}       py={y}        pz={z+0.85} w={W} d={D} h={0.12} colors={top} />
    </>
  )
}

// ─── Sofa ───────────────────────────────────────────────────────
/** ソファ: ベース + 背もたれ + 肘置き×2 + 座面クッション */
export function Sofa({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const base:    IsoColors = [dim(t, 0.75), dim(l, 0.65), dim(r, 0.7)]
  const cushion: IsoColors = [bright(t, 1.2), l, bright(r, 1.1)]
  const back:    IsoColors = [dim(t, 0.82), dim(l, 0.72), dim(r, 0.78)]
  const arm:     IsoColors = [dim(t, 0.88), dim(l, 0.78), dim(r, 0.84)]
  const W = 3

  return (
    <>
      {/* ベース */}
      <Cube px={x}       py={y}       pz={z}      w={W}   d={2}   h={0.42} colors={base} />
      {/* 背もたれ */}
      <Cube px={x}       py={y}       pz={z+0.42} w={W}   d={0.38} h={0.68} colors={back} />
      {/* 肘置き 左・右 */}
      <Cube px={x}       py={y+0.38}  pz={z+0.42} w={0.28} d={1.62} h={0.38} colors={arm} />
      <Cube px={x+W-0.28} py={y+0.38} pz={z+0.42} w={0.28} d={1.62} h={0.38} colors={arm} />
      {/* 座面クッション×3 */}
      {[0, 1, 2].map(i => (
        <Cube
          key={i}
          px={x + 0.28 + i * 0.82} py={y + 0.44}  pz={z + 0.42}
          w={0.76} d={1.5} h={0.24}
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

/** 本棚: フレーム + 棚板×2 + 本×6 */
export function Bookshelf({ x = 0, y = 0, z = 0, colors }: FurnitureProps) {
  const [t, l, r] = colors
  const frame:  IsoColors = [dim(t, 0.72), dim(l, 0.62), dim(r, 0.68)]
  const shelf:  IsoColors = [bright(t, 1.1), l, r]

  return (
    <>
      {/* フレーム */}
      <Cube px={x} py={y} pz={z} w={3} d={1} h={1} colors={frame} />
      {/* 棚板×2 */}
      <Cube px={x} py={y} pz={z+0.33} w={3} d={1} h={0.05} colors={shelf} />
      <Cube px={x} py={y} pz={z+0.66} w={3} d={1} h={0.05} colors={shelf} />
      {/* 本×6 (2段×3冊) */}
      {[0, 1, 2].map(col =>
        [0, 1].map(row => {
          const bc = BOOK_COLORS[(col + row * 3) % BOOK_COLORS.length]
          return (
            <Cube
              key={`${col}-${row}`}
              px={x + col * 0.95 + 0.06}
              py={y + 0.06}
              pz={z + row * 0.33 + 0.05}
              w={0.82} d={0.88} h={0.26}
              colors={bc}
            />
          )
        })
      )}
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
