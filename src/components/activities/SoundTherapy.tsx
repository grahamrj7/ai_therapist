import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, Volume2, VolumeX, CloudRain, Waves, Wind, Trees, Flame, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Howl } from "howler"

interface Sound {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  url: string
}

const SOUNDS: Sound[] = [
  { 
    id: "rain", 
    name: "Rain", 
    icon: <CloudRain className="h-6 w-6" />,
    color: "bg-blue-500",
    url: "https://orangefreesounds.com/wp-content/uploads/2022/03/Rain-and-thunder-sound.mp3"
  },
  { 
    id: "ocean", 
    name: "Ocean Waves", 
    icon: <Waves className="h-6 w-6" />,
    color: "bg-teal-500",
    url: "https://orangefreesounds.com/wp-content/uploads/2022/03/Ocean-waves-sound.mp3"
  },
  { 
    id: "wind", 
    name: "Wind", 
    icon: <Wind className="h-6 w-6" />,
    color: "bg-slate-400",
    url: "https://orangefreesounds.com/wp-content/uploads/2022/11/Wind-blowing-in-the-trees-1.mp3"
  },
  { 
    id: "forest", 
    name: "Forest", 
    icon: <Trees className="h-6 w-6" />,
    color: "bg-green-600",
    url: "https://orangefreesounds.com/wp-content/uploads/2026/01/Relaxing-summer-forest-ambience.mp3"
  },
  { 
    id: "fire", 
    name: "Fireplace", 
    icon: <Flame className="h-6 w-6" />,
    color: "bg-orange-500",
    url: "https://orangefreesounds.com/wp-content/uploads/2022/10/Fire-crackling-sound-effect.mp3"
  },
  { 
    id: "stream", 
    name: "Stream", 
    icon: <Droplets className="h-6 w-6" />,
    color: "bg-cyan-500",
    url: "https://orangefreesounds.com/wp-content/uploads/2022/03/River-stream-sound.mp3"
  },
]

interface SoundTherapyProps {
  onClose: () => void
}

export function SoundTherapy({ onClose }: SoundTherapyProps) {
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const soundRef = useRef<Howl | null>(null)

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
      }
    }
  }, [])

  const handleSoundToggle = (sound: Sound) => {
    if (activeSound === sound.id && isPlaying) {
      soundRef.current?.pause()
      setIsPlaying(false)
    } else if (activeSound === sound.id && !isPlaying) {
      soundRef.current?.play()
      setIsPlaying(true)
    } else {
      if (soundRef.current) {
        soundRef.current.unload()
      }
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
      setActiveSound(sound.id)
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

  const handleClose = () => {
    if (soundRef.current) {
      soundRef.current.stop()
      soundRef.current.unload()
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-linen">
          <div>
            <h2 className="font-display text-2xl text-text-primary">Sound Therapy</h2>
            <p className="text-sm text-text-muted mt-1">Select ambient sounds to help you relax</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full hover:bg-cream"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sound Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {SOUNDS.map((sound) => (
              <motion.button
                key={sound.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSoundToggle(sound)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200",
                  activeSound === sound.id
                    ? `${sound.color} text-white shadow-lg`
                    : "bg-cream text-text-secondary hover:bg-linen"
                )}
              >
                <div className={cn(
                  "p-3 rounded-full",
                  activeSound === sound.id ? "bg-white/20" : "bg-white shadow-sm"
                )}>
                  {sound.icon}
                </div>
                <span className="text-sm font-medium">{sound.name}</span>
                {activeSound === sound.id && isPlaying && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Controls */}
        {activeSound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border-t border-linen bg-cream/50"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => soundRef.current && (isPlaying ? soundRef.current.pause() : soundRef.current.play())}
                className="rounded-full bg-terracotta text-white hover:bg-terracotta/90"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <div className="flex-1 flex items-center gap-3">
                <button onClick={toggleMute} className="text-text-secondary hover:text-text-primary">
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
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export { SOUNDS }
