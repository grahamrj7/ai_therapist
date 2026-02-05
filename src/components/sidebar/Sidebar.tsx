import { motion } from "framer-motion"
import { Plus, MessageSquare, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Session } from "@/types"

interface UserInfo {
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface SidebarProps {
  sessions: Session[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  isOpen?: boolean
  onClose?: () => void
  user?: UserInfo | null
  onSignOut?: () => void
  onSignIn?: () => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === today.toISOString().split('T')[0]) return 'Today'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  isOpen,
  onClose,
  user,
  onSignOut,
  onSignIn
}: SidebarProps) {
  return (
    <aside 
      className={cn(
        "w-[300px] bg-sand border-r border-linen flex flex-col h-full shadow-[2px_0_20px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-gentle z-20",
        !isOpen && "-translate-x-full lg:translate-x-0 fixed lg:relative"
      )}
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-linen/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-text-primary">AI Therapist</h1>
            <p className="text-sm text-text-muted">Your safe space</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-linen rounded-lg transition-colors"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <Button 
          onClick={onNewSession}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1 px-3 py-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-text-muted/50" />
            <p className="text-sm text-text-muted">No sessions yet</p>
            <p className="text-xs text-text-tertiary mt-1">Start a conversation to begin</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.filter(s => s && s.id).map((session, index) => (
              <motion.button
                key={session.id || `session-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group",
                  session.id === currentSessionId
                    ? "bg-terracotta-light border-l-3 border-terracotta"
                    : "hover:bg-white hover:shadow-soft"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      session.id === currentSessionId ? "text-terracotta-dark" : "text-text-primary"
                    )}>
                      {formatDate(session.date)}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {session.messages.length} messages
                    </p>
                  </div>
                  {session.id === currentSessionId && (
                    <div className="h-2 w-2 rounded-full bg-terracotta" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-linen/50 bg-linen/30">
        {user ? (
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || "User"}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user.displayName || "User"}
              </p>
              <p className="text-xs text-text-muted">{user.email || "Signed in"}</p>
            </div>
            <button 
              onClick={onSignOut}
              className="p-2 hover:bg-linen rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-text-muted" />
            </button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSignIn}
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Sign in with Google
          </Button>
        )}
      </div>
    </aside>
  )
}
