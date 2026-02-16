import { useState } from "react"
import { Heart, Volume2, User, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OnboardingProps {
  onComplete: (name: string, ttsEnabled: boolean) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("Abby")
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else {
      onComplete(name, ttsEnabled)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-linen p-8"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center shadow-soft">
            <Heart className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl text-text-primary mb-2">
            Welcome to AI Therapist
          </h1>
          <p className="text-text-secondary">
            Let's personalize your experience
          </p>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <User className="h-4 w-4 text-terracotta" />
                What would you like to name your therapist?
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name"
                className="text-lg"
              />
              <p className="text-xs text-text-muted">
                This is what your therapist will be called during your conversations.
              </p>
            </div>

            <Button 
              onClick={handleNext} 
              className="w-full"
              size="lg"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Volume2 className="h-4 w-4 text-terracotta" />
                Would you like voice responses?
              </label>
              
              <div className="flex items-center justify-between p-4 bg-cream rounded-xl border border-linen">
                <div>
                  <p className="font-medium text-text-primary">Enable voice</p>
                  <p className="text-sm text-text-muted">
                    {name} will speak their responses aloud
                  </p>
                </div>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    ttsEnabled ? 'bg-terracotta' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      ttsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-text-muted">
                You can always change this later in settings.
              </p>
            </div>

            <Button 
              onClick={handleNext} 
              className="w-full"
              size="lg"
            >
              Start Your Session
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className={`h-2 w-2 rounded-full transition-colors ${step === 1 ? 'bg-terracotta' : 'bg-linen'}`} />
          <div className={`h-2 w-2 rounded-full transition-colors ${step === 2 ? 'bg-terracotta' : 'bg-linen'}`} />
        </div>
      </motion.div>
    </div>
  )
}
