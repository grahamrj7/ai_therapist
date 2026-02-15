import { Link } from "react-router-dom"
import { MessageCircle, Heart, Shield, Sparkles } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-linen bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg text-text-primary">AI Therapist</span>
          </div>
          <Link
            to="/app"
            className="px-4 py-2 bg-terracotta text-white text-sm font-medium rounded-lg hover:bg-terracotta-dark transition-colors"
          >
            Start Talking
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-4xl md:text-6xl text-text-primary mb-6">
          Your safe space to talk
        </h1>
        <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
          An AI therapist that's always here to listen. No judgment, no waiting, 
          just a supportive conversation whenever you need it.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-8 py-4 bg-terracotta text-white text-lg font-medium rounded-xl hover:bg-terracotta-dark transition-colors shadow-soft"
        >
          <MessageCircle className="h-5 w-5" />
          Start Your Session
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-linen">
            <div className="h-12 w-12 rounded-xl bg-terracotta/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-terracotta" />
            </div>
            <h3 className="font-medium text-text-primary mb-2">Always Available</h3>
            <p className="text-sm text-text-secondary">
              Talk anytime, day or night. Your therapist is always here to listen.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-linen">
            <div className="h-12 w-12 rounded-xl bg-terracotta/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-terracotta" />
            </div>
            <h3 className="font-medium text-text-primary mb-2">Private & Secure</h3>
            <p className="text-sm text-text-secondary">
              Your conversations are private. Everything stays on your device.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-linen">
            <div className="h-12 w-12 rounded-xl bg-terracotta/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-terracotta" />
            </div>
            <h3 className="font-medium text-text-primary mb-2">Personalized</h3>
            <p className="text-sm text-text-secondary">
              Customize your therapist's name and speaking voice to match your preference.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-linen mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-text-muted">
          <p>Not a replacement for professional mental health care.</p>
          <p className="mt-2">If you're in crisis, please contact emergency services or a mental health professional.</p>
        </div>
      </footer>
    </div>
  )
}
