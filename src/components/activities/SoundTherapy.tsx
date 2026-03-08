import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, Volume2, VolumeX, CloudRain, Waves, Wind, Trees, Flame, Droplets, Maximize2, Minimize2, Minus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Howl, type Howl as HowlType } from "howler"

interface Sound {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  particleType: "rain" | "ocean" | "wind" | "forest" | "fire" | "stream"
}

const SOUNDS: Sound[] = [
  { 
    id: "rain", 
    name: "Rain", 
    icon: <CloudRain className="h-6 w-6" />,
    color: "bg-blue-500",
    bgGradient: "from-slate-600 via-blue-800 to-slate-900",
    particleType: "rain",
    url: "https://orangefreesounds.com/wp-content/uploads/2022/07/Falling-rain-sound-effect.mp3"
  },
  { 
    id: "ocean", 
    name: "Ocean Waves", 
    icon: <Waves className="h-6 w-6" />,
    color: "bg-teal-500",
    bgGradient: "from-teal-900 via-cyan-800 to-blue-900",
    particleType: "ocean",
    url: "https://orangefreesounds.com/wp-content/uploads/2025/07/Gentle-relaxing-ocean-waves-hitting-the-shore-sound-effect.mp3"
  },
  { 
    id: "wind", 
    name: "Wind", 
    icon: <Wind className="h-6 w-6" />,
    color: "bg-slate-400",
    bgGradient: "from-gray-400 via-slate-500 to-gray-600",
    particleType: "wind",
    url: "https://orangefreesounds.com/wp-content/uploads/2014/11/Wind-blowing.mp3"
  },
  { 
    id: "forest", 
    name: "Forest", 
    icon: <Trees className="h-6 w-6" />,
    color: "bg-green-600",
    bgGradient: "from-green-900 via-emerald-800 to-teal-900",
    particleType: "forest",
    url: "https://orangefreesounds.com/wp-content/uploads/2026/01/Relaxing-summer-forest-ambience.mp3"
  },
  { 
    id: "fire", 
    name: "Fireplace", 
    icon: <Flame className="h-6 w-6" />,
    color: "bg-orange-500",
    bgGradient: "from-orange-900 via-red-800 to-rose-900",
    particleType: "fire",
    url: "https://orangefreesounds.com/wp-content/uploads/2025/04/Realistic-fireplace-sound-effect.mp3"
  },
  { 
    id: "stream", 
    name: "Stream", 
    icon: <Droplets className="h-6 w-6" />,
    color: "bg-cyan-500",
    bgGradient: "from-cyan-900 via-blue-800 to-slate-900",
    particleType: "stream",
    url: "https://orangefreesounds.com/wp-content/uploads/2025/06/Fountain-sound-effect.mp3"
  },
]

interface ParticleCanvasProps {
  type: Sound["particleType"]
  isActive: boolean
}

function ParticleCanvas({ type, isActive }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Array<{x: number; y: number; vx: number; vy: number; life: number; size: number; opacity: number}>>([])
  const animationRef = useRef<number>()

  const createParticle = useCallback((canvas: HTMLCanvasElement) => {
    const baseY = canvas.height + 10
    const particle = {
      x: Math.random() * canvas.width,
      y: baseY,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 2 - 1,
      life: 1,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }

    if (type === "fire") {
      particle.vy = -Math.random() * 1.5 - 0.5
      particle.vx = (Math.random() - 0.5) * 1
    } else if (type === "wind") {
      particle.vx = Math.random() * 2 + 1
      particle.vy = (Math.random() - 0.5) * 0.5
    }

    return particle
  }, [type])

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (Math.random() < 0.1) {
        particlesRef.current.push(createParticle(canvas))
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.005

        if (type === "fire") {
          p.opacity = p.life * 0.8
        } else if (type === "rain") {
          p.opacity = Math.min(p.life, 0.6)
        } else {
          p.opacity = p.life * 0.4
        }

        if (p.life <= 0 || p.y < -10 || p.x > canvas.width + 10) return false

        ctx.beginPath()
        if (type === "fire") {
          ctx.fillStyle = `rgba(255, ${Math.floor(100 + Math.random() * 155)}, 0, ${p.opacity})`
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        } else if (type === "rain") {
          ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`
          ctx.lineWidth = p.size * 0.5
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 5)
          ctx.stroke()
        } else if (type === "wind") {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.3})`
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        }
        ctx.fill()

        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isActive, type, createParticle])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: isActive ? 1 : 0 }}
    />
  )
}

function SoundVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end justify-center gap-0.5 h-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-white rounded-full"
          animate={isPlaying ? {
            height: [4, 8, 12, 6, 10, 4],
          } : { height: 4 }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

interface SoundTherapyProps {
  onClose: () => void
}

export function SoundTherapy({ onClose }: SoundTherapyProps) {
  const [activeSound, setActiveSound] = useState<Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const soundRef = useRef<Howl | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isPlaying && activeSound) {
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now() - elapsedTime * 1000
      }
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, activeSound])

  const handleSoundToggle = (sound: Sound) => {
    if (activeSound?.id === sound.id && isPlaying) {
      soundRef.current?.pause()
      setIsPlaying(false)
    } else if (activeSound?.id === sound.id && !isPlaying) {
      soundRef.current?.play()
      setIsPlaying(true)
      startTimeRef.current = Date.now() - elapsedTime * 1000
    } else {
      if (soundRef.current) {
        soundRef.current.unload()
      }
      setElapsedTime(0)
      startTimeRef.current = Date.now()
      soundRef.current = new Howl({
        src: [sound.url],
        loop: true,
        volume: isMuted ? 0 : volume,
        html5: true,
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
      })
      soundRef.current.play()
      setActiveSound(sound)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (soundRef.current && !isMuted) {
      soundRef.current.volume(newVolume)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (soundRef.current) {
      soundRef.current.volume(isMuted ? volume : 0)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleRestore = () => {
    setIsMinimized(false)
  }

  const handleClose = () => {
    if (soundRef.current) {
      soundRef.current.stop()
      soundRef.current.unload()
    }
    onClose()
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRestore}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg backdrop-blur-md",
            "bg-gradient-to-r from-terracotta to-terracotta-dark text-white"
          )}
        >
          {activeSound?.icon}
          <span className="font-medium">{activeSound?.name}</span>
          <SoundVisualizer isPlaying={isPlaying} />
          <div className="flex items-center gap-1 text-xs opacity-80">
            <Clock className="h-3 w-3" />
            {formatTime(elapsedTime)}
          </div>
        </motion.button>
      </motion.div>
    )
  }

  return (
    <>
      {/* Ambient Background Layer */}
      <AnimatePresence>
        {isPlaying && activeSound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={cn(
              "fixed inset-0 bg-gradient-to-br z-40",
              activeSound.bgGradient
            )}
          >
            <ParticleCanvas type={activeSound.particleType} isActive={isPlaying} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed z-50 flex items-center justify-center p-4",
          isFullscreen ? "inset-0" : "inset-0 bg-black/60 backdrop-blur-sm"
        )}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            "bg-white rounded-3xl overflow-hidden shadow-2xl",
            isFullscreen 
              ? "w-full h-full max-w-none rounded-none" 
              : "max-w-md w-full max-h-[90vh]"
          )}
          style={{ maxHeight: isFullscreen ? "100vh" : "90vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-linen">
            <div className="flex items-center gap-3">
              {isPlaying && activeSound && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn("p-2 rounded-full text-white", activeSound.color)}
                >
                  {activeSound.icon}
                </motion.div>
              )}
              <div>
                <h2 className="font-display text-2xl text-text-primary">
                  {isPlaying && activeSound ? activeSound.name : "Sound Therapy"}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {isPlaying ? formatTime(elapsedTime) : "Select ambient sounds to help you relax"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeSound && !isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMinimize}
                  className="rounded-full hover:bg-cream"
                  title="Minimize to background"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              {activeSound && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="rounded-full hover:bg-cream"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full hover:bg-cream"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sound Grid */}
          <div className={cn("p-6", isFullscreen && "pt-20")}>
            <div className="grid grid-cols-3 gap-4">
              {SOUNDS.map((sound) => (
                <motion.button
                  key={sound.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSoundToggle(sound)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                    activeSound?.id === sound.id
                      ? `${sound.color} text-white shadow-lg`
                      : "bg-cream text-text-secondary hover:bg-linen"
                  )}
                >
                  {activeSound?.id === sound.id && isPlaying && (
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                      <SoundVisualizer isPlaying={isPlaying} />
                    </div>
                  )}
                  <div className={cn(
                    "p-3 rounded-full relative z-10",
                    activeSound?.id === sound.id ? "bg-white/20" : "bg-white shadow-sm"
                  )}>
                    {sound.icon}
                  </div>
                  <span className="text-sm font-medium relative z-10">{sound.name}</span>
                  {activeSound?.id === sound.id && isPlaying && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 bg-white rounded-full relative z-10"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <AnimatePresence>
            {activeSound && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-6 border-t border-linen bg-cream/50"
              >
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => soundRef.current && (isPlaying ? soundRef.current.pause() : soundRef.current.play())}
                    className={cn(
                      "rounded-full hover:scale-105 transition-transform",
                      activeSound.color, "text-white hover:opacity-90"
                    )}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <button 
                      onClick={toggleMute} 
                      className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-linen rounded-full appearance-none cursor-pointer accent-terracotta"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-text-muted">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium tabular-nums">
                      {formatTime(elapsedTime)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  )
}

export { SOUNDS }
