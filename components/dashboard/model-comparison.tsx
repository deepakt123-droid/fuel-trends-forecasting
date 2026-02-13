"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { modelMetrics, methodComparison } from "@/lib/fuel-data"

export function ModelComparison() {
  const radarData = modelMetrics.map((m) => ({
    model: m.name,
    "R² Score": m.rSquared * 100,
    "Accuracy": 100 - m.mape,
    "Precision": Math.max(0, (1 - m.rmse) * 100),
    "Consistency": ((m.trainR2 + m.testR2) / 2) * 100,
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Model Performance Bars */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Model Performance Comparison
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            R² score across regression models (train vs test)
          </p>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelMetrics}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]}
                />
                <Bar dataKey="trainR2" fill="hsl(var(--chart-1))" name="Train R²" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="testR2" fill="hsl(var(--chart-2))" name="Test R²" radius={[0, 4, 4, 0]} barSize={14} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Model Capability Radar
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Multi-dimensional model evaluation
          </p>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="model"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                />
                <Radar name="R² Score" dataKey="R² Score" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} />
                <Radar name="Accuracy" dataKey="Accuracy" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                <Radar name="Precision" dataKey="Precision" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Method Comparison */}
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Method Comparison: MAPE (%)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Our LSM approach vs. alternative forecasting methods
          </p>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={methodComparison}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="method"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={60}
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
                  formatter={(value: number) => [`${value}%`, "MAPE"]}
                />
                <Bar dataKey="mape" name="MAPE (%)" radius={[4, 4, 0, 0]} barSize={32}>
                  {methodComparison.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.method === "LSM (Ours)" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                      opacity={entry.method === "LSM (Ours)" ? 1 : 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
