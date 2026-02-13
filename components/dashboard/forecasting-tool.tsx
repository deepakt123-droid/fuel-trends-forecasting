"use client"

import { useState, useMemo } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Legend,
  BarChart, Bar, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fuelData, forecastHorizons, featureImportance, seasonalityData } from "@/lib/fuel-data"
import { polynomialRegression, longRangeForecast } from "@/lib/least-squares"
import { Play, RotateCcw, AlertTriangle, CheckCircle2, CalendarRange, TrendingUp, IndianRupee } from "lucide-react"

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const SEASONAL_FACTORS = [
  -0.12, -0.08, 0.02, 0.08, 0.14, 0.18,
  0.15, 0.12, 0.05, -0.02, -0.08, -0.14,
]

export function ForecastingTool() {
  const [degree, setDegree] = useState(3)
  const [horizonMonths, setHorizonMonths] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [fuelType, setFuelType] = useState<"gasoline" | "diesel">("gasoline")

  const forecastResults = useMemo(() => {
    const prices = fuelData.map((d) => fuelType === "gasoline" ? d.gasoline : d.diesel)
    const x = prices.map((_, i) => i)
    const result = polynomialRegression(x, prices, degree)

    const lastDate = fuelData[fuelData.length - 1]

    // Use long-range forecast with seasonal decomposition
    const predictions = longRangeForecast(
      prices,
      result.coefficients,
      horizonMonths,
      x.length,
      SEASONAL_FACTORS
    )

    const forecastData = predictions.map((p, i) => {
      const futureMonth = ((lastDate.month + i) % 12) + 1
      const futureYear = lastDate.year + Math.floor((lastDate.month + i) / 12)
      return {
        date: `${futureYear}-${String(futureMonth).padStart(2, "0")}`,
        year: futureYear,
        month: futureMonth,
        predicted: p.predicted,
        lower95: p.lower95,
        upper95: p.upper95,
      }
    })

    // Show last 36 months of historical data for context
    const historicalSlice = fuelData.slice(-36).map((d) => ({
      date: d.date,
      actual: fuelType === "gasoline" ? d.gasoline : d.diesel,
      predicted: undefined as number | undefined,
      lower95: undefined as number | undefined,
      upper95: undefined as number | undefined,
    }))

    // Transition point
    const lastHistorical = historicalSlice[historicalSlice.length - 1]

    const combined = [
      ...historicalSlice,
      {
        date: lastHistorical.date,
        actual: lastHistorical.actual,
        predicted: lastHistorical.actual,
        lower95: lastHistorical.actual,
        upper95: lastHistorical.actual,
      },
      ...forecastData.map((f) => ({
        date: f.date,
        actual: undefined as number | undefined,
        predicted: f.predicted,
        lower95: f.lower95,
        upper95: f.upper95,
      })),
    ]

    // Build yearly summary
    const yearlyMap = new Map<number, { prices: number[]; lows: number[]; highs: number[] }>()
    for (const f of forecastData) {
      if (!yearlyMap.has(f.year)) {
        yearlyMap.set(f.year, { prices: [], lows: [], highs: [] })
      }
      const entry = yearlyMap.get(f.year)!
      entry.prices.push(f.predicted)
      entry.lows.push(f.lower95)
      entry.highs.push(f.upper95)
    }

    const yearlySummary = Array.from(yearlyMap.entries()).map(([year, v]) => ({
      year,
      avgPrice: +(v.prices.reduce((a, b) => a + b, 0) / v.prices.length).toFixed(2),
      minPrice: +Math.min(...v.prices).toFixed(2),
      maxPrice: +Math.max(...v.prices).toFixed(2),
      low95: +Math.min(...v.lows).toFixed(2),
      high95: +Math.max(...v.highs).toFixed(2),
      monthCount: v.prices.length,
    }))

    return {
      combined,
      forecastData,
      yearlySummary,
      metrics: {
        rSquared: result.rSquared,
        rmse: result.rmse,
        mae: result.mae,
        mape: result.mape,
      },
      nextMonth: forecastData[0],
      endForecast: forecastData[forecastData.length - 1],
    }
  }, [degree, horizonMonths, fuelType])

  const runForecast = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setHasRun(true)
    }, 1000)
  }

  const fuelLabel = fuelType === "gasoline" ? "Gasoline" : "Diesel"
  const lastForecastDate = forecastResults.forecastData[forecastResults.forecastData.length - 1]
  const lastForecastMonth = MONTH_NAMES[(lastForecastDate?.month ?? 1) - 1]
  const lastForecastYear = lastForecastDate?.year ?? 2031

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarRange className="h-4 w-4 text-primary" />
            Long-Range Forecasting Engine
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Configure LSM parameters and generate multi-year fuel price forecasts using damped trend + seasonal decomposition
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Fuel Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Fuel Type
              </label>
              <div className="flex rounded-lg border border-border bg-secondary p-0.5">
                {(["gasoline", "diesel"] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFuelType(ft)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                      fuelType === ft
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ft === "gasoline" ? "Gasoline" : "Diesel"}
                  </button>
                ))}
              </div>
            </div>

            {/* Polynomial Degree */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Polynomial Degree
              </label>
              <div className="flex rounded-lg border border-border bg-secondary p-0.5">
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDegree(d)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                      degree === d
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d === 1 ? "Linear" : `Deg ${d}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Forecast Horizon */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Forecast Horizon
              </label>
              <div className="flex rounded-lg border border-border bg-secondary p-0.5">
                {[12, 24, 36, 48, 60].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizonMonths(h)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                      horizonMonths === h
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {h / 12}yr
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <Button
                onClick={runForecast}
                disabled={isRunning}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Computing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-3.5 w-3.5" />
                    Forecast
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { setDegree(3); setHorizonMonths(60); setHasRun(false); setFuelType("gasoline") }}
                className="shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Model metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "R\u00B2 Score", value: forecastResults.metrics.rSquared.toFixed(3), good: forecastResults.metrics.rSquared > 0.7 },
              { label: "RMSE", value: `\u20B9${forecastResults.metrics.rmse.toFixed(2)}`, good: forecastResults.metrics.rmse < 8 },
              { label: "MAE", value: `\u20B9${forecastResults.metrics.mae.toFixed(2)}`, good: forecastResults.metrics.mae < 6 },
              { label: "MAPE", value: `${forecastResults.metrics.mape.toFixed(1)}%`, good: forecastResults.metrics.mape < 10 },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-secondary/50 p-3">
                <div className="flex items-center gap-1.5">
                  {m.good ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  )}
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Forecast Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {fuelLabel} Price Forecast: {horizonMonths / 12}-Year Outlook
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Historical data (3 years) + {horizonMonths}-month ahead forecast through {lastForecastMonth} {lastForecastYear} with 95% prediction interval
              </p>
            </div>
            {hasRun && forecastResults.nextMonth && forecastResults.endForecast && (
              <div className="flex gap-3">
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next Month</p>
                  <p className="font-mono text-lg font-bold text-primary">
                    {'\u20B9'}{forecastResults.nextMonth.predicted.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {'\u20B9'}{forecastResults.nextMonth.lower95.toFixed(0)} - {'\u20B9'}{forecastResults.nextMonth.upper95.toFixed(0)}
                  </p>
                </div>
                <div className="rounded-lg border border-chart-2/20 bg-chart-2/5 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{lastForecastMonth} {lastForecastYear}</p>
                  <p className="font-mono text-lg font-bold text-[hsl(var(--chart-2))]">
                    {'\u20B9'}{forecastResults.endForecast.predicted.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {'\u20B9'}{forecastResults.endForecast.lower95.toFixed(0)} - {'\u20B9'}{forecastResults.endForecast.upper95.toFixed(0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastResults.combined} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const [y, m] = v.split("-")
                    const mi = parseInt(m) - 1
                    // For long timescales, only show Jan labels
                    if (horizonMonths > 24 && mi !== 0 && mi !== 6) return ""
                    return `${MONTH_NAMES[mi]} '${y.slice(2)}`
                  }}
                  interval={horizonMonths > 36 ? 5 : horizonMonths > 12 ? 3 : 2}
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
                  labelFormatter={(v) => {
                    const [y, m] = (v as string).split("-")
                    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`
                  }}
                  formatter={(value: number | undefined, name: string) => {
                    if (value === undefined) return ["-", name]
                    return [`\u20B9${value.toFixed(2)}/L`, name]
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upper95"
                  stroke="none"
                  fill="url(#colorCI)"
                  name="Upper 95% CI"
                />
                <Area
                  type="monotone"
                  dataKey="lower95"
                  stroke="none"
                  fill="transparent"
                  name="Lower 95% CI"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2.5}
                  dot={false}
                  name={`Actual ${fuelLabel}`}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  name={`Forecast ${fuelLabel}`}
                  connectNulls={false}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Forecast Summary Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <IndianRupee className="h-4 w-4 text-primary" />
            Yearly {fuelLabel} Price Forecast Summary
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Annual average, range, and confidence bounds ({'\u20B9'}/litre)
          </p>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Avg Price</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Low</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">High</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">95% CI Low</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">95% CI High</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">YoY Change</th>
                </tr>
              </thead>
              <tbody>
                {forecastResults.yearlySummary.map((row, idx) => {
                  const prevAvg = idx > 0 ? forecastResults.yearlySummary[idx - 1].avgPrice : null
                  const yoyChange = prevAvg ? ((row.avgPrice - prevAvg) / prevAvg * 100) : null
                  return (
                    <tr
                      key={row.year}
                      className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="font-semibold text-foreground">{row.year}</span>
                          {row.monthCount < 12 && (
                            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {row.monthCount}mo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-primary">
                        {'\u20B9'}{row.avgPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                        {'\u20B9'}{row.minPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                        {'\u20B9'}{row.maxPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs text-muted-foreground">
                        {'\u20B9'}{row.low95.toFixed(0)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs text-muted-foreground">
                        {'\u20B9'}{row.high95.toFixed(0)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {yoyChange !== null ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-medium ${
                            yoyChange >= 0
                              ? "bg-red-500/10 text-red-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {yoyChange >= 0 ? "+" : ""}{yoyChange.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">--</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Yearly Bar Chart */}
          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastResults.yearlySummary} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="year"
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
                  formatter={(value: number, name: string) => [`\u20B9${value.toFixed(2)}/L`, name]}
                />
                <Bar
                  dataKey="avgPrice"
                  name="Avg Price"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="minPrice"
                  name="Min Price"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                  opacity={0.6}
                />
                <Bar
                  dataKey="maxPrice"
                  name="Max Price"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                  opacity={0.6}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Horizon Accuracy + Seasonality */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Forecast Accuracy by Horizon
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              MAPE and directional accuracy degrade with longer horizons
            </p>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastHorizons} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="horizon"
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
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="mape" name="MAPE (%)" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={28} />
                  <Bar dataKey="direction" name="Direction (%)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={28} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Seasonal Price Patterns
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Average gasoline prices by month (2014-2026)
            </p>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    domain={[58, 76]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`\u20B9${value.toFixed(2)}`, "Avg Price"]}
                  />
                  <Bar dataKey="avgPrice" name="Avg Price" radius={[4, 4, 0, 0]} barSize={24}>
                    {seasonalityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.factor > 0 ? "hsl(var(--chart-3))" : "hsl(var(--chart-2))"}
                        opacity={0.7 + Math.abs(entry.factor) * 2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Importance */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Feature Importance Analysis
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Contribution of each predictor variable to the model
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {featureImportance.map((f, i) => (
              <div key={f.feature} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{f.feature}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {"beta"} = {f.beta > 0 ? "+" : ""}{f.beta.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{f.contribution}%</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(f.contribution / 68) * 100}%`,
                      backgroundColor: i === 0 ? "hsl(var(--chart-1))" : i < 3 ? "hsl(var(--chart-2))" : "hsl(var(--muted-foreground))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
