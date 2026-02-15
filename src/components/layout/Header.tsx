import { Menu, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  onMenuClick?: () => void
  onSettingsClick?: () => void
  subtitle?: string
  therapistName?: string
}

export function Header({ onMenuClick, onSettingsClick, subtitle, therapistName = "Abby" }: HeaderProps) {
  const initial = therapistName.charAt(0).toUpperCase()

  return (
    <header className="h-[72px] bg-cream border-b border-linen flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 hover:bg-sand rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-text-secondary" />
        </button>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shadow-soft">
            <AvatarFallback className="bg-gradient-to-br from-terracotta to-terracotta-dark text-white text-sm font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-display text-xl text-text-primary">{therapistName} - Your AI Therapist</h2>
            <p className="text-sm text-text-muted">
              {subtitle || "Here to listen"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onSettingsClick}
          className="p-2 hover:bg-sand rounded-lg transition-colors" 
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 text-text-secondary" />
        </button>
      </div>
    </header>
  )
}
