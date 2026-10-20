import type { CSSProperties, ReactNode } from 'react'
import { family } from '../config/content'

/**
 * Hand-built storybook characters based on the family photo:
 *  - Bố: short black undercut, black rectangular glasses, beige tee, black shorts, clogs.
 *  - Mẹ: long wavy chestnut hair with side bangs, black glasses, black oversized tee, joggers, striped socks.
 *  - Chít: fluffy black hair, clear round glasses, white doodle tee, denim shorts, sandals.
 *
 * Every character is drawn in local coordinates with the feet at (0,0).
 * `still` renders plain SVG transforms (for image export) instead of CSS-animated ones.
 */

export type Pose = 'stand' | 'hug'

const INK = '#6b4636'
const ink = (w = 1.6) => ({ stroke: INK, strokeOpacity: 0.42, strokeWidth: w, strokeLinejoin: 'round' as const })

interface T {
  x?: number
  y?: number
  r?: number
  s?: number
}

export function tr(t: T, still: boolean, dur = 0.9, delay = 0): { transform?: string; style?: CSSProperties } {
  const { x = 0, y = 0, r = 0, s = 1 } = t
  if (still) return { transform: `translate(${x} ${y}) rotate(${r}) scale(${s})` }
  return {
    style: {
      transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
      transition: `transform ${dur}s cubic-bezier(.34,1.25,.5,1) ${delay}s`,
    },
  }
}

interface ArmProps {
  at: [number, number]
  a1: number
  a2: number
  upper: number
  fore: number
  armW: number
  sleeve: string
  sleeveLen: number
  sleeveW: number
  skin: string
  still: boolean
  hand?: 'open' | 'v'
  anim?: string
  extra?: ReactNode
}

function Arm({ at, a1, a2, upper, fore, armW, sleeve, sleeveLen, sleeveW, skin, still, hand = 'open', anim, extra }: ArmProps) {
  return (
    <g {...tr({ x: at[0], y: at[1], r: a1 }, still)}>
      <line x1={0} y1={0} x2={0} y2={upper} stroke={INK} strokeOpacity={0.38} strokeWidth={armW + 2.6} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={upper} stroke={skin} strokeWidth={armW} strokeLinecap="round" />
      <g {...tr({ y: upper, r: a2 }, still)}>
        <g className={still ? undefined : anim}>
          <line x1={0} y1={0} x2={0} y2={fore} stroke={INK} strokeOpacity={0.38} strokeWidth={armW + 2.2} strokeLinecap="round" />
          <line x1={0} y1={0} x2={0} y2={fore} stroke={skin} strokeWidth={armW * 0.94} strokeLinecap="round" />
          {hand === 'v' && (
            <g>
              <line x1={-1.5} y1={fore} x2={-4.5} y2={fore + armW * 1.15} stroke={INK} strokeOpacity={0.4} strokeWidth={armW * 0.42 + 2} strokeLinecap="round" />
              <line x1={2.5} y1={fore} x2={5} y2={fore + armW * 1.15} stroke={INK} strokeOpacity={0.4} strokeWidth={armW * 0.42 + 2} strokeLinecap="round" />
              <line x1={-1.5} y1={fore} x2={-4.5} y2={fore + armW * 1.15} stroke={skin} strokeWidth={armW * 0.42} strokeLinecap="round" />
              <line x1={2.5} y1={fore} x2={5} y2={fore + armW * 1.15} stroke={skin} strokeWidth={armW * 0.42} strokeLinecap="round" />
            </g>
          )}
          <circle cx={0} cy={fore + 1} r={armW * 0.64} fill={skin} {...ink(1.4)} />
          {extra}
        </g>
      </g>
      {/* sleeve drawn last so it sits over the shoulder */}
      <line x1={0} y1={-2} x2={0} y2={sleeveLen} stroke={INK} strokeOpacity={0.35} strokeWidth={sleeveW + 2.6} strokeLinecap="round" />
      <line x1={0} y1={-2} x2={0} y2={sleeveLen} stroke={sleeve} strokeWidth={sleeveW} strokeLinecap="round" />
    </g>
  )
}

