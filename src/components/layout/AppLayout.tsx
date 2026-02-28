import { useState } from "react"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { Header } from "./Header"
import { cn } from "@/lib/utils"
import type { Session } from "@/types"

interface UserInfo {
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface AppLayoutProps {
  children: React.ReactNode
  sessions: Session[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  headerSubtitle?: string
  user?: UserInfo | null
  onSignOut?: () => void
  onSignIn?: () => void
  onSettingsClick?: () => void
  therapistName?: string
}

export function AppLayout({
  children,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  headerSubtitle,
  user,
  onSignOut,
  onSignIn,
  onSettingsClick,
  therapistName,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - always fixed on mobile, slides in/out */}
      <aside 
        className={cn(
          "fixed lg:relative top-0 left-0 h-full w-[280px] sm:w-[300px] bg-sand border-r border-linen flex flex-col shadow-[2px_0_20px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-gentle z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => {
            onSelectSession(id)
            setSidebarOpen(false)
          }}
          onNewSession={() => {
            onNewSession()
            setSidebarOpen(false)
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-cream">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSettingsClick={onSettingsClick}
          subtitle={headerSubtitle}
          therapistName={therapistName}
        />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
