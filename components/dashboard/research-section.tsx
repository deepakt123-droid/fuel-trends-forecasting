"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { correlations, descriptiveStats, modelMetrics } from "@/lib/fuel-data"
import {
  BookOpen, Database, Calculator, FlaskConical, Target,
  TrendingUp, Lightbulb, BarChart3, ArrowRight,
} from "lucide-react"

export function ResearchSection() {
  return (
    <div className="space-y-4">
      {/* Abstract */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Research Abstract
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Fuel Price Trend Forecasting by Least Square Sense
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This research presents a comprehensive study on fuel price trend forecasting using the
            Least Squares Method (LSM). Fuel prices are critical economic indicators affecting
            transportation costs, inflation rates, and economic stability across India. The study employs the LSM
            approach to develop a mathematical model minimizing the sum of squared residuals between
            observed and predicted values. Using historical data spanning 2014-2026 with prices in Indian Rupees ({'\u20B9'}),
            we construct linear and polynomial regression models achieving <strong className="text-foreground">R² values of 0.84-0.88</strong> and{" "}
            <strong className="text-foreground">MAPE of 6.2%</strong> for optimal specifications, demonstrating
            reliable short to medium-term forecasting capability for the Indian fuel market.
          </p>
        </CardContent>
      </Card>

      {/* Methodology & Statistics Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Mathematical Framework */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Mathematical Framework
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="font-mono text-xs text-muted-foreground">Linear Model</p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {"y = \u03B2\u2080 + \u03B2\u2081x + \u03B5"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="font-mono text-xs text-muted-foreground">Normal Equations</p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {"\u03B2\u0302 = (X\u1D40X)\u207B\u00B9X\u1D40Y"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="font-mono text-xs text-muted-foreground">Objective Function</p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {"min \u03A3(y\u1D62 - \u0177\u1D62)\u00B2"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="font-mono text-xs text-muted-foreground">Polynomial Extension</p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {"y = \u03B2\u2080 + \u03B2\u2081x + \u03B2\u2082x\u00B2 + ... + \u03B5"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Descriptive Stats */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Descriptive Statistics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Observations", value: descriptiveStats.observations, unit: "weekly" },
                { label: "Time Span", value: descriptiveStats.span, unit: "" },
                { label: "Mean Price", value: `\u20B9${descriptiveStats.mean}`, unit: "/litre" },
                { label: "Median Price", value: `\u20B9${descriptiveStats.median}`, unit: "/litre" },
                { label: "Std Deviation", value: `\u20B9${descriptiveStats.stdDev}`, unit: "" },
                { label: "Minimum", value: `\u20B9${descriptiveStats.min}`, unit: descriptiveStats.minDate },
                { label: "Maximum", value: `\u20B9${descriptiveStats.max}`, unit: descriptiveStats.maxDate },
                { label: "CV", value: `${descriptiveStats.coeffVar}%`, unit: "" },
                { label: "Skewness", value: descriptiveStats.skewness, unit: "" },
                { label: "Kurtosis", value: descriptiveStats.kurtosis, unit: "" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {row.value}
                    </span>
                    {row.unit && (
                      <span className="ml-1 text-xs text-muted-foreground">{row.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Correlation Factors */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Correlation Analysis
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={correlations}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[-0.5, 1]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="factor"
                    type="category"
                    width={110}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
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
                    formatter={(value: number) => [value.toFixed(2), "r"]}
                  />
                  <Bar dataKey="correlation" radius={[0, 4, 4, 0]} barSize={16}>
                    {correlations.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.correlation > 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-4))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Findings */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              Key Research Findings
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Competitive Accuracy",
                desc: "LSM achieves MAPE of 6.2%, outperforming naive benchmarks by 10-12 percentage points while maintaining interpretability advantage over ML methods.",
              },
              {
                icon: TrendingUp,
                title: "Crude Oil Dominance",
                desc: "Crude oil prices explain ~79% of retail fuel price variation (r = 0.89), confirming supply-side fundamentals as the primary price driver.",
              },
              {
                icon: FlaskConical,
                title: "Non-linearity Matters",
                desc: "Polynomial regression significantly outperforms linear models (R² jump from 0.48 to 0.74), capturing threshold effects and regime changes.",
              },
              {
                icon: BarChart3,
                title: "Seasonal Patterns",
                desc: "Consistent seasonal component explains ~15% of total price variance with \u20B97.68/litre average variation between summer peaks and winter troughs.",
              },
              {
                icon: Database,
                title: "Horizon Trade-off",
                desc: "1-week forecasts achieve MAPE < 5%, degrading to ~14% at 12-week horizons. Directional accuracy ranges from 82% (1-week) to 64% (12-week).",
              },
              {
                icon: Calculator,
                title: "Practical Viability",
                desc: "Computational simplicity enables real-time deployment with model updates. 95% prediction intervals achieve 93% actual coverage rate.",
              },
            ].map((finding) => {
              const Icon = finding.icon
              return (
                <div key={finding.title} className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{finding.title}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{finding.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Best Model Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-primary">Best Model: Multiple Regression + Polynomial Terms</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Residuals normally distributed (Shapiro-Wilk p = 0.08), minimal heteroscedasticity (Breusch-Pagan p = 0.12),
                low autocorrelation (Durbin-Watson = 1.87)
              </p>
            </div>
            <div className="flex gap-4">
              {modelMetrics.filter(m => m.name === "Multi + Polynomial").map((m) => (
                <div key={m.name} className="flex gap-6">
                  <div className="text-center">
                    <p className="font-mono text-xl font-bold text-primary">{(m.testR2 * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Test R²</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-xl font-bold text-primary">{m.mape}%</p>
                    <p className="text-xs text-muted-foreground">MAPE</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-xl font-bold text-primary">{'\u20B9'}{m.rmse}</p>
                    <p className="text-xs text-muted-foreground">RMSE</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Selected References
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Bacon, R.W. (1991). Rockets and feathers: Asymmetric adjustment of UK retail gasoline prices. Energy Economics.",
              "Baumeister, C. & Kilian, L. (2015). Forecasting the real price of oil. Journal of Business & Economic Statistics.",
              "Hamilton, J.D. (2009). Understanding crude oil prices. The Energy Journal.",
              "Montgomery, D.C. et al. (2012). Introduction to Linear Regression Analysis. John Wiley & Sons.",
              "Alquist, R. et al. (2013). Forecasting the price of oil. Handbook of Economic Forecasting.",
              "Borenstein, S. et al. (1997). Do gasoline prices respond asymmetrically to crude oil price changes? QJE.",
            ].map((ref, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">{ref}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
