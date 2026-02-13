"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fuelData, correlations, seasonalityData, descriptiveStats } from "@/lib/fuel-data"
import { TrendingUp, TrendingDown, Zap, Globe, Calendar, Droplets } from "lucide-react"

// Market events timeline
const marketEvents = [
  { year: "2014-15", event: "Oil Supply Glut", impact: "Price decline \u20B976 to \u20B948/L", type: "negative" },
  { year: "2016-19", event: "Gradual Recovery", impact: "Stabilization at \u20B961-70/L", type: "positive" },
  { year: "2020", event: "COVID-19 Pandemic", impact: "Sharp drop to \u20B941/L", type: "negative" },
  { year: "2021-22", event: "Post-COVID Surge", impact: "Record highs above \u20B998/L", type: "negative" },
  { year: "2023-24", event: "Market Stabilization", impact: "Normalization at \u20B970-79/L", type: "positive" },
  { year: "2025-26", event: "Current Period", impact: "Moderate prices ~\u20B972/L", type: "positive" },
]

// Fuel type distribution
const fuelDistribution = [
  { name: "Regular Gasoline", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Premium Gasoline", value: 15, color: "hsl(var(--chart-2))" },
  { name: "Diesel", value: 30, color: "hsl(var(--chart-3))" },
  { name: "Other", value: 10, color: "hsl(var(--muted-foreground))" },
]

export function OverviewSection() {
  // Dual price chart data (gasoline vs diesel)
  const dualPriceData = fuelData.slice(-36)

  // Year-over-year comparison
  const currentYear = fuelData.filter((d) => d.year === 2025)
  const prevYear = fuelData.filter((d) => d.year === 2024)
  const yoyData = currentYear.map((d, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.month - 1],
    current: d.gasoline,
    previous: prevYear[i]?.gasoline || 0,
  }))

  return (
    <div className="space-y-4">
      {/* Dual price chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Gasoline vs Diesel Prices (Last 3 Years)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Comparative price movement with crude oil correlation
            </p>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dualPriceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
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
                      return parseInt(m) % 3 === 1
                        ? `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1]} '${y.slice(2)}`
                        : ""
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
                    formatter={(value: number) => [`\u20B9${value.toFixed(2)}`]}
                  />
                  <Area
                    type="monotone"
                    dataKey="gasoline"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#colorGas)"
                    name="Gasoline"
                  />
                  <Area
                    type="monotone"
                    dataKey="diesel"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    fill="url(#colorDiesel)"
                    name="Diesel"
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fuel distribution */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Market Share by Fuel Type
            </CardTitle>
            <p className="text-xs text-muted-foreground">US retail fuel consumption</p>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fuelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {fuelDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year-over-year + Timeline */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* YoY chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Year-over-Year Comparison
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              2025 vs 2024 gasoline prices
            </p>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yoyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `\u20B9${v}`}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`\u20B9${value.toFixed(2)}`]}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "hsl(var(--chart-1))" }}
                    name="2025"
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 2, fill: "hsl(var(--muted-foreground))" }}
                    name="2024"
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Market Timeline */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Market Events Timeline
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Key events impacting fuel prices
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketEvents.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      event.type === "positive" ? "bg-emerald-500/10" : "bg-red-500/10"
                    }`}>
                      {event.type === "positive" ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                    {i < marketEvents.length - 1 && (
                      <div className="mt-1 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{event.year}</span>
                      <span className="text-sm font-medium text-foreground">{event.event}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Globe, label: "Data Coverage", value: "10+ Years", sub: "520 weekly observations", color: "text-chart-1" },
          { icon: Zap, label: "Best Accuracy", value: "93.8%", sub: "MAPE = 6.2%", color: "text-chart-2" },
          { icon: Calendar, label: "Seasonal Impact", value: "\u20B97.68", sub: "Avg seasonal variation", color: "text-chart-3" },
          { icon: Droplets, label: "Crude Correlation", value: "0.89", sub: "r = 0.89 (WTI)", color: "text-chart-1" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="border-border bg-card">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-secondary p-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
