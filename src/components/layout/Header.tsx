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
    <header className="h-14 sm:h-[72px] bg-cream border-b border-linen flex items-center px-3 sm:px-6 justify-between shrink-0">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 hover:bg-sand rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-text-secondary" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-soft">
            <AvatarFallback className="bg-gradient-to-br from-terracotta to-terracotta-dark text-white text-xs sm:text-sm font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-display text-base sm:text-xl text-text-primary leading-tight">
              <span className="hidden sm:inline">{therapistName} - Your AI Therapist</span>
              <span className="sm:hidden">{therapistName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-muted hidden sm:block">
              {subtitle || "Here to listen"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <p className="text-xs text-text-muted sm:hidden">{subtitle || "Here to listen"}</p>
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
