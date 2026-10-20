/**
 * Original side-profile illustration of a Mazda 2 sedan in pearl white,
 * proportioned from the real car (≈4.34 m long, 2.57 m wheelbase, long hood,
 * coupé-like roofline, short high trunk, slim swept headlights, 5-spoke alloys).
 * Front faces right. No logos are reproduced.
 */

interface Props {
  lightsOn?: boolean
  spinning?: boolean
  still?: boolean
  className?: string
  idPrefix?: string
}

export const MAZDA_VIEWBOX = { w: 440, h: 172 }

function Wheel({ cx, cy, spinning, still, id }: { cx: number; cy: number; spinning: boolean; still: boolean; id: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={29} fill="#2b2a30" />
      <circle r={27} fill="none" stroke="#3d3c44" strokeWidth={2} />
      <circle r={20} fill={`url(#${id}-rim)`} stroke="#9aa0ab" strokeWidth={1} />
      <g className={!still && spinning ? 'anim-spin' : undefined}>
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M-3.2,-4 L-5.4,-18.5 L5.4,-18.5 L3.2,-4 Z" fill="#e9ecf1" stroke="#a7adb8" strokeWidth={0.8} />
          </g>
        ))}
        <circle r={18.6} fill="none" stroke="#c9ced6" strokeWidth={1.6} />
      </g>
      <circle r={5.2} fill="#c7ccd4" stroke="#8b919c" strokeWidth={1} />
      <circle r={2} fill="#7d838e" />
    </g>
  )
}

