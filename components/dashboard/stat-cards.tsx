"use client"

import { TrendingUp, TrendingDown, IndianRupee, BarChart3, Target, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { fuelData } from "@/lib/fuel-data"

const latestData = fuelData[fuelData.length - 1]
const prevData = fuelData[fuelData.length - 2]

const gasChange = ((latestData.gasoline - prevData.gasoline) / prevData.gasoline * 100)
const dieselChange = ((latestData.diesel - prevData.diesel) / prevData.diesel * 100)

const stats = [
  {
    title: "Gasoline Price",
    value: `\u20B9${latestData.gasoline.toFixed(2)}`,
    subtitle: "/litre",
    change: gasChange,
    icon: IndianRupee,
    color: "text-chart-1" as const,
    bgColor: "bg-chart-1/10" as const,
  },
  {
    title: "Diesel Price",
    value: `\u20B9${latestData.diesel.toFixed(2)}`,
    subtitle: "/litre",
    change: dieselChange,
    icon: IndianRupee,
    color: "text-chart-2" as const,
    bgColor: "bg-chart-2/10" as const,
  },
  {
    title: "Crude Oil (WTI)",
    value: `\u20B9${latestData.crudeOil.toFixed(0)}`,
    subtitle: "/barrel",
    change: ((latestData.crudeOil - prevData.crudeOil) / prevData.crudeOil * 100),
    icon: BarChart3,
    color: "text-chart-3" as const,
    bgColor: "bg-chart-3/10" as const,
  },
  {
    title: "Model Accuracy",
    value: "93.8%",
    subtitle: "R² = 0.88",
    change: 2.1,
    icon: Target,
    color: "text-chart-1" as const,
    bgColor: "bg-chart-1/10" as const,
  },
  {
    title: "Forecast MAPE",
    value: "6.2%",
    subtitle: "Best model",
    change: -1.4,
    icon: Activity,
    color: "text-chart-2" as const,
    bgColor: "bg-chart-2/10" as const,
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isPositive = stat.title === "Forecast MAPE" ? stat.change < 0 : stat.change > 0
        const TrendIcon = stat.change > 0 ? TrendingUp : TrendingDown

        return (
          <Card key={stat.title} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${
                  isPositive ? "text-emerald-500" : "text-red-500"
                }`}>
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(stat.change).toFixed(1)}%
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{stat.subtitle}</span>
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {stat.title}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
