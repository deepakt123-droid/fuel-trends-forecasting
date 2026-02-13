"use client"

import { useState, useMemo } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Area, AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fuelData } from "@/lib/fuel-data"
import { linearRegression, polynomialRegression } from "@/lib/least-squares"

type FuelType = "gasoline" | "diesel" | "crudeOil"
type TimeRange = "all" | "5y" | "3y" | "1y"

export function PriceTrendChart() {
  const [fuelType, setFuelType] = useState<FuelType>("gasoline")
  const [timeRange, setTimeRange] = useState<TimeRange>("all")
  const [showTrend, setShowTrend] = useState(true)
  const [trendType, setTrendType] = useState<"linear" | "polynomial">("polynomial")

  const filteredData = useMemo(() => {
    const now = fuelData.length
    switch (timeRange) {
      case "1y": return fuelData.slice(Math.max(0, now - 12))
      case "3y": return fuelData.slice(Math.max(0, now - 36))
      case "5y": return fuelData.slice(Math.max(0, now - 60))
      default: return fuelData
    }
  }, [timeRange])

  const trendData = useMemo(() => {
    if (!showTrend) return filteredData.map((d) => ({ ...d, trend: undefined }))

    const x = filteredData.map((_, i) => i)
    const y = filteredData.map((d) => d[fuelType])

    let result
    if (trendType === "linear") {
      result = linearRegression(x, y)
    } else {
      result = polynomialRegression(x, y, 3)
    }

    return filteredData.map((d, i) => ({
      ...d,
      trend: +result.predictions[i].toFixed(2),
    }))
  }, [filteredData, fuelType, showTrend, trendType])

  const fuelLabel = fuelType === "gasoline" ? "Gasoline" : fuelType === "diesel" ? "Diesel" : "Crude Oil"
  const yUnit = fuelType === "crudeOil" ? "\u20B9/bbl" : "\u20B9/L"

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Fuel Price Trends
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Historical prices with least squares trend line
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border bg-secondary p-0.5">
              {(["gasoline", "diesel", "crudeOil"] as FuelType[]).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFuelType(ft)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    fuelType === ft
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ft === "gasoline" ? "Gas" : ft === "diesel" ? "Diesel" : "Crude"}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-border bg-secondary p-0.5">
              {(["all", "5y", "3y", "1y"] as TimeRange[]).map((tr) => (
                <button
                  key={tr}
                  onClick={() => setTimeRange(tr)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                    timeRange === tr
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tr === "all" ? "All" : tr}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showTrend}
              onChange={(e) => setShowTrend(e.target.checked)}
              className="rounded accent-primary"
            />
            Show trend
          </label>
          {showTrend && (
            <div className="flex rounded-md border border-border bg-secondary p-0.5">
              {(["linear", "polynomial"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTrendType(t)}
                  className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                    trendType === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "linear" ? "Linear" : "Poly (3rd)"}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const [y, m] = v.split("-")
                  return m === "01" || m === "07" ? `${m === "01" ? "Jan" : "Jul"} '${y.slice(2)}` : ""
                }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `\u20B9${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                labelFormatter={(v) => {
                  const [y, m] = (v as string).split("-")
                  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                  return `${months[parseInt(m) - 1]} ${y}`
                }}
                formatter={(value: number) => [`\u20B9${value.toFixed(2)} ${yUnit}`, fuelLabel]}
              />
              <Area
                type="monotone"
                dataKey={fuelType}
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#colorFuel)"
                dot={false}
                name={fuelLabel}
              />
              {showTrend && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  name="LSM Trend"
                />
              )}
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}
              />
              <ReferenceLine
                y={fuelType === "crudeOil" ? 5395 : 68.44}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                opacity={0.4}
                label={{ value: "Avg", position: "insideTopRight", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
