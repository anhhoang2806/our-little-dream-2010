import { Cloud, FlowerBed, SunRays, Tree } from './Decor'

export type BackdropVariant = 'dawn' | 'garden' | 'afternoon' | 'countryside' | 'golden'

const SKIES: Record<BackdropVariant, [string, string, string, string]> = {
  dawn: ['#f9c6cf', '#fcd9d3', '#ffe9dc', '#fff6ec'],
  garden: ['#fbd3d8', '#fde4dc', '#fff0e3', '#fff8ef'],
  afternoon: ['#ffcfae', '#ffe0c4', '#fff0dc', '#fff8ec'],
  countryside: ['#c9e2f2', '#e8e4f0', '#fde3d8', '#fff2df'],
  golden: ['#ffc896', '#ffdcb8', '#ffeedd', '#fff7ec'],
}

const SUN: Record<BackdropVariant, { x: number; y: number; r: number; color: string }> = {
  dawn: { x: 200, y: 150, r: 220, color: '#fff4cf' },
  garden: { x: 300, y: 110, r: 180, color: '#fff3d6' },
  afternoon: { x: 320, y: 120, r: 220, color: '#fff0c2' },
  countryside: { x: 90, y: 140, r: 190, color: '#fff3d1' },
  golden: { x: 200, y: 260, r: 320, color: '#ffe7a8' },
}

/**
 * Full-bleed painted background. Uses `slice` so it always covers the screen;
 * a slow "camera" drift gives the feeling of gentle cinematic movement.
 */
export function Backdrop({ variant, hills = true, tree = false, flowers = false }: { variant: BackdropVariant; hills?: boolean; tree?: boolean; flowers?: boolean }) {
  const sky = SKIES[variant]
  const sun = SUN[variant]
  const id = `bd-${variant}`
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="anim-camera absolute inset-[-4%]">
        <svg className="h-full w-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={sky[0]} />
              <stop offset="0.35" stopColor={sky[1]} />
              <stop offset="0.7" stopColor={sky[2]} />
              <stop offset="1" stopColor={sky[3]} />
            </linearGradient>
            <radialGradient id={`${id}-sun`}>
              <stop offset="0" stopColor="#fffdf2" stopOpacity="1" />
              <stop offset="0.18" stopColor={sun.color} stopOpacity="0.95" />
              <stop offset="0.5" stopColor={sun.color} stopOpacity="0.35" />
              <stop offset="1" stopColor={sun.color} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-hill1`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={variant === 'countryside' ? '#c8dcb4' : '#d9e8c4'} />
              <stop offset="1" stopColor={variant === 'golden' ? '#e9dcb0' : '#c4dcae'} />
            </linearGradient>
            <linearGradient id={`${id}-hill2`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={variant === 'golden' ? '#d6d79f' : '#b7d6a0'} />
              <stop offset="1" stopColor={variant === 'golden' ? '#c4c98c' : '#9fc78c'} />
            </linearGradient>
          </defs>
          <rect width="400" height="800" fill={`url(#${id}-sky)`} />
          {/* soft painted wash blobs */}
          <ellipse cx="60" cy="260" rx="160" ry="90" fill="#ffffff" opacity="0.22" />
          <ellipse cx="360" cy="420" rx="170" ry="80" fill="#ffd9e4" opacity="0.25" />
          <circle cx={sun.x} cy={sun.y} r={sun.r} fill={`url(#${id}-sun)`} />
          {(variant === 'afternoon' || variant === 'golden' || variant === 'dawn') && <SunRays cx={sun.x} cy={sun.y} r={variant === 'golden' ? 520 : 420} opacity={variant === 'dawn' ? 0.28 : 0.38} />}
          <g className="anim-drift">
            <Cloud x={70} y={120} s={0.9} />
            <Cloud x={310} y={230} s={0.7} opacity={0.75} />
            <Cloud x={500} y={90} s={0.8} />
          </g>
          <g className="anim-drift-slow">
            <Cloud x={190} y={320} s={0.55} opacity={0.6} />
            <Cloud x={-80} y={380} s={0.6} opacity={0.6} />
          </g>
          {variant === 'countryside' && (
            <g>
              <path d="M-20,520 L40,440 L90,480 L150,400 L220,470 L270,430 L330,480 L380,420 L430,500 L430,560 L-20,560 Z" fill="#cbbfdf" opacity="0.75" />
              <path d="M150,400 L170,420 L160,425 L140,415 Z M380,420 L392,436 L374,432 Z" fill="#fff" opacity="0.8" />
            </g>
          )}
          {hills && (
            <g>
              <path d="M-20,560 C60,500 140,520 220,540 C300,560 360,520 430,500 L430,800 L-20,800 Z" fill={`url(#${id}-hill1)`} />
              <path d="M-20,640 C80,590 180,600 260,620 C330,636 380,612 430,600 L430,800 L-20,800 Z" fill={`url(#${id}-hill2)`} />
              {/* scattered tiny flowers on the hills */}
              {Array.from({ length: 40 }, (_, i) => {
                const x = (i * 97) % 420
                const y = 560 + ((i * 53) % 220)
                const c = ['#fff', '#ffc4d4', '#ffe08a', '#d9c2ff'][i % 4]
                return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill={c} opacity={0.85} />
              })}
            </g>
          )}
          {tree && <Tree x={52} y={640} s={1.05} />}
          {flowers && (
            <g className="anim-sway-soft">
              <FlowerBed width={420} y={735} seed={3} density={1.1} />
              <FlowerBed width={420} y={760} seed={7} density={1.2} />
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
