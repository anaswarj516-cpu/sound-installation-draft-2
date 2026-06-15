import { useEffect, useRef } from 'react'

interface WaveformProps {
  isPlaying: boolean
  color?: string
  bars?: number
  height?: number
}

export default function Waveform({ isPlaying, color = '#FF6B35', bars = 40, height = 60 }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = (timestamp: number) => {
      timeRef.current = timestamp
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / bars
      const gap = 2

      for (let i = 0; i < bars; i++) {
        const t = timestamp / 1000
        const baseH = isPlaying
          ? Math.abs(Math.sin(t * 3 + i * 0.4) * 0.6 + Math.sin(t * 5 + i * 0.7) * 0.4) * height
          : 3

        const x = i * barWidth
        const barH = Math.max(3, baseH)

        // Gradient per bar
        const gradient = ctx.createLinearGradient(0, canvas.height / 2 - barH / 2, 0, canvas.height / 2 + barH / 2)
        gradient.addColorStop(0, color + '44')
        gradient.addColorStop(0.5, color)
        gradient.addColorStop(1, color + '44')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x + gap / 2, canvas.height / 2 - barH / 2, barWidth - gap, barH, 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, color, bars, height])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
