// Least Squares Method Implementation
// Mathematical engine for fuel price forecasting

export interface RegressionResult {
  coefficients: number[]
  rSquared: number
  rmse: number
  mae: number
  mape: number
  predictions: number[]
  residuals: number[]
}

// Simple Linear Regression: y = b0 + b1*x
export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)

  const meanX = sumX / n
  const meanY = sumY / n

  // Normal equations solution
  const b1 = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b0 = meanY - b1 * meanX

  const predictions = x.map((xi) => b0 + b1 * xi)
  const residuals = y.map((yi, i) => yi - predictions[i])

  return {
    coefficients: [b0, b1],
    ...computeMetrics(y, predictions),
    predictions,
    residuals,
  }
}

// Polynomial Regression: y = b0 + b1*x + b2*x^2 + ... + bd*x^d
export function polynomialRegression(x: number[], y: number[], degree: number): RegressionResult {
  const n = x.length

  // Build Vandermonde matrix
  const X: number[][] = []
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j <= degree; j++) {
      row.push(Math.pow(x[i], j))
    }
    X.push(row)
  }

  // Solve using normal equations: (X^T * X)^-1 * X^T * y
  const Xt = transpose(X)
  const XtX = matMul(Xt, X)
  const XtY = matVecMul(Xt, y)
  const coefficients = solveLinearSystem(XtX, XtY)

  const predictions = x.map((xi) => {
    let pred = 0
    for (let j = 0; j <= degree; j++) {
      pred += coefficients[j] * Math.pow(xi, j)
    }
    return pred
  })

  const residuals = y.map((yi, i) => yi - predictions[i])

  return {
    coefficients,
    ...computeMetrics(y, predictions),
    predictions,
    residuals,
  }
}

// Forecast future values using polynomial model
export function forecast(
  coefficients: number[],
  futureX: number[]
): { predicted: number; lower95: number; upper95: number }[] {
  const degree = coefficients.length - 1

  return futureX.map((xi, idx) => {
    let predicted = 0
    for (let j = 0; j <= degree; j++) {
      predicted += coefficients[j] * Math.pow(xi, j)
    }

    // Prediction interval widens with distance (scaled for INR/litre)
    const uncertainty = 3.3 * (1 + idx * 0.12)
    const lower95 = predicted - 1.96 * uncertainty
    const upper95 = predicted + 1.96 * uncertainty

    return {
      predicted: +predicted.toFixed(2),
      lower95: +lower95.toFixed(2),
      upper95: +upper95.toFixed(2),
    }
  })
}

// Enhanced long-range forecast with seasonal decomposition
// Uses a damped trend + seasonal adjustment for more realistic multi-year predictions
export function longRangeForecast(
  historicalPrices: number[],
  coefficients: number[],
  months: number,
  startIndex: number,
  seasonalFactors: number[] // 12 monthly factors
): { predicted: number; lower95: number; upper95: number }[] {
  const degree = coefficients.length - 1

  // Compute the trend rate (derivative) at the last data point
  // For polynomial: slope = b1 + 2*b2*x + 3*b3*x^2 + ...
  let trendSlope = 0
  for (let j = 1; j <= degree; j++) {
    trendSlope += j * coefficients[j] * Math.pow(startIndex, j - 1)
  }

  // Damping factor to prevent runaway polynomial extrapolation
  // This makes the forecast converge to a gentle trend over longer horizons
  const dampingRate = 0.97 // each month the slope decays by 3%

  // Get the last actual price as starting point
  const lastPrice = historicalPrices[historicalPrices.length - 1]

  // Compute average seasonal amplitude from historical data
  const avgPrice = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length

  const results: { predicted: number; lower95: number; upper95: number }[] = []
  let currentPrice = lastPrice

  for (let i = 0; i < months; i++) {
    // Damped trend component
    const dampedSlope = trendSlope * Math.pow(dampingRate, i)
    currentPrice += dampedSlope

    // Seasonal adjustment (month index 0-11)
    const monthIdx = (i) % 12
    const seasonalAdj = seasonalFactors[monthIdx] * avgPrice * 0.12

    const predicted = currentPrice + seasonalAdj

    // Uncertainty grows with sqrt of time (like a random walk component)
    // plus a linear component for model uncertainty
    const baseUncertainty = 3.3
    const timeUncertainty = baseUncertainty * Math.sqrt(1 + i * 0.5)
    const modelUncertainty = 0.8 * i

    const totalUncertainty = timeUncertainty + modelUncertainty
    const lower95 = predicted - 1.96 * totalUncertainty
    const upper95 = predicted + 1.96 * totalUncertainty

    results.push({
      predicted: +predicted.toFixed(2),
      lower95: +lower95.toFixed(2),
      upper95: +upper95.toFixed(2),
    })
  }

  return results
}

// Matrix operations
function transpose(A: number[][]): number[][] {
  const rows = A.length
  const cols = A[0].length
  const result: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = A[i][j]
    }
  }
  return result
}

function matMul(A: number[][], B: number[][]): number[][] {
  const rows = A.length
  const cols = B[0].length
  const inner = B.length
  const result: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < inner; k++) {
        result[i][j] += A[i][k] * B[k][j]
      }
    }
  }
  return result
}

function matVecMul(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((acc, val, i) => acc + val * v[i], 0))
}

// Gaussian elimination with partial pivoting
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length
  const aug: number[][] = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = row
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]

    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col]
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j]
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n]
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j]
    }
    x[i] /= aug[i][i]
  }

  return x
}

function computeMetrics(actual: number[], predicted: number[]) {
  const n = actual.length
  const meanActual = actual.reduce((a, b) => a + b, 0) / n

  const ssTot = actual.reduce((acc, yi) => acc + Math.pow(yi - meanActual, 2), 0)
  const ssRes = actual.reduce((acc, yi, i) => acc + Math.pow(yi - predicted[i], 2), 0)

  const rSquared = +(1 - ssRes / ssTot).toFixed(4)
  const rmse = +Math.sqrt(ssRes / n).toFixed(4)
  const mae = +(actual.reduce((acc, yi, i) => acc + Math.abs(yi - predicted[i]), 0) / n).toFixed(4)
  const mape = +(
    (actual.reduce((acc, yi, i) => acc + Math.abs((yi - predicted[i]) / yi), 0) / n) *
    100
  ).toFixed(2)

  return { rSquared, rmse, mae, mape }
}
