import type { ReactNode } from 'react'

/* Small SVG building blocks for the hand-painted scenery. */

export function SvgDaisy({ x, y, r, petal = '#fffaf3', center = '#ffc94d', rot = 0 }: { x: number; y: number; r: number; petal?: string; center?: string; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-r * 0.55} rx={r * 0.17} ry={r * 0.45} fill={petal} stroke="#e7c9d6" strokeWidth={0.6} transform={`rotate(${i * 36})`} />
      ))}
      <circle r={r * 0.3} fill={center} />
    </g>
  )
}

export function SvgBlossom({ x, y, r, petal = '#ffc4d4', center = '#e0678a', rot = 0 }: { x: number; y: number; r: number; petal?: string; center?: string; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          transform={`rotate(${i * 72})`}
          d={`M0,0 C${-r * 0.55},${-r * 0.25} ${-r * 0.6},${-r * 0.9} ${-r * 0.16},${-r * 0.98} L0,${-r * 0.86} L${r * 0.16},${-r * 0.98} C${r * 0.6},${-r * 0.9} ${r * 0.55},${-r * 0.25} 0,0 Z`}
          fill={petal}
          stroke="#e996b0"
          strokeWidth={0.6}
        />
      ))}
      <circle r={r * 0.18} fill={center} />
    </g>
  )
}

export function SvgTulip({ x, y, h, color = '#ff8fa8', deep = '#e9607e' }: { x: number; y: number; h: number; color?: string; deep?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0,0 Q${h * 0.06},${-h * 0.4} 0,${-h * 0.75}`} stroke="#6ea862" strokeWidth={h * 0.06} fill="none" strokeLinecap="round" />
      <path d={`M0,${-h * 0.1} Q${h * 0.3},${-h * 0.3} ${h * 0.24},${-h * 0.55} Q${h * 0.08},${-h * 0.3} 0,${-h * 0.1} Z`} fill="#8cc277" />
      <path
        d={`M${-h * 0.16},${-h * 0.8} Q${-h * 0.2},${-h * 1.02} ${-h * 0.08},${-h * 1.06} L0,${-h * 0.96} L${h * 0.08},${-h * 1.06} Q${h * 0.2},${-h * 1.02} ${h * 0.16},${-h * 0.8} Q${h * 0.12},${-h * 0.68} 0,${-h * 0.68} Q${-h * 0.12},${-h * 0.68} ${-h * 0.16},${-h * 0.8} Z`}
        fill={color}
        stroke={deep}
        strokeWidth={0.8}
      />
    </g>
  )
}

const BED_COLORS = ['#ffb3c6', '#ffd6a5', '#fff1f5', '#cdb4ff', '#ffc8dd', '#ffe08a', '#f7a1b9']

/** A deterministic band of flowers, to sit along the bottom of a scene. */
export function FlowerBed({ width = 400, y = 0, seed = 1, density = 1, className }: { width?: number; y?: number; seed?: number; density?: number; className?: string }) {
  let s = seed * 9301
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const items: ReactNode[] = []
  const n = Math.round(26 * density)
  for (let i = 0; i < n; i++) {
    const x = (i / n) * width + rnd() * 16 - 8
    const yy = y + rnd() * 26
    const kind = rnd()
    const col = BED_COLORS[Math.floor(rnd() * BED_COLORS.length)]
    if (kind < 0.35) items.push(<SvgDaisy key={i} x={x} y={yy} r={7 + rnd() * 5} rot={rnd() * 60} />)
    else if (kind < 0.7) items.push(<SvgBlossom key={i} x={x} y={yy} r={7 + rnd() * 5} petal={col} rot={rnd() * 70} />)
    else items.push(<SvgTulip key={i} x={x} y={yy + 14} h={24 + rnd() * 12} color={col} />)
  }
  return <g className={className}>{items}</g>
}

export function Cloud({ x, y, s = 1, opacity = 0.9 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx={0} cy={6} rx={52} ry={14} fill="#fff" />
      <circle cx={-22} cy={0} r={18} fill="#fff" />
      <circle cx={4} cy={-8} r={24} fill="#fff" />
      <circle cx={28} cy={0} r={16} fill="#fff" />
      <ellipse cx={0} cy={12} rx={48} ry={6} fill="#ffe1e6" opacity={0.6} />
    </g>
  )
}

export function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-8,0 C-6,-40 -10,-70 -4,-100 L6,-100 C10,-70 6,-40 10,0 Z" fill="#a9785f" />
      <path d="M0,-70 C-14,-82 -24,-86 -34,-96 M2,-84 C14,-94 22,-100 30,-112" stroke="#a9785f" strokeWidth={5} strokeLinecap="round" fill="none" />
      <g className="anim-sway" style={{ transformOrigin: '0px -90px' }}>
        <circle cx={-34} cy={-118} r={36} fill="#9fcf8f" />
        <circle cx={10} cy={-140} r={44} fill="#b2dba0" />
        <circle cx={44} cy={-112} r={32} fill="#9fcf8f" />
        <circle cx={-4} cy={-104} r={34} fill="#a6d496" />
        <circle cx={-10} cy={-150} r={20} fill="#c7e6b7" opacity={0.8} />
        {[[-40, -126], [14, -160], [40, -120], [-10, -112], [24, -136], [-28, -96]].map(([cx, cy], i) => (
          <SvgBlossom key={i} x={cx} y={cy} r={6} petal="#ffd1dc" rot={i * 40} />
        ))}
      </g>
    </g>
  )
}

export function SunRays({ cx, cy, r = 260, opacity = 0.35 }: { cx: number; cy: number; r?: number; opacity?: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={opacity}>
      <g className="anim-rays">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} transform={`rotate(${i * 30})`} d={`M-10,0 L10,0 L${r * 0.12},${-r} L${-r * 0.12},${-r} Z`} fill="#fff6d6" opacity={0.55} />
        ))}
      </g>
    </g>
  )
}
