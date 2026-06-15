import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Speaker3D from './components/Speaker3D'
import RoomViewer360 from './components/RoomViewer360'
import ProductViewer360 from './components/ProductViewer360'
import Waveform from './components/Waveform'

// ─── Data ────────────────────────────────────────────────────────────────────

const THEYYAM_IMAGES = [
  {
    url: 'https://images.pexels.com/photos/37989105/pexels-photo-37989105.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    caption: 'Theyyam — The God Descends',
  },
  {
    url: 'https://images.pexels.com/photos/20142770/pexels-photo-20142770.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    caption: 'Sacred Body Paint & Ritual Costume',
  },
  {
    url: 'https://images.pexels.com/photos/31008396/pexels-photo-31008396.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    caption: 'Centuries of Living Tradition',
  },
  {
    url: 'https://images.pexels.com/photos/18477457/pexels-photo-18477457.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    caption: 'Fire — The Divine Element',
  },
  {
    url: 'https://images.pexels.com/photos/33185108/pexels-photo-33185108.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    caption: 'Night Ceremony at the Shrine',
  },
  {
    url: 'https://images.pexels.com/photos/31511994/pexels-photo-31511994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    caption: 'The Torchbearer Ritual',
  },
]

const CHANNELS = [
  { id: 'FL', label: 'Front Left', desc: 'Chenda — Primary Percussion', color: '#FF6B35', angle: 315 },
  { id: 'FC', label: 'Front Center', desc: 'Crowd — Festival Roar', color: '#F39C12', angle: 0 },
  { id: 'FR', label: 'Front Right', desc: 'Elathalam — Cymbals', color: '#FF6B35', angle: 45 },
  { id: 'SL', label: 'Side Left', desc: 'Kombu — Horn Blows', color: '#C0392B', angle: 270 },
  { id: 'SR', label: 'Side Right', desc: 'Thudi — Small Drum', color: '#C0392B', angle: 90 },
  { id: 'RL', label: 'Rear Left', desc: 'Vocal Chants', color: '#8B4513', angle: 225 },
  { id: 'RL2', label: 'Rear Right', desc: 'Temple Bells', color: '#8B4513', angle: 135 },
  { id: 'C1', label: 'Ceiling L', desc: 'Overhead Ambience', color: '#666', angle: 330 },
  { id: 'C2', label: 'Ceiling R', desc: 'Rain & Sky', color: '#666', angle: 30 },
]

const INSTRUMENTS = [
  { name: 'Chenda', role: 'Primary Rhythm', freq: '80–800Hz', desc: 'The heartbeat of Theyyam. Double-headed cylindrical drum that drives the ritual energy with unrelenting power.', channel: 'FL', emoji: '🥁' },
  { name: 'Elathalam', role: 'Shimmer Layer', freq: '2k–12kHz', desc: 'Pairs of small bronze cymbals creating the high shimmer that cuts through the festival chaos.', channel: 'FR', emoji: '🔔' },
  { name: 'Kombu', role: 'Harmonic Arc', freq: '200–1kHz', desc: 'A curved brass horn that announces divine presence and punctuates the soundscape with majestic calls.', channel: 'SL', emoji: '📯' },
  { name: 'Thudi', role: 'Counter-Pulse', freq: '150–500Hz', desc: 'A smaller hourglass drum providing the syncopated counter-rhythm to the Chenda\'s dominance.', channel: 'SR', emoji: '🪘' },
]

const TIMELINE = [
  { phase: '01', label: 'Concept & Research', date: '2023', desc: 'Field recordings at Theyyam festivals in Kannur. Ethnographic sound mapping of the ritual acoustic environment.', status: 'done' },
  { phase: '02', label: 'Dolby Atmos Phase', date: 'Early 2024', desc: 'Initial spatial mix using Dolby Atmos Renderer with bed-object separation. Proof of concept.', status: 'done' },
  { phase: '03', label: 'REAPER Pivot', date: 'Mid 2024', desc: 'Shifted to discrete 9.2.2 routing in REAPER for absolute hardware-level control. Hotspot engineering.', status: 'done' },
  { phase: '04', label: 'Gallery Exhibition', date: 'Late 2024', desc: 'Successful premiere exhibition. Hard-routed spatial mapping drove visitor movement through the installation.', status: 'done' },
  { phase: '05', label: 'Animela', date: '2025', desc: 'National platform for immersive arts. Expanding with generative visuals and real-time audio-reactive projections.', status: 'active' },
  { phase: '06', label: 'Kochi-Muziris Biennale', date: '2025–2026', desc: 'Scale to HOA workflows (IEM Suite). 24–32+ channel rooms. Interactive audience tracking.', status: 'upcoming' },
]

