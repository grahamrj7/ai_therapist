import { useState, useEffect, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, TrendingDown, Minus, Calendar, Loader2 } from "lucide-react"
import { loadEmotionHistory, type EmotionCheckin } from "@/lib/db"
import { Button } from "@/components/ui/button"

interface MoodChartProps {
  userId: string
  onClose?: () => void
}

type TimeRange = 7 | 30 | 90 | null

const EMOTION_CONFIG = [
  { key: "anxiety", label: "Anxiety", color: "#D4A574", fill: "#D4A57420" },
  { key: "mood", label: "Mood", color: "#A8B5A0", fill: "#A8B5A020" },
  { key: "stress", label: "Stress", color: "#C9897A", fill: "#C9897A20" },
  { key: "energy", label: "Energy", color: "#C9B8C8", fill: "#C9B8C820" },
]

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function calculateTrend(data: number[]): "up" | "down" | "stable" {
  if (data.length < 2) return "stable"
  const recent = data.slice(-3)
  const older = data.slice(0, 3)
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  const diff = recentAvg - olderAvg
  if (diff > 1.5) return "up"
  if (diff < -1.5) return "down"
  return "stable"
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4" />
  if (trend === "down") return <TrendingDown className="h-4 w-4" />
  return <Minus className="h-4 w-4" />
}

export function MoodChart({ userId, onClose }: MoodChartProps) {
  const [data, setData] = useState<EmotionCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>(30)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const history = await loadEmotionHistory(userId, { days: timeRange })
      setData(history)
      setLoading(false)
    }
    fetchData()
  }, [userId, timeRange])

  const chartData = useMemo(() => {
    return data.map(entry => ({
      date: formatDate(entry.timestamp),
      timestamp: entry.timestamp,
      anxiety: entry.anxiety,
      mood: entry.mood,
      stress: entry.stress,
      energy: entry.energy,
    }))
  }, [data])

  const stats = useMemo(() => {
    if (data.length === 0) return null
    
    const getValues = (key: string) => data.map(d => d[key as keyof EmotionCheckin] as number).filter(Boolean)
    
    return EMOTION_CONFIG.map(config => {
      const values = getValues(config.key)
      if (values.length === 0) return null
      
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const trend = calculateTrend(values)
      
      return {
        ...config,
        avg: Math.round(avg * 10) / 10,
        trend,
        count: values.length,
      }
    }).filter(Boolean)
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
          <Calendar className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="font-medium text-text-primary mb-2">No mood data yet</h3>
        <p className="text-sm text-text-muted">
          Complete emotion check-ins to see your mood history here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex justify-center gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setTimeRange(days)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              timeRange === days
                ? "bg-terracotta text-white"
                : "bg-cream text-text-secondary hover:bg-linen"
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: "#8B7D6B" }}
              tickLine={false}
              axisLine={{ stroke: "#ede8df" }}
            />
            <YAxis 
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: "#8B7D6B" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ede8df",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {EMOTION_CONFIG.map((config) => (
              <Line
                key={config.key}
                type="monotone"
                dataKey={config.key}
                name={config.label}
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat: any) => (
            <div
              key={stat.key}
              className="p-3 rounded-xl bg-cream border border-linen"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
                <TrendIcon trend={stat.trend} />
              </div>
              <p className="text-xs text-text-muted">{stat.label}</p>
              <p className="text-lg font-semibold text-text-primary">
                {stat.avg}
                <span className="text-xs font-normal text-text-muted">/10</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-text-muted text-center">
        Based on {data.length} check-in{data.length !== 1 ? "s" : ""}
      </p>
    </div>
  )
}