function Eyes({ lx, rx, y, rw, rh, happy, still, delay = 0 }: { lx: number; rx: number; y: number; rw: number; rh: number; happy: boolean; still: boolean; delay?: number }) {
  if (happy) {
    return (
      <g fill="none" stroke="#2a1d1a" strokeWidth={2.6} strokeLinecap="round">
        <path d={`M${lx - rw * 1.4},${y + 1} Q${lx},${y - rh * 1.5} ${lx + rw * 1.4},${y + 1}`} />
        <path d={`M${rx - rw * 1.4},${y + 1} Q${rx},${y - rh * 1.5} ${rx + rw * 1.4},${y + 1}`} />
      </g>
    )
  }
  return (
    <g className={still ? undefined : 'anim-blink'} style={still ? undefined : { animationDelay: `${delay}s` }}>
      {[lx, rx].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx={rw} ry={rh} fill="#2a1d1a" />
          <circle cx={x + rw * 0.35} cy={y - rh * 0.4} r={rw * 0.38} fill="#fff" />
        </g>
      ))}
    </g>
  )
}

function Shadow({ rx }: { rx: number }) {
  return <ellipse cx={0} cy={-1} rx={rx} ry={rx * 0.16} fill="#7a4b45" opacity={0.16} />
}

/* ─────────────────────────── Bố (Husband) ─────────────────────────── */

export function Husband({ pose, still = false }: { pose: Pose; still?: boolean }) {
  const c = family.husband
  const hug = pose === 'hug'
  return (
    <g>
      <Shadow rx={46} />
      {/* legs */}
      <rect x={-30} y={-68} width={20} height={60} rx={9} fill={c.skin} {...ink()} />
      <rect x={10} y={-68} width={20} height={60} rx={9} fill={c.skin} {...ink()} />
      <path d="M-22,-40 q3,3 6,0 M18,-40 q3,3 6,0" stroke={c.skinShade} strokeWidth={1.4} fill="none" />
      {/* clogs */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 38},-2 C${d * 40},-16 ${d * 28},-20 ${d * 19},-19 C${d * 9},-19 ${d * 5},-12 ${d * 5},-2 Z`} fill={c.shoes} {...ink()} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={d * (13 + i * 7)} cy={-12 + (i === 1 ? -2 : 0)} r={1.5} fill="#cfc4b0" />
          ))}
        </g>
      ))}
      <g className={still ? undefined : 'anim-breathe'}>
        {/* shorts */}
        <path d="M-41,-124 L41,-124 C43,-102 45,-82 43,-58 C30,-53 14,-53 3,-58 L0,-84 L-3,-58 C-14,-53 -30,-53 -43,-58 C-45,-82 -43,-102 -41,-124 Z" fill={c.shorts} {...ink()} />
        <path d="M-40,-118 L40,-118" stroke="#45454e" strokeWidth={2} />
        {/* tee */}
        <path d="M-48,-182 C-40,-193 -20,-197 -12,-197 C-6,-189 6,-189 12,-197 C20,-197 40,-193 48,-182 L46,-114 C20,-106 -20,-106 -46,-114 Z" fill={c.shirt} {...ink()} />
        <path d="M-48,-182 L-46,-114 C-41,-112 -36,-111 -31,-111 L-34,-172 Z" fill={c.shirtShade} opacity={0.65} />
        <path d="M14,-150 q2,-3 4,0 M20,-150 q2,-3 4,0" stroke="#9c8f84" strokeWidth={1.3} fill="none" />
        {/* neck */}
        <rect x={-10} y={-212} width={20} height={20} rx={7} fill={c.skin} />
        <path d="M-12,-196 C-6,-189 6,-189 12,-196" stroke={c.skinShade} strokeWidth={2} fill="none" />
        {/* arms */}
        <Arm at={[-44, -180]} a1={12} a2={-6} upper={36} fore={32} armW={15} sleeve={c.shirt} sleeveLen={22} sleeveW={23} skin={c.skin} still={still} />
        <Arm
          at={[44, -180]}
          a1={hug ? -100 : -32}
          a2={hug ? -10 : 12}
          upper={36}
          fore={30}
          armW={15}
          sleeve={c.shirt}
          sleeveLen={22}
          sleeveW={23}
          skin={c.skin}
          still={still}
        />
        {/* head */}
        <g>
          <ellipse cx={-37} cy={-238} rx={7} ry={9} fill={c.skin} {...ink()} />
          <ellipse cx={37} cy={-238} rx={7} ry={9} fill={c.skin} {...ink()} />
          <path d="M-37,-246 C-37,-272 -20,-282 0,-282 C20,-282 37,-272 37,-246 C37,-221 26,-200 0,-198 C-26,-200 -37,-221 -37,-246 Z" fill={c.skin} {...ink()} />
          {/* hair: undercut with a soft swept top */}
          <path d="M-38,-244 C-39,-236 -38,-230 -36,-226 L-33,-240 Z M38,-246 C39,-238 38,-230 36,-226 L33,-242 Z" fill={c.hair} opacity={0.55} />
          <path d="M-38,-242 C-43,-268 -30,-292 -4,-294 C22,-296 43,-281 39,-245 C36,-253 33,-259 29,-263 C21,-269 13,-268 5,-266 C-7,-270 -20,-266 -28,-260 C-32,-256 -35,-250 -38,-242 Z" fill={c.hair} />
          <path d="M-14,-268 C-8,-282 10,-289 24,-282 C13,-280 5,-274 1,-266 Z" fill="#3a3236" />
          <path d="M-22,-283 Q-2,-292 18,-286" stroke="#4d454b" strokeWidth={2} fill="none" opacity={0.8} />
          {/* brows */}
          <path d="M-25,-257 Q-16,-262 -7,-258 M7,-258 Q16,-262 25,-257" stroke={c.hair} strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <Eyes lx={-15} rx={15} y={-239} rw={3.6} rh={4.3} happy={hug} still={still} delay={0.4} />
          {/* glasses */}
          <g fill="rgba(210,225,240,0.18)" stroke={c.glasses} strokeWidth={3}>
            <rect x={-29} y={-249} width={26} height={19} rx={5} />
            <rect x={3} y={-249} width={26} height={19} rx={5} />
            <path d="M-3,-242 Q0,-245 3,-242 M-29,-243 L-37,-241 M29,-243 L37,-241" fill="none" />
          </g>
          <path d="M-2,-228 Q1,-223 4,-227" stroke={c.skinShade} strokeWidth={2} fill="none" strokeLinecap="round" />
          <ellipse cx={-25} cy={-222} rx={7} ry={4} fill="#f2958f" opacity={0.38} />
          <ellipse cx={25} cy={-222} rx={7} ry={4} fill="#f2958f" opacity={0.38} />
          {hug ? (
            <path d="M-11,-216 Q0,-204 11,-216 Q0,-211 -11,-216 Z" fill="#b8545c" stroke="#8a3f45" strokeWidth={1.4} strokeLinejoin="round" />
          ) : (
            <path d="M-10,-216 Q0,-208 10,-216" stroke="#8a4a3e" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </g>
  )
}

/* ─────────────────────────── Mẹ (Wife) ─────────────────────────── */

export function Wife({ pose, still = false }: { pose: Pose; still?: boolean }) {
  const c = family.wife
  const hug = pose === 'hug'
  return (
    <g>
      <Shadow rx={42} />
      {/* back hair */}
      <path d="M-42,-224 C-48,-266 -16,-276 0,-274 C24,-276 48,-262 44,-220 C46,-194 54,-170 50,-142 C50,-128 40,-120 32,-126 L-32,-126 C-42,-120 -54,-130 -52,-146 C-56,-172 -46,-198 -42,-224 Z" fill={c.hair} {...ink()} />
      {/* joggers */}
      <path d="M-34,-112 L-3,-112 L-8,-28 C-12,-24 -24,-24 -28,-28 Z" fill={c.pants} {...ink()} />
      <path d="M3,-112 L34,-112 L28,-28 C24,-24 12,-24 8,-28 Z" fill={c.pants} {...ink()} />
      <path d="M-20,-100 L-18,-40 M20,-100 L18,-40" stroke="#474a57" strokeWidth={1.4} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <rect x={d > 0 ? 8 : -28} y={-34} width={20} height={7} rx={3} fill="#3f424e" />
          <rect x={d > 0 ? 10 : -26} y={-27} width={16} height={16} rx={3} fill={c.socks} />
          <path d={`M${d > 0 ? 10 : -26},-23 h16 M${d > 0 ? 10 : -26},-19 h16`} stroke="#f4f1ea" strokeWidth={1.6} />
          <path d={`M${d * 36},-2 C${d * 38},-14 ${d * 28},-17 ${d * 20},-16 C${d * 10},-16 ${d * 6},-11 ${d * 6},-2 Z`} fill={c.shoes} {...ink()} />
          {[0, 1].map((i) => (
            <circle key={i} cx={d * (15 + i * 8)} cy={-10} r={1.4} fill="#cfc4b0" />
          ))}
        </g>
      ))}
      <g className={still ? undefined : 'anim-breathe'} style={still ? undefined : { animationDelay: '0.8s' }}>
        {/* oversized black tee */}
        <path d="M-50,-170 C-40,-181 -18,-185 -11,-185 C-5,-178 5,-178 11,-185 C18,-185 40,-181 50,-170 L48,-98 C20,-92 -20,-92 -48,-98 Z" fill={c.shirt} {...ink()} />
        <path d="M-30,-160 C-28,-140 -30,-118 -34,-100 M26,-150 C28,-132 30,-116 32,-100" stroke="#554c51" strokeWidth={1.6} fill="none" opacity={0.8} />
        <rect x={-8} y={-196} width={16} height={16} rx={6} fill={c.skin} />
        <path d="M-11,-185 C-5,-178 5,-178 11,-185" stroke={c.skinShade} strokeWidth={2} fill="none" />
        {/* arms */}
        <Arm at={[-44, -164]} a1={30} a2={-18} upper={32} fore={28} armW={12.5} sleeve={c.shirt} sleeveLen={24} sleeveW={24} skin={c.skin} still={still} />
        <Arm
          at={[44, -164]}
          a1={hug ? 22 : -150}
          a2={hug ? 74 : -46}
          upper={32}
          fore={28}
          armW={12.5}
          sleeve={c.shirt}
          sleeveLen={24}
          sleeveW={24}
          skin={c.skin}
          still={still}
          hand={hug ? 'open' : 'v'}
          anim={hug ? undefined : 'anim-wave'}
          extra={<path d={`M-7,${22} Q0,${26} 7,${22}`} stroke="#e7c27a" strokeWidth={2} fill="none" />}
        />
        {/* head */}
        <path d="M-33,-222 C-33,-246 -18,-255 0,-255 C18,-255 33,-246 33,-222 C33,-200 22,-183 0,-181 C-22,-183 -33,-200 -33,-222 Z" fill={c.skin} {...ink()} />
        {/* bangs + front locks */}
        <path d="M-36,-220 C-40,-252 -14,-266 4,-262 C24,-262 40,-248 37,-220 C32,-234 22,-244 8,-246 C-2,-239 -14,-235 -24,-233 C-30,-231 -34,-227 -36,-220 Z" fill={c.hair} {...ink(1.2)} />
        <path d="M-34,-226 C-46,-204 -36,-182 -48,-160 C-54,-144 -46,-128 -36,-120 C-38,-140 -30,-158 -28,-178 C-26,-196 -28,-210 -29,-222 Z" fill={c.hair} {...ink(1.2)} />
        <path d="M34,-226 C46,-204 36,-182 48,-160 C54,-144 46,-128 36,-120 C38,-140 30,-158 28,-178 C26,-196 28,-210 29,-222 Z" fill={c.hair} {...ink(1.2)} />
        <path d="M-16,-258 C-4,-262 12,-260 24,-250 M-40,-200 C-42,-180 -40,-160 -44,-146 M42,-196 C44,-176 40,-160 44,-146" stroke={c.hairLight} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.75} />
        {/* face */}
        <path d="M-22,-238 Q-14,-242 -6,-239 M6,-239 Q14,-242 22,-238" stroke="#4a3027" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Eyes lx={-13} rx={13} y={-223} rw={3.4} rh={4.1} happy={hug} still={still} delay={1.6} />
        <g fill="rgba(210,225,240,0.16)" stroke={c.glasses} strokeWidth={2.4}>
          <rect x={-25} y={-232} width={23} height={17} rx={6} />
          <rect x={2} y={-232} width={23} height={17} rx={6} />
          <path d="M-2,-226 Q0,-228 2,-226" fill="none" />
        </g>
        <path d="M-1,-211 Q1,-207 3,-210" stroke={c.skinShade} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <ellipse cx={-22} cy={-206} rx={6.5} ry={3.8} fill="#f49aa3" opacity={0.45} />
        <ellipse cx={22} cy={-206} rx={6.5} ry={3.8} fill="#f49aa3" opacity={0.45} />
        <path d="M-11,-202 Q0,-189 11,-202 Q0,-198 -11,-202 Z" fill="#c75f69" stroke="#9c4650" strokeWidth={1.2} strokeLinejoin="round" />
        <path d="M-8,-201 Q0,-198.5 8,-201 L7,-199.4 Q0,-197 -7,-199.4 Z" fill="#fff" />
      </g>
    </g>
  )
}

/* ─────────────────────────── Chít (Son) ─────────────────────────── */

function MiniHeart({ x, y, s = 1, fill = '#ff6f8f' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0,6 C-11,-1 -6,-11 0,-5 C6,-11 11,-1 0,6 Z"
      fill={fill}
      stroke="#d94f6f"
      strokeWidth={0.8}
    />
  )
}

export function Chit({ pose, still = false }: { pose: Pose; still?: boolean }) {
  const c = family.chit
  const hug = pose === 'hug'
  return (
    <g>
      <Shadow rx={28} />
      <rect x={-15} y={-58} width={11} height={48} rx={5} fill={c.skin} {...ink(1.4)} />
      <rect x={4} y={-58} width={11} height={48} rx={5} fill={c.skin} {...ink(1.4)} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 20},-2 C${d * 21},-11 ${d * 14},-13 ${d * 9},-12 C${d * 4},-12 ${d * 2},-8 ${d * 2},-2 Z`} fill={c.shoes} {...ink(1.2)} />
          <rect x={d > 0 ? 4 : -18} y={-13} width={14} height={4} rx={2} fill={c.shoeAccent} />
        </g>
      ))}
      <g className={still ? undefined : 'anim-breathe'} style={still ? undefined : { animationDelay: '0.3s' }}>
        <path d="M-24,-86 L24,-86 C25,-74 26,-62 25,-50 C16,-47 8,-47 2,-50 L0,-64 L-2,-50 C-8,-47 -16,-47 -25,-50 C-26,-62 -25,-74 -24,-86 Z" fill={c.shorts} {...ink(1.4)} />
        <path d="M-22,-58 L-10,-56 M12,-56 L22,-58" stroke="#ffffff" strokeWidth={1.4} opacity={0.6} />
        {/* white doodle tee */}
        <path d="M-30,-115 C-24,-122 -12,-125 -7,-125 C-3,-120 3,-120 7,-125 C12,-125 24,-122 30,-115 L28,-80 C10,-75 -10,-75 -28,-80 Z" fill={c.shirt} {...ink(1.4)} />
        <g>
          <circle cx={-17} cy={-110} r={3.2} fill="#f26d6d" />
          <circle cx={-9} cy={-104} r={3} fill="#6cc070" />
          <circle cx={-10} cy={-105} r={0.7} fill="#222" />
          <circle cx={-8} cy={-105} r={0.7} fill="#222" />
          <path d="M1,-114 l1.6,3.4 3.6,0.4 -2.7,2.4 0.8,3.6 -3.3,-1.9 -3.3,1.9 0.8,-3.6 -2.7,-2.4 3.6,-0.4 Z" fill="#ffc93c" />
          <circle cx={10} cy={-104} r={3} fill="#5aa8e6" />
          <circle cx={18} cy={-110} r={2.6} fill="#ff9f43" />
          <circle cx={-2} cy={-99} r={2.2} fill="#c08cf0" />
          <circle cx={-22} cy={-102} r={1.6} fill="#ffc93c" />
          <circle cx={20} cy={-100} r={1.6} fill="#f26d6d" />
        </g>
        <rect x={-6} y={-132} width={12} height={10} rx={4} fill={c.skin} />
        <path d="M-7,-125 C-3,-120 3,-120 7,-125" stroke={c.shirtShade} strokeWidth={1.6} fill="none" />
        <Arm at={[-26, -112]} a1={hug ? 150 : 12} a2={hug ? 15 : -4} upper={20} fore={18} armW={9} sleeve={c.shirt} sleeveLen={9} sleeveW={15} skin={c.skin} still={still} />
        <Arm
          at={[26, -112]}
          a1={hug ? -150 : -148}
          a2={hug ? -15 : -26}
          upper={20}
          fore={18}
          armW={9}
          sleeve={c.shirt}
          sleeveLen={9}
          sleeveW={15}
          skin={c.skin}
          still={still}
          anim={hug ? undefined : 'anim-wave-fast'}
        />
        {/* head */}
        <ellipse cx={-29} cy={-145} rx={6} ry={7} fill={c.skin} {...ink(1.4)} />
        <ellipse cx={29} cy={-145} rx={6} ry={7} fill={c.skin} {...ink(1.4)} />
        <path d="M-29,-149 C-29,-171 -16,-179 0,-179 C16,-179 29,-171 29,-149 C29,-129 18,-117 0,-116 C-18,-117 -29,-129 -29,-149 Z" fill={c.skin} {...ink(1.4)} />
        {/* fluffy hair */}
        <path d="M-31,-147 C-41,-171 -31,-194 -10,-193 C-2,-202 19,-200 25,-189 C37,-185 41,-167 32,-147 C30,-157 26,-163 20,-165 C18,-157 10,-157 6,-163 C2,-156 -8,-155 -12,-163 C-16,-157 -24,-157 -26,-163 C-28,-157 -30,-153 -31,-147 Z" fill={c.hair} {...ink(1.2)} />
        <path d="M-18,-186 q4,-5 9,-2 M2,-191 q5,-4 10,0 M-26,-174 q2,-6 7,-6 M16,-182 q5,-2 8,3" stroke="#3d3438" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Eyes lx={-11} rx={11} y={-144} rw={3.4} rh={4.2} happy={hug} still={still} delay={2.4} />
        <g fill="rgba(220,236,248,0.28)" stroke={c.glasses} strokeWidth={2.2}>
          <circle cx={-11} cy={-144} r={10.5} />
          <circle cx={11} cy={-144} r={10.5} />
          <path d="M-0.5,-146 Q0,-148 0.5,-146" fill="none" />
        </g>
        <ellipse cx={-19} cy={-130} rx={5} ry={3} fill="#f49aa3" opacity={0.45} />
        <ellipse cx={19} cy={-130} rx={5} ry={3} fill="#f49aa3" opacity={0.45} />
        <path d="M-6,-128 Q0,-120 6,-128 Q0,-125 -6,-128 Z" fill="#c75f69" stroke="#9c4650" strokeWidth={1} strokeLinejoin="round" />
        {!hug && !still && (
          <g className="anim-heartpop">
            <MiniHeart x={42} y={-172} s={1.1} />
          </g>
        )}
      </g>
    </g>
  )
}

