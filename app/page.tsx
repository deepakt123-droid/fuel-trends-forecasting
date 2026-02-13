"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { PriceTrendChart } from "@/components/dashboard/price-trend-chart"
import { OverviewSection } from "@/components/dashboard/overview-section"
import { ForecastingTool } from "@/components/dashboard/forecasting-tool"
import { ModelComparison } from "@/components/dashboard/model-comparison"
import { ResearchSection } from "@/components/dashboard/research-section"
import { Fuel } from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 px-4 py-4 sm:px-6">
        {/* Stat Cards - always visible */}
        <div className="mb-4">
          <StatCards />
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {activeTab === "overview" && (
            <>
              <PriceTrendChart />
              <OverviewSection />
            </>
          )}

          {activeTab === "forecasting" && <ForecastingTool />}

          {activeTab === "models" && <ModelComparison />}

          {activeTab === "research" && <ResearchSection />}
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-border py-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-md bg-primary p-1.5">
                <Fuel className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Fuel Trend</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                v2.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Fuel Price Trend Forecasting by Least Squares Method | Research Study February 2026
            </p>
            <p className="text-xs text-muted-foreground">
              Data sources: EIA, Government Statistical Agencies
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
