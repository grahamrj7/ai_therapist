import { useState, useEffect, useCallback } from "react"
import type { UserSettings } from "@/types"

const SETTINGS_KEY = "therapy_settings"

const defaultSettings: UserSettings = {
  therapistName: "Abby",
  ttsEnabled: false,
  hasSeenTTSPrompt: false,
  hasCompletedOnboarding: false,
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch {
        setSettings(defaultSettings)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  const updateTherapistName = useCallback((name: string) => {
    setSettings((prev) => ({ ...prev, therapistName: name || "Abby" }))
  }, [])

  const setTTSEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, ttsEnabled: enabled }))
  }, [])

  const setHasSeenTTSPrompt = useCallback((seen: boolean) => {
    setSettings((prev) => ({ ...prev, hasSeenTTSPrompt: seen }))
  }, [])

  const setHasCompletedOnboarding = useCallback((completed: boolean) => {
    setSettings((prev) => ({ ...prev, hasCompletedOnboarding: completed }))
  }, [])

  const completeOnboarding = useCallback((name: string, ttsEnabled: boolean, voiceName?: string) => {
    setSettings((prev) => ({
      ...prev,
      therapistName: name || "Abby",
      ttsEnabled,
      voiceName,
      hasCompletedOnboarding: true,
    }))
  }, [])

  const resetSettings = useCallback(() => {
    localStorage.removeItem(SETTINGS_KEY)
    setSettings(defaultSettings)
  }, [])

  return {
    settings,
    isLoaded,
    updateTherapistName,
    setTTSEnabled,
    setHasSeenTTSPrompt,
    setHasCompletedOnboarding,
    completeOnboarding,
    resetSettings,
  }
}