export function MazdaIllustration({ lightsOn = false, spinning = false, still = false, className, idPrefix = 'mz' }: Props) {
  const id = idPrefix
  return (
    <svg
      viewBox={`0 0 ${MAZDA_VIEWBOX.w} ${MAZDA_VIEWBOX.h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Chiếc Mazda 2 màu trắng ngọc trai"
      width={still ? MAZDA_VIEWBOX.w : undefined}
      height={still ? MAZDA_VIEWBOX.h : undefined}
      overflow="visible"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.38" stopColor="#fbf6f1" />
          <stop offset="0.62" stopColor="#efe5e0" />
          <stop offset="0.85" stopColor="#ddd1d2" />
          <stop offset="1" stopColor="#c8bcc2" />
        </linearGradient>
        <linearGradient id={`${id}-pearl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd9e4" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff6d8" stopOpacity="0.2" />
          <stop offset="1" stopColor="#dbe8ff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b5878" />
          <stop offset="1" stopColor="#7d8db3" />
        </linearGradient>
        <radialGradient id={`${id}-rim`}>
          <stop offset="0" stopColor="#f5f6f8" />
          <stop offset="1" stopColor="#b6bcc6" />
        </radialGradient>
        <radialGradient id={`${id}-beam`} cx="0" cy="0.5" r="1">
          <stop offset="0" stopColor="#fff7d1" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#ffe9a8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx={222} cy={160} rx={214} ry={9} fill="#6d4a4a" opacity={0.2} />

      {/* headlight beam */}
      <path
        d="M426,100 L560,70 L560,150 Z"
        fill={`url(#${id}-beam)`}
        style={still ? undefined : { opacity: lightsOn ? 1 : 0, transition: 'opacity .6s ease' }}
        opacity={still ? (lightsOn ? 1 : 0) : undefined}
      />

      {/* body */}
      <path
        d="M22,130 C14,127 11,113 12,100 C13,88 18,78 30,75 L96,70 C112,66 132,36 156,28 C184,20 232,20 258,28 C278,36 296,62 310,76 C344,82 382,85 412,91 C426,95 432,102 431,110 C431,120 428,128 418,131 L388,131 A37,37 0 0,0 314,131 L140,131 A37,37 0 0,0 66,131 Z"
        fill={`url(#${id}-body)`}
        stroke="#8f7f86"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M22,130 C14,127 11,113 12,100 C13,88 18,78 30,75 L96,70 C112,66 132,36 156,28 C184,20 232,20 258,28 C278,36 296,62 310,76 C344,82 382,85 412,91 C426,95 432,102 431,110 C431,120 428,128 418,131 L22,131 Z" fill={`url(#${id}-pearl)`} />

      {/* windows */}
      <path d="M298,78 C284,60 270,40 254,33 C232,26 190,26 170,30 C150,35 134,52 120,71 Z" fill={`url(#${id}-glass)`} stroke="#3c4560" strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M205,27 L212,27 L215,78 L208,78 Z" fill="#2f3446" />
      <path d="M148,42 L155,38 L160,74 L152,74 Z" fill="#2f3446" />
      <path d="M236,30 C250,34 262,44 272,58 L258,58 C250,46 242,38 230,32 Z" fill="#ffffff" opacity={0.35} />
      <path d="M176,32 L196,31 L186,52 L168,52 Z" fill="#ffffff" opacity={0.22} />

      {/* mirror */}
      <path d="M298,79 C295,71 303,67 312,69 C317,71 316,78 309,81 Z" fill="#f6efea" stroke="#8f7f86" strokeWidth={1.2} />

      {/* character lines (Kodo-style) */}
      <path d="M404,96 C340,92 240,88 64,84" stroke="#ffffff" strokeWidth={2.2} fill="none" opacity={0.9} />
      <path d="M404,97 C340,93 240,89 64,85" stroke="#b9aab0" strokeWidth={1} fill="none" opacity={0.6} />
      <path d="M302,121 C250,114 190,106 120,100" stroke="#cdbfc3" strokeWidth={1.6} fill="none" />
      <path d="M302,122 C250,115 190,107 120,101" stroke="#ffffff" strokeWidth={1} fill="none" opacity={0.8} />

      {/* door seams + handles */}
      <path d="M300,80 L303,128 M214,78 L216,128 M134,74 L138,118" stroke="#b3a4aa" strokeWidth={1.1} fill="none" />
      <rect x={266} y={91} width={16} height={4} rx={2} fill="#d8ccd0" stroke="#a8999f" strokeWidth={0.8} />
      <rect x={180} y={89} width={16} height={4} rx={2} fill="#d8ccd0" stroke="#a8999f" strokeWidth={0.8} />

      {/* sill shadow */}
      <path d="M140,131 L314,131 L312,126 L142,126 Z" fill="#c4b6bc" opacity={0.7} />

      {/* headlight */}
      <path d="M431,104 C424,98 410,94 395,94 C403,99 415,104 428,109 Z" fill="#eef4fb" stroke="#8f8f9e" strokeWidth={1} />
      <path
        d="M431,104 C424,98 410,94 395,94 C403,99 415,104 428,109 Z"
        fill="#fff3b0"
        style={still ? undefined : { opacity: lightsOn ? 1 : 0, transition: 'opacity .4s ease' }}
        opacity={still ? (lightsOn ? 1 : 0) : undefined}
      />
      {/* grille hint */}
      <path d="M431,112 C429,119 425,125 419,129 L425,129 C430,123 432,117 431,112 Z" fill="#3a3740" />
      {/* fog / lower intake */}
      <path d="M404,122 L420,122 L418,127 L406,127 Z" fill="#4a4752" opacity={0.7} />

      {/* taillight */}
      <path d="M13,92 C19,86 29,83 40,83 C34,88 24,92 14,97 Z" fill="#e2566e" stroke="#a63a4f" strokeWidth={1} />
      <path d="M15,93 C20,89 26,87 32,86" stroke="#ffc2cc" strokeWidth={1.2} fill="none" />

      {/* plate on the trunk edge, a tiny wink */}
      <rect x={14} y={104} width={10} height={14} rx={1.5} fill="#f7f4ec" stroke="#a49aa0" strokeWidth={0.8} />

      <Wheel cx={351} cy={129} spinning={spinning} still={still} id={id} />
      <Wheel cx={103} cy={129} spinning={spinning} still={still} id={id} />
    </svg>
  )
}
