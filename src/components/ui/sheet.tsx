import * as React from "react"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: "left" | "right"
}

const Sheet = ({ children, open, onOpenChange, side = "left" }: SheetProps) => {
  return (
    <>
      {children}
      {open && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => onOpenChange?.(false)}
          />
          <div 
            className={cn(
              "fixed top-0 h-full w-[300px] bg-sand z-50 shadow-xl transition-transform duration-300 ease-gentle",
              side === "left" ? "left-0" : "right-0",
              open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full"
            )}
          >
            {children}
          </div>
        </>
      )}
    </>
  )
}

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  return <>{children}</>
}

const SheetContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {children}
    </div>
  )
}

const SheetHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("p-6 border-b border-linen", className)}>
      {children}
    </div>
  )
}

const SheetTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <h2 className={cn("text-lg font-semibold text-text-primary", className)}>
      {children}
    </h2>
  )
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle }
