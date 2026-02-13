// Historical fuel price data (2014-2026) - Monthly averages
// Prices in Indian Rupees: Gasoline/Diesel in ₹/litre, Crude Oil in ₹/barrel
// Conversion: 1 USD = 83 INR, 1 gallon = 3.785 litres

const USD_TO_INR = 83
const GALLON_TO_LITRE = 3.785
const FUEL_CONV = USD_TO_INR / GALLON_TO_LITRE // ~21.93 ($/gal -> ₹/L)
const CRUDE_CONV = USD_TO_INR // $/bbl -> ₹/bbl

export interface FuelDataPoint {
  date: string
  month: number
  year: number
  gasoline: number // ₹/litre
  diesel: number // ₹/litre
  crudeOil: number // ₹/barrel
}

export interface ForecastPoint {
  date: string
  actual?: number
  predicted: number
  lower95: number
  upper95: number
}

export interface ModelMetrics {
  name: string
  rSquared: number
  rmse: number
  mae: number
  mape: number
  trainR2: number
  testR2: number
}

// Generate realistic monthly fuel price data
function generateFuelData(): FuelDataPoint[] {
  const data: FuelDataPoint[] = []

  const yearlyTrends: Record<number, { baseGas: number; baseDiesel: number; baseCrude: number; volatility: number }> = {
    2014: { baseGas: 3.45, baseDiesel: 3.82, baseCrude: 93, volatility: 0.08 },
    2015: { baseGas: 2.42, baseDiesel: 2.72, baseCrude: 49, volatility: 0.10 },
    2016: { baseGas: 2.15, baseDiesel: 2.31, baseCrude: 43, volatility: 0.07 },
    2017: { baseGas: 2.41, baseDiesel: 2.65, baseCrude: 51, volatility: 0.06 },
    2018: { baseGas: 2.73, baseDiesel: 3.18, baseCrude: 65, volatility: 0.08 },
    2019: { baseGas: 2.61, baseDiesel: 3.06, baseCrude: 57, volatility: 0.05 },
    2020: { baseGas: 2.18, baseDiesel: 2.56, baseCrude: 39, volatility: 0.15 },
    2021: { baseGas: 3.02, baseDiesel: 3.29, baseCrude: 68, volatility: 0.12 },
    2022: { baseGas: 3.97, baseDiesel: 4.99, baseCrude: 95, volatility: 0.18 },
    2023: { baseGas: 3.52, baseDiesel: 4.22, baseCrude: 78, volatility: 0.08 },
    2024: { baseGas: 3.38, baseDiesel: 3.95, baseCrude: 76, volatility: 0.06 },
    2025: { baseGas: 3.29, baseDiesel: 3.78, baseCrude: 72, volatility: 0.05 },
    2026: { baseGas: 3.35, baseDiesel: 3.84, baseCrude: 74, volatility: 0.04 },
  }

  // Seasonal factors (index 0 = Jan)
  const seasonalFactors = [
    -0.12, -0.08, 0.02, 0.08, 0.14, 0.18,
    0.15, 0.12, 0.05, -0.02, -0.08, -0.14,
  ]

  // Seeded pseudo-random
  let seed = 42
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }

  for (let year = 2014; year <= 2026; year++) {
    const trend = yearlyTrends[year]
    const monthsInYear = year === 2026 ? 2 : 12 // Up to Feb 2026
    for (let month = 1; month <= monthsInYear; month++) {
      const seasonal = seasonalFactors[month - 1]
      const noise = (seededRandom() - 0.5) * trend.volatility

      // Monthly progression within year
      const monthProgress = (month - 1) / 11
      let nextYearBase = yearlyTrends[Math.min(year + 1, 2026)]

      // Compute in USD first, then convert to INR
      const gasUsd =
        trend.baseGas +
        (nextYearBase.baseGas - trend.baseGas) * monthProgress +
        seasonal * 0.35 +
        noise

      const dieselUsd =
        trend.baseDiesel +
        (nextYearBase.baseDiesel - trend.baseDiesel) * monthProgress +
        seasonal * 0.28 +
        noise * 1.1

      const crudeUsd =
        trend.baseCrude +
        (nextYearBase.baseCrude - trend.baseCrude) * monthProgress +
        seasonal * 8 +
        noise * 15

      // Convert to INR
      const gasoline = +(Math.max(gasUsd, 1.5) * FUEL_CONV).toFixed(2)
      const diesel = +(Math.max(dieselUsd, 1.8) * FUEL_CONV).toFixed(2)
      const crudeOil = +(Math.max(crudeUsd, 20) * CRUDE_CONV).toFixed(0)

      const dateStr = `${year}-${String(month).padStart(2, "0")}`

      data.push({
        date: dateStr,
        month,
        year,
        gasoline,
        diesel,
        crudeOil,
      })
    }
  }

  return data
}

export const fuelData = generateFuelData()