const SPECS = [
  { label: 'Speaker Array', value: '9.2.2', sub: 'Custom Configuration' },
  { label: 'Total Channels', value: '13', sub: 'Discrete Outputs' },
  { label: 'Front Speakers', value: '3×', sub: 'Primary Directional' },
  { label: 'Side / Rear', value: '6×', sub: 'Perimeter Hotspots' },
  { label: 'Ceiling', value: '2×', sub: 'Height Dimension' },
  { label: 'Subwoofers', value: '2×', sub: 'Low-Freq Energy (LFE)' },
]

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ─── Hotspot Map ──────────────────────────────────────────────────────────────
function HotspotMap({ activeChannel, setActiveChannel }: { activeChannel: string | null; setActiveChannel: (id: string | null) => void }) {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Room outline */}
      <div className="absolute inset-4 border border-orange-500/20 rounded-lg" />
      <div className="absolute inset-12 border border-orange-500/10 rounded-full" />

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-2 hotspot-pulse">
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-orange-400 text-xs font-mono tracking-widest">CENTER</p>
          <p className="text-gray-500 text-xs mt-1">Full Chaos</p>
        </div>
      </div>

      {/* Speaker hotspots */}
      {CHANNELS.map((ch) => {
        const rad = ((ch.angle - 90) * Math.PI) / 180
        const r = 42 // % from center
        const x = 50 + Math.cos(rad) * r
        const y = 50 + Math.sin(rad) * r
        const isActive = activeChannel === ch.id

        return (
          <button
            key={ch.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => setActiveChannel(isActive ? null : ch.id)}
          >
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              isActive
                ? 'border-orange-500 bg-orange-500/30 scale-125'
                : 'border-gray-600 bg-gray-900/80 hover:border-orange-400 hover:scale-110'
            }`}>
              <span className="text-xs">🔊</span>
            </div>
            {isActive && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-orange-500/30 rounded px-2 py-1 text-xs text-orange-300 font-mono z-10">
                {ch.desc}
              </div>
            )}
            {/* Ping animation */}
            {isActive && (
              <div className="absolute inset-0 rounded-full border border-orange-500 channel-dot" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Waveform Visualizer Bar ──────────────────────────────────────────────────
function AudioBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-1 h-12">
      {Array.from({ length: 20 }).map((_, i) => {
        const maxH = 20 + Math.random() * 28
        return (
          <div
            key={i}
            className="waveform-bar flex-1 rounded-sm"
            style={{
              '--h': `${maxH}px`,
              '--dur': `${0.5 + Math.random() * 0.8}s`,
              height: isPlaying ? `${maxH}px` : '4px',
              background: i < 7 ? '#FF6B35' : i < 14 ? '#F39C12' : '#C0392B',
              transition: isPlaying ? 'none' : 'height 0.3s ease',
              animationPlayState: isPlaying ? 'running' : 'paused',
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [activeInstrument, setActiveInstrument] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [imgIndex, setImgIndex] = useState(0)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex(i => (i + 1) % THEYYAM_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const scrollProgress = Math.min(scrollY / (document.body?.scrollHeight - window.innerHeight || 1), 1) * 100

  return (
    <div className="grain min-h-screen bg-[#0A0A0A] text-[#F5F0E8] overflow-x-hidden">
      {/* Scroll progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Nav */}
      <nav className="fixed top-2 left-0 right-0 z-50 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-orange-500/50 flex items-center justify-center">
            <span className="text-orange-500 text-xs">🔥</span>
          </div>
          <span className="font-mono text-sm tracking-[0.25em] text-orange-400">UTSAVAM</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-mono text-gray-500 tracking-widest">
          {['CONCEPT', 'TECH', 'SPATIAL', 'TIMELINE'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-orange-400 transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="tag bg-orange-500/10 text-orange-400 border border-orange-500/20">
          PORTFOLIO 2025
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        id="concept"
      >
        {/* Background image carousel */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIndex}
              src={THEYYAM_IMAGES[imgIndex].url}
              alt={THEYYAM_IMAGES[imgIndex].caption}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2 }}
            />
          </AnimatePresence>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0A0A0A]" />
          {/* Color grading */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-950/30 via-transparent to-red-950/30" />
        </div>

        {/* Floating caption */}
        <div className="absolute bottom-32 right-8 z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={imgIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-xs font-mono text-gray-400 tracking-widest"
            >
              {THEYYAM_IMAGES[imgIndex].caption}
            </motion.p>
          </AnimatePresence>
          {/* Dots */}
          <div className="flex gap-1.5 mt-2 justify-end">
            {THEYYAM_IMAGES.map((_, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full transition-all duration-500"
                style={{
                  width: i === imgIndex ? '24px' : '8px',
                  background: i === imgIndex ? '#FF6B35' : '#444'
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500" />
            <span className="tag bg-orange-500/20 text-orange-300 border border-orange-500/30">
              IMMERSIVE SPATIAL SOUND INSTALLATION
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-[clamp(4rem,14vw,10rem)] font-black leading-none tracking-tight glow-saffron"
            style={{ color: '#F5F0E8' }}
          >
            UTSAVAM
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[clamp(0.9rem,2vw,1.25rem)] text-gray-300 max-w-2xl mx-auto mt-4 leading-relaxed font-light tracking-wide"
          >
            Translating the vibrant, overwhelming chaos of a Kerala temple festival
            into a{' '}
            <span className="text-orange-400 font-medium">controlled physical space</span>{' '}
            through precision spatial audio engineering.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-full px-5 py-2.5">
              <span className="text-orange-400 font-mono text-sm">9.2.2</span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-gray-300 text-sm">Custom Speaker Array</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-full px-5 py-2.5">
              <span className="text-orange-400 font-mono text-sm">13</span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-gray-300 text-sm">Discrete Channels</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur border border-white/10 rounded-full px-5 py-2.5">
              <span className="text-orange-400 font-mono text-sm">HOA</span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-gray-300 text-sm">Next Phase</span>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <div className="w-px h-12 bg-gradient-to-b from-orange-500 to-transparent" />
            <span className="font-mono text-xs text-gray-500 tracking-widest">SCROLL</span>
          </motion.div>
        </div>
      </motion.section>

      {/* ── CONCEPT STRIP ──────────────────────────────────────────────────── */}
      <Section className="py-20 px-6 max-w-7xl mx-auto" id="concept-strip">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {[
            {
              icon: '🏛️',
              title: 'The Center',
              sub: 'Full Festival Chaos',
              desc: 'Stand at the heart of the installation amongst Pongala pots and bricks. Every speaker fires simultaneously — the unfiltered sonic assault of a Theyyam festival at full roar.',
              color: '#FF6B35',
            },
            {
              icon: '📍',
              title: 'The Hotspots',
              sub: 'Intimate Isolation',
              desc: 'Walk toward any perimeter speaker. The global chaos dips. A single instrument emerges — the Chenda\'s heartbeat, the Elathalam\'s shimmer — alongside its visual and information panel.',
              color: '#F39C12',
            },
            {
              icon: '🎭',
              title: 'The Experience',
              sub: 'Your Journey',
              desc: 'The listener becomes the composer. Movement through space becomes the act of curation — choosing what to hear, how much chaos to embrace, how deeply to listen.',
              color: '#C0392B',
            },
          ].map((item) => (
            <div key={item.title} className="bg-[#111] p-8 hover:bg-[#141414] transition-colors group">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform group-hover:scale-110"
                style={{ background: item.color + '15', border: `1px solid ${item.color}30` }}
              >
                {item.icon}
              </div>
              <div className="tag mb-3 w-fit" style={{ color: item.color, background: item.color + '15', border: `1px solid ${item.color}30` }}>
                {item.sub}
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3D SPEAKER + AUDIO DEMO ───────────────────────────────────────── */}
      <Section className="py-20 px-6" id="tech">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: 3D Speaker */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="section-line" />
                <span className="tag text-orange-400 bg-orange-500/10 border border-orange-500/20">
                  INTERACTIVE 3D
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                The Sound
                <br />
                <span className="text-gradient">Architecture</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Each speaker in the array is engineered to carry a single sonic element.
                The physical movement of the listener through space is the UX. Press play
                to hear the system breathe.
              </p>

              {/* Play button */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300"
                  style={{
                    background: isPlaying ? 'rgba(255,107,53,0.2)' : 'transparent',
                    borderColor: isPlaying ? '#FF6B35' : '#444',
                    color: isPlaying ? '#FF6B35' : '#888',
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPlaying ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    {isPlaying ? (
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-white rounded" />
                        <div className="w-1 h-3 bg-white rounded" />
                      </div>
                    ) : (
                      <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-transparent border-l-white ml-0.5" />
                    )}
                  </div>
                  <span className="font-mono text-sm tracking-widest">
                    {isPlaying ? 'PLAYING' : 'SIMULATE SOUND'}
                  </span>
                </button>

                <div className="flex-1">
                  <AudioBars isPlaying={isPlaying} />
                </div>
              </div>

              {/* Waveform */}
              <div className="h-20 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                <Waveform isPlaying={isPlaying} color="#FF6B35" bars={50} height={50} />
              </div>

              {/* Spec pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                {['REAPER DAW', 'Discrete Routing', 'Point-Source Isolation', 'Master Bus 12ch'].map(tag => (
                  <span key={tag} className="tag bg-white/5 border border-white/10 text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: 3D Speaker */}
            <div className="relative h-96 lg:h-[500px]">
              {/* Glow bg */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-64 h-64 rounded-full opacity-20 blur-3xl"
                  style={{ background: isPlaying ? 'radial-gradient(#FF6B35, transparent)' : 'radial-gradient(#333, transparent)' }}
                />
              </div>
              <Speaker3D isPlaying={isPlaying} />
              <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-gray-600 font-mono tracking-widest">
                DRAG TO ORBIT
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SPATIAL MAP ──────────────────────────────────────────────────────── */}
      <Section className="py-20 px-6 bg-[#0d0d0d]" id="spatial">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="section-line" />
              <span className="tag text-orange-400 bg-orange-500/10 border border-orange-500/20">HOTSPOT MAP</span>
              <div className="section-line" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Touch a Speaker,
              <br />
              <span className="text-gradient">Isolate an Instrument</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Click any speaker node on the map to simulate what the listener hears when they walk toward that hotspot.
              The center holds full chaos — the perimeter reveals individual voices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hotspot map */}
            <div className="relative">
              <HotspotMap activeChannel={activeChannel} setActiveChannel={setActiveChannel} />

              {/* Active channel info */}
              <AnimatePresence>
                {activeChannel && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20"
                  >
                    {(() => {
                      const ch = CHANNELS.find(c => c.id === activeChannel)
                      return ch ? (
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-lg">🔊</div>
                          <div>
                            <p className="text-orange-400 font-mono text-sm">{ch.label}</p>
                            <p className="text-white font-medium">{ch.desc}</p>
                          </div>
                          <div className="ml-auto">
                            <div className="h-8">
                              <Waveform isPlaying={true} color="#FF6B35" bars={12} height={20} />
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3D Room */}
            <div className="h-96 rounded-2xl overflow-hidden border border-white/5 relative">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="font-mono text-xs text-orange-400 tracking-widest">3D ROOM VIEW</span>
              </div>
              <RoomViewer360 activeChannel={activeChannel} />
              <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                <span className="font-mono text-xs text-gray-600">AUTO ORBIT • DRAG TO CONTROL</span>
                <span className="font-mono text-xs text-gray-600">9.2.2 ARRAY</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── INSTRUMENTS ──────────────────────────────────────────────────────── */}
      <Section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="section-line" />
            <span className="tag text-orange-400 bg-orange-500/10 border border-orange-500/20">SOUND OBJECTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSTRUMENTS.map((inst, i) => (
              <motion.button
                key={inst.name}
                className="text-left p-6 rounded-2xl border transition-all duration-300 card-hover"
                style={{
                  background: activeInstrument === i ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.03)',
                  borderColor: activeInstrument === i ? '#FF6B35' : 'rgba(255,255,255,0.08)',
                }}
                onClick={() => setActiveInstrument(activeInstrument === i ? null : i)}
                whileTap={{ scale: 0.97 }}
              >
                <div className="text-4xl mb-4">{inst.emoji}</div>
                <div className="tag mb-3 w-fit" style={{ color: '#FF6B35', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  {inst.freq}
                </div>
                <h3 className="font-display text-xl font-bold mb-1">{inst.name}</h3>
                <p className="text-gray-500 text-xs font-mono mb-3">{inst.role}</p>

                <AnimatePresence>
                  {activeInstrument === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">{inst.desc}</p>
                      <div className="h-12">
                        <Waveform isPlaying={true} color="#FF6B35" bars={20} height={30} />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono">CHANNEL:</span>
                        <span className="text-xs text-orange-400 font-mono">{inst.channel}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PRODUCT 360 VIEWER ────────────────────────────────────────────────── */}
      <Section className="py-20 px-6 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="section-line" />
                <span className="tag text-orange-400 bg-orange-500/10 border border-orange-500/20">360° PRODUCT VIEW</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                The Speaker.
                <br />
                <span className="text-gradient">Every Angle.</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Drag to inspect every physical detail of the custom speaker units used in the
                UTSAVAM installation. The 13-channel discrete array was designed for
                maximum point-source isolation — each unit responsible for a single instrument
                in the spatial soundfield.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {SPECS.map((spec) => (
                  <div key={spec.label} className="p-4 rounded-xl bg-white/5 border border-white/8">
                    <div className="text-gradient font-display text-2xl font-bold">{spec.value}</div>
                    <div className="text-white text-sm font-medium mt-1">{spec.label}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{spec.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 360 viewer */}
            <div className="h-[520px] rounded-2xl border border-white/5 bg-[#111] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none z-10" />
              <ProductViewer360 />
            </div>
          </div>
        </div>
      </Section>

      {/* ── THEYYAM GALLERY ──────────────────────────────────────────────────── */}
      <Section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="section-line" />
                <span className="tag text-orange-400 bg-orange-500/10 border border-orange-500/20">SOURCE MATERIAL</span>
              </div>
              <h2 className="font-display text-4xl font-bold">Theyyam — The Living God</h2>
            </div>
            <p className="hidden md:block text-gray-500 max-w-sm text-sm leading-relaxed">
              A ritualistic art form from North Kerala where performers embody divine spirits through elaborate costume, makeup, and percussion.
            </p>
          </div>

          {/* Masonry grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {THEYYAM_IMAGES.map((img, i) => (
              <motion.div
                key={i}
                className={`relative overflow-hidden rounded-xl group ${i === 0 || i === 3 ? 'row-span-2' : ''}`}
                style={{ height: i === 0 || i === 3 ? '460px' : '220px' }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 image-overlay" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-medium">{img.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── TECHNICAL PIPELINE ────────────────────────────────────────────────── */}
      <Section className="py-20 px-6 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="section-line" />
            <span className="tag text-orange-400 bg-orange-500/10 border border-orange-500/20">TECHNICAL PIPELINE</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Pipeline steps */}
            <div className="space-y-6">
              <h2 className="font-display text-3xl font-bold mb-8">
                From Dolby Atmos
                <br />
                <span className="text-gradient">to Discrete Mastery</span>
              </h2>
              {[
                {
                  step: '01',
                  title: 'Field Recording',
                  desc: 'Binaural & multi-mic capture at actual Theyyam festivals in Kannur, Kerala',
                  icon: '🎙️',
                },
                {
                  step: '02',
                  title: 'Dolby Atmos Phase',
                  desc: 'Bed (ambient < 10%) + individual instrument Objects with spatial size metadata',
                  icon: '🔵',
                },
                {
                  step: '03',
                  title: 'REAPER Pivot',
                  desc: '12-channel master bus override. Master Send disabled for instrument tracks',
                  icon: '⚡',
                },
                {
                  step: '04',
                  title: 'Hardware Routing',
                  desc: 'Direct Hardware Output Sends to each physical speaker. Zero bleeding guaranteed',
                  icon: '🔌',
                },
                {
                  step: '05',
                  title: 'Atmospheric Bed',
                  desc: 'Global crowd ambience routes across full master block — the unifying chaos',
                  icon: '🌊',
                },
              ].map((step) => (
                <div key={step.step} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg group-hover:border-orange-500/30 transition-colors">
                    {step.icon}
                  </div>
                  <div className="flex-1 border-b border-white/5 pb-5">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-orange-500">{step.step}</span>
                      <h4 className="font-medium text-white">{step.title}</h4>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Routing diagram */}
            <div className="bg-black/50 rounded-2xl border border-white/5 p-6 font-mono text-xs">
              <div className="text-orange-400 mb-6 text-sm">// REAPER ROUTING DIAGRAM</div>

              {/* Visual routing */}
              <div className="space-y-3">
                <div className="p-3 rounded border border-yellow-500/30 bg-yellow-500/5">
                  <div className="text-yellow-400 mb-1">AMBIENT BED — Global Crowd</div>
                  <div className="flex gap-1 flex-wrap">
                    {['OUT 1', 'OUT 2', 'OUT 3', 'OUT 4', 'OUT 5', 'OUT 6', 'OUT 7', 'OUT 8'].map(o => (
                      <span key={o} className="px-2 py-0.5 bg-yellow-500/10 rounded text-yellow-400/70">{o}</span>
                    ))}
                  </div>
                  <div className="text-gray-600 mt-1">Volume: ≤ 10% — Routes EVERYWHERE</div>
                </div>

                {INSTRUMENTS.slice(0, 3).map((inst, i) => (
                  <div key={inst.name} className="p-3 rounded border border-orange-500/20 bg-orange-500/5">
                    <div className="flex justify-between mb-1">
                      <span className="text-orange-300">{inst.emoji} {inst.name} — {inst.role}</span>
                      <span className="text-orange-500">{inst.freq}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-600">Master Send: DISABLED</span>
                      <span className="text-gray-700">→</span>
                      <span className="px-2 py-0.5 bg-orange-500/20 rounded text-orange-400">
                        HW OUT {i + 1} ONLY
                      </span>
                    </div>
                  </div>
                ))}

                <div className="p-3 rounded border border-blue-500/20 bg-blue-500/5">
                  <div className="text-blue-300 mb-1">🔊 SUBWOOFERS — LFE Layout</div>
                  <div className="flex gap-2 items-center">
                    <span className="px-2 py-0.5 bg-blue-500/10 rounded text-blue-400/70">OUT 11</span>
                    <span className="text-gray-600">+</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 rounded text-blue-400/70">OUT 12</span>
                    <span className="text-gray-600 ml-2">— Full-range bass leakage</span>
                  </div>
                </div>

                <div className="p-3 rounded border border-purple-500/20 bg-purple-500/5">
                  <div className="text-purple-300 mb-1">🔼 CEILING ARRAY — Height Layer</div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/10 rounded text-purple-400/70">OUT 9</span>
                    <span className="px-2 py-0.5 bg-purple-500/10 rounded text-purple-400/70">OUT 10</span>
                    <span className="text-gray-600 ml-2">— Overhead vertical dimension</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-gray-600">
                Result: <span className="text-green-400">Point-Source Isolation ✓</span> — listener movement drives the mix
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── TIMELINE ─────────────────────────────────────────────────────────── */}
      <Section className="py-20 px-6" id="timeline">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="section-line" />
              <span className="tag text-orange-400 bg-orange-500/10 border border-orange-500/20">JOURNEY</span>
              <div className="section-line" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              From Gallery to
              <br />
              <span className="text-gradient">Biennale Scale</span>
            </h2>
          </div>

          <div className="relative">
            {/* Central line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500 via-orange-500/50 to-transparent hidden md:block" />

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
                    item.status === 'active'
                      ? 'border-orange-500/50 bg-orange-500/5'
                      : item.status === 'upcoming'
                      ? 'border-purple-500/30 bg-purple-500/5'
                      : 'border-white/8 bg-white/3'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-gray-500">{item.date}</span>
                      <span className={`tag ${
                        item.status === 'done' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                        item.status === 'active' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                        'text-purple-400 bg-purple-500/10 border-purple-500/20'
                      }`}>
                        {item.status === 'done' ? '✓ DONE' : item.status === 'active' ? '● ACTIVE' : '◎ UPCOMING'}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">{item.label}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex flex-shrink-0 w-6 items-center justify-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      item.status === 'done' ? 'border-green-500 bg-green-500' :
                      item.status === 'active' ? 'border-orange-500 bg-orange-500 channel-dot' :
                      'border-purple-500 bg-transparent'
                    }`} />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── EXHIBITIONS ──────────────────────────────────────────────────────── */}
      <Section className="py-20 px-6 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Animela',
                type: 'National Platform',
                year: '2025',
                desc: 'The premier national platform for animation and immersive arts. UTSAVAM will evolve with generative visuals and real-time audio-reactive projections.',
                features: ['Generative Visuals', 'Audio-Reactive Projections', 'Interactive Tech Integration'],
                color: '#FF6B35',
                img: 'https://images.pexels.com/photos/6727765/pexels-photo-6727765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
              },
              {
                name: 'Kochi-Muziris Biennale',
                type: 'Premier South Asian Art Exhibition',
                year: '2025–2026',
                desc: 'The absolute premier contemporary art exhibition in South Asia. Scaling from discrete routing to Higher-Order Ambisonics for massive multi-speaker rooms.',
                features: ['HOA Workflow (IEM Suite)', '24–32+ Channel Scaling', 'Interactive Audience Tracking'],
                color: '#8B5CF6',
                img: 'https://images.pexels.com/photos/9086767/pexels-photo-9086767.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
              },
            ].map((venue) => (
              <div key={venue.name} className="relative overflow-hidden rounded-2xl group card-hover">
                <img
                  src={venue.img}
                  alt={venue.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/95" />
                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="tag" style={{ color: venue.color, background: venue.color + '20', border: `1px solid ${venue.color}40` }}>
                      {venue.type}
                    </span>
                    <span className="font-mono text-gray-500 text-xs">{venue.year}</span>
                  </div>
                  <h3 className="font-display text-3xl font-bold mb-4" style={{ color: '#fff' }}>
                    {venue.name}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6 text-sm">{venue.desc}</p>
                  <div className="space-y-2">
                    {venue.features.map((f) => (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: venue.color }} />
                        <span className="text-sm text-gray-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FOOTER CTA ────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Background Theyyam */}
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.pexels.com/photos/20416025/pexels-photo-20416025.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full border border-orange-500/30 flex items-center justify-center mx-auto mb-8 float-anim">
            <span className="text-4xl">🔥</span>
          </div>
          <h2 className="font-display text-5xl md:text-7xl font-black mb-6 glow-saffron">
            Feel the Festival.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            UTSAVAM is not just a sound installation — it is a spatial argument for how we
            experience cultural memory. Where you stand is what you hear.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono text-sm text-gray-500 tracking-widest">PROJECT BY</div>
            <div className="font-display text-3xl font-bold text-orange-400">UTSAVAM Studio</div>
            <div className="flex gap-6 mt-4">
              {['Sound Design', 'Spatial Audio', 'Cultural Installation'].map(t => (
                <span key={t} className="tag text-gray-500 border-gray-700">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-xs text-gray-600 tracking-widest">UTSAVAM © 2025</div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-mono text-xs text-gray-600">SPATIAL AUDIO INSTALLATION · KERALA, INDIA</span>
          </div>
          <div className="font-mono text-xs text-gray-600">KOCHI-MUZIRIS BIENNALE BOUND</div>
        </div>
      </footer>
    </div>
  )
}