/* ─────────────────────────── Family ─────────────────────────── */

export const FAMILY_VIEWBOX = { w: 420, h: 330, ground: 318 }

interface FamilyProps {
  pose: Pose
  still?: boolean
  glow?: boolean
  className?: string
  onClick?: () => void
  title?: string
}

export function FamilyIllustration({ pose, still = false, glow = false, className, onClick, title }: FamilyProps) {
  const hug = pose === 'hug'
  const g = FAMILY_VIEWBOX.ground
  return (
    <svg
      viewBox={`0 0 ${FAMILY_VIEWBOX.w} ${FAMILY_VIEWBOX.h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      role="img"
      aria-label={title ?? 'Bố, mẹ và Chít'}
      width={still ? FAMILY_VIEWBOX.w : undefined}
      height={still ? FAMILY_VIEWBOX.h : undefined}
    >
      <defs>
        <radialGradient id="famGlow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#ffd6b8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffc8c8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={210}
        cy={190}
        rx={210}
        ry={160}
        fill="url(#famGlow)"
        style={still ? undefined : { opacity: glow || hug ? 1 : 0, transition: 'opacity 1.2s ease' }}
        opacity={still ? (glow || hug ? 1 : 0) : undefined}
      />
      <g {...tr({ x: hug ? 138 : 122, y: g, r: hug ? 4 : 0 }, still, 1)}>
        <Husband pose={pose} still={still} />
      </g>
      <g {...tr({ x: hug ? 284 : 300, y: g, r: hug ? -4 : 0 }, still, 1, 0.05)}>
        <Wife pose={pose} still={still} />
      </g>
      <g {...tr({ x: 211, y: hug ? g - 4 : g, s: hug ? 1.04 : 1 }, still, 1, 0.1)}>
        <Chit pose={pose} still={still} />
      </g>
      {hug && (
        <g className={still ? undefined : 'anim-hug-hearts'}>
          <MiniHeart x={150} y={60} s={1.3} />
          <MiniHeart x={214} y={40} s={1.7} fill="#ff8fab" />
          <MiniHeart x={280} y={58} s={1.2} fill="#ffa3b5" />
          <MiniHeart x={186} y={22} s={0.9} fill="#ffb4a2" />
          <MiniHeart x={248} y={20} s={1} />
        </g>
      )}
    </svg>
  )
}