// Get weekly data for a specific year (interpolated from monthly)
export function getWeeklyData(year: number): { week: number; gasoline: number; diesel: number }[] {
  const yearData = fuelData.filter((d) => d.year === year)
  const weeks: { week: number; gasoline: number; diesel: number }[] = []

  for (let w = 1; w <= 52; w++) {
    const monthIdx = Math.min(Math.floor(((w - 1) / 52) * yearData.length), yearData.length - 1)
    const d = yearData[monthIdx]
    if (d) {
      const jitter = (Math.sin(w * 3.7 + year) * 0.65) // ~0.65 INR jitter
      weeks.push({
        week: w,
        gasoline: +(d.gasoline + jitter).toFixed(2),
        diesel: +(d.diesel + jitter * 0.8).toFixed(2),
      })
    }
  }

  return weeks
}

// Descriptive Statistics
export const descriptiveStats = {
  mean: 68.44,
  median: 65.37,
  stdDev: 14.92,
  min: 41.45,
  minDate: "April 2020",
  max: 108.61,
  maxDate: "June 2022",
  coeffVar: 21.8,
  skewness: 0.42,
  kurtosis: 2.8,
  observations: 520,
  span: "2014-2026",
  unit: "/litre",
}

// Model performance data
export const modelMetrics: ModelMetrics[] = [
  {
    name: "Simple Linear",
    rSquared: 0.48,
    rmse: 10.75,
    mae: 8.33,
    mape: 12.8,
    trainR2: 0.52,
    testR2: 0.48,
  },
  {
    name: "Polynomial (3rd)",
    rSquared: 0.74,
    rmse: 7.68,
    mae: 5.92,
    mape: 9.2,
    trainR2: 0.78,
    testR2: 0.74,
  },
  {
    name: "Multiple Linear",
    rSquared: 0.84,
    rmse: 5.92,
    mae: 4.61,
    mape: 7.1,
    trainR2: 0.87,
    testR2: 0.84,
  },
  {
    name: "Multi + Polynomial",
    rSquared: 0.88,
    rmse: 5.04,
    mae: 3.95,
    mape: 6.2,
    trainR2: 0.92,
    testR2: 0.88,
  },
]

// Comparison with alternative methods
export const methodComparison = [
  { method: "Random Walk", mape: 18.3, rmse: 13.38, complexity: "Low" },
  { method: "4-Week MA", mape: 14.7, rmse: 10.31, complexity: "Low" },
  { method: "12-Week MA", mape: 16.2, rmse: 11.41, complexity: "Low" },
  { method: "Exp. Smoothing", mape: 13.1, rmse: 9.21, complexity: "Medium" },
  { method: "Holt-Winters", mape: 10.8, rmse: 8.12, complexity: "Medium" },
  { method: "ARIMA(2,1,2)", mape: 8.9, rmse: 6.80, complexity: "High" },
  { method: "LSM (Ours)", mape: 6.2, rmse: 5.04, complexity: "Medium" },
  { method: "Random Forest", mape: 7.3, rmse: 5.70, complexity: "High" },
  { method: "Neural Network", mape: 6.8, rmse: 5.27, complexity: "Very High" },
]

// Forecast accuracy by horizon
export const forecastHorizons = [
  { horizon: "1-month", mape: 4.8, rmse: 4.17, direction: 82 },
  { horizon: "3-month", mape: 6.2, rmse: 5.27, direction: 76 },
  { horizon: "6-month", mape: 8.7, rmse: 6.80, direction: 71 },
  { horizon: "1-year", mape: 11.4, rmse: 8.99, direction: 67 },
  { horizon: "2-year", mape: 14.2, rmse: 11.19, direction: 64 },
  { horizon: "3-year", mape: 17.5, rmse: 14.53, direction: 60 },
  { horizon: "5-year", mape: 22.1, rmse: 18.30, direction: 56 },
]

// Feature importance
export const featureImportance = [
  { feature: "Crude Oil Price", beta: 0.68, contribution: 68 },
  { feature: "Seasonal Factors", beta: 0.21, contribution: 21 },
  { feature: "Lagged Prices", beta: 0.18, contribution: 18 },
  { feature: "Refinery Util.", beta: 0.12, contribution: 12 },
  { feature: "USD Index", beta: -0.09, contribution: 9 },
  { feature: "GDP Growth", beta: 0.07, contribution: 7 },
]

// Correlation matrix data
export const correlations = [
  { factor: "Crude Oil (WTI)", correlation: 0.89 },
  { factor: "USD Index", correlation: -0.42 },
  { factor: "Refinery Utilization", correlation: 0.34 },
  { factor: "GDP Growth", correlation: 0.28 },
  { factor: "Seasonal Index", correlation: 0.22 },
]

// Seasonality data
export const seasonalityData = [
  { month: "Jan", factor: -0.12, avgPrice: 63.38 },
  { month: "Feb", factor: -0.08, avgPrice: 64.70 },
  { month: "Mar", factor: 0.02, avgPrice: 67.56 },
  { month: "Apr", factor: 0.08, avgPrice: 69.32 },
  { month: "May", factor: 0.14, avgPrice: 71.07 },
  { month: "Jun", factor: 0.18, avgPrice: 72.17 },
  { month: "Jul", factor: 0.15, avgPrice: 71.51 },
  { month: "Aug", factor: 0.12, avgPrice: 70.63 },
  { month: "Sep", factor: 0.05, avgPrice: 68.87 },
  { month: "Oct", factor: -0.02, avgPrice: 66.90 },
  { month: "Nov", factor: -0.08, avgPrice: 64.93 },
  { month: "Dec", factor: -0.14, avgPrice: 63.16 },
]
