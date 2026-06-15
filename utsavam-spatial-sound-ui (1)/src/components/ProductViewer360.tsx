import { useRef, useState, useEffect, useCallback } from 'react'

interface ProductViewer360Props {
  images?: string[]
  title?: string
}

// Generate SVG frames of a speaker at different rotation angles
function generateSpeakerSVG(angle: number): string {
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const absCos = Math.abs(cos)
  // Body ellipse width changes with rotation
  const bodyW = 120 + absCos * 20
  const bodyH = 160

  // Colors
  const ring1 = '#FF6B35'
  const ring2 = '#F39C12'
  const cap = '#FF6B35'

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 320" width="280" height="320">
  <defs>
    <radialGradient id="bodyGrad" cx="50%" cy="40%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#0d0d0d"/>
    </radialGradient>
    <radialGradient id="coneGrad" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#222"/>
      <stop offset="100%" stop-color="#080808"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${ring1}"/>
      <stop offset="100%" stop-color="${ring2}"/>
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="140" cy="${170 + bodyH / 2 + 20}" rx="${bodyW * 0.8}" ry="15" fill="rgba(0,0,0,0.4)"/>

  <!-- Speaker Cabinet Body -->
  <rect x="${140 - bodyW / 2}" y="${170 - bodyH / 2}" width="${bodyW}" height="${bodyH}" rx="12" fill="url(#bodyGrad)" stroke="#333" stroke-width="1"/>

  <!-- 3D side effect -->
  <rect x="${140 + bodyW / 2 - 8}" y="${170 - bodyH / 2 + 8}" width="8" height="${bodyH - 8}" rx="4" fill="#0a0a0a"/>

  <!-- Speaker grille circle -->
  <circle cx="140" cy="130" r="${50 + absCos * 8}" fill="#0d0d0d" stroke="url(#ringGrad)" stroke-width="4"/>
  <circle cx="140" cy="130" r="${40 + absCos * 5}" fill="url(#coneGrad)" stroke="${ring2}" stroke-width="2"/>

  <!-- Cone lines -->
  ${[0.6, 0.75, 0.9].map((scale, i) => `
    <ellipse cx="140" cy="130" rx="${(40 + absCos * 5) * scale}" ry="${(40 + absCos * 5) * scale * 0.3}" fill="none" stroke="#333" stroke-width="1" opacity="${0.4 + i * 0.2}"/>
  `).join('')}

  <!-- Center cap -->
  <circle cx="140" cy="130" r="12" fill="${cap}" filter="url(#glow)"/>
  <circle cx="140" cy="130" r="6" fill="#FF8855"/>

  <!-- Bolt holes -->
  ${[0, 90, 180, 270].map(a => {
    const bRad = (a * Math.PI) / 180
    const bx = 140 + Math.cos(bRad) * (50 + absCos * 8)
    const by = 130 + Math.sin(bRad) * (50 + absCos * 8)
    return `<circle cx="${bx}" cy="${by}" r="4" fill="${ring1}" opacity="0.8"/>`
  }).join('')}

  <!-- Port / bass reflex hole -->
  <rect x="${140 - 20}" y="${170 + bodyH / 2 - 30}" width="40" height="12" rx="6" fill="#0a0a0a" stroke="#333" stroke-width="1"/>

  <!-- Logo text area -->
  <rect x="${140 - 40}" y="${170 + bodyH / 2 - 60}" width="80" height="20" rx="3" fill="#111" stroke="#222" stroke-width="1"/>
  <text x="140" y="${170 + bodyH / 2 - 46}" text-anchor="middle" fill="${ring1}" font-size="8" font-family="monospace" letter-spacing="2">UTSAVAM</text>

  <!-- Binding posts -->
  <circle cx="${140 - 25}" cy="${170 + bodyH / 2 - 10}" r="5" fill="#gold" stroke="${ring1}" stroke-width="2"/>
  <circle cx="${140 + 25}" cy="${170 + bodyH / 2 - 10}" r="5" fill="#silver" stroke="#999" stroke-width="2"/>

  <!-- Highlight sheen -->
  <rect x="${140 - bodyW / 2 + 4}" y="${170 - bodyH / 2 + 4}" width="${bodyW / 3}" height="${bodyH - 8}" rx="8"
    fill="url(#bodyGrad)" opacity="${0.2 + absCos * 0.2}"/>
</svg>`
}

export default function ProductViewer360({ title: _title = "UTSAVAM Speaker Array" }: ProductViewer360Props) {
  const [angle, setAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [_speed, setSpeed] = useState(0)
  const frameRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const totalFrames = 36

  const normalizedAngle = ((Math.round(angle / (360 / totalFrames)) * (360 / totalFrames)) % 360 + 360) % 360

  useEffect(() => {
    let last = performance.now()
    const tick = () => {
      if (autoRotate && !isDragging) {
        const now = performance.now()
        const dt = now - last
        last = now
        setAngle(a => (a + dt * 0.04) % 360)
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [autoRotate, isDragging])

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    setAutoRotate(false)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setLastX(clientX)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const delta = clientX - lastX
    setAngle(a => (a + delta * 0.8 + 360) % 360)
    setSpeed(delta)
    setLastX(clientX)
  }, [isDragging, lastX])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => setAutoRotate(true), 3000)
  }, [])

  const currentSVG = generateSpeakerSVG(normalizedAngle)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-mono text-xs text-orange-400 tracking-widest">360° VIEW</span>
        </div>
        <div className="font-mono text-xs text-gray-500">
          {Math.round(normalizedAngle)}°
        </div>
      </div>

      {/* SVG Viewer */}
      <div
        ref={containerRef}
        className="rotate-360-viewer flex items-center justify-center"
        style={{ width: '100%', height: '300px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div
          ref={svgContainerRef}
          dangerouslySetInnerHTML={{ __html: currentSVG }}
          className="transition-none"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(255,107,53,0.3))' }}
        />
      </div>

      {/* Rotation indicator */}
      <div className="flex items-center gap-3 mt-2">
        <div className="relative w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${(normalizedAngle / 360) * 100}%`,
              background: 'linear-gradient(90deg, #FF6B35, #F39C12)'
            }}
          />
        </div>
        <span className="text-xs text-gray-500 font-mono">
          {autoRotate ? 'AUTO' : 'DRAG'}
        </span>
      </div>

      {/* Drag hint */}
      <div className="flex items-center gap-2 mt-3 opacity-50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
          <path d="M9 14l-4-4 4-4M15 10h-4M15 14l4-4-4-4"/>
        </svg>
        <span className="text-xs text-gray-500">Drag to rotate</span>
      </div>

      {/* Specs overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Channels', value: '13' },
            { label: 'LFE', value: '2×' },
            { label: 'Config', value: '9.2.2' },
          ].map((spec) => (
            <div key={spec.label} className="bg-white/5 rounded p-2">
              <div className="text-orange-400 font-mono text-sm font-bold">{spec.value}</div>
              <div className="text-gray-500 text-xs">{spec.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
