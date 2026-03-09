import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { RevenueBucket, RevenuePeriod } from "./types"
import { dayLabel, formatCurrency, revenuePeriodLabels } from "./utils"

type RevenueTrendCardProps = {
  period: RevenuePeriod
  onPeriodChange: (period: RevenuePeriod) => void
  data: RevenueBucket[]
  currency: string
  totals: {
    confirmed: number
    pending: number
  }
}

export function RevenueTrendCard({
  period,
  onPeriodChange,
  data,
  currency,
  totals,
}: RevenueTrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>
          Confirmed revenue vs pending pipeline.
        </CardDescription>
        <CardAction>
          <select
            value={period}
            onChange={(event) => onPeriodChange(event.target.value as RevenuePeriod)}
            aria-label="Select revenue period"
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="30d">{revenuePeriodLabels["30d"]}</option>
            <option value="90d">{revenuePeriodLabels["90d"]}</option>
            <option value="180d">{revenuePeriodLabels["180d"]}</option>
          </select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="mb-3 space-y-1 rounded-lg border bg-muted/20 p-2.5">
          <p className="text-xs text-muted-foreground">
            Confirmed: {formatCurrency(totals.confirmed, currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            Pending: {formatCurrency(totals.pending, currency)}
          </p>
        </div>

        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No revenue data available.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="fillRevenueConfirmed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillRevenuePending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={dayLabel}
                />
                <YAxis />
                <RechartsTooltip
                  labelFormatter={(value) => dayLabel(String(value))}
                  formatter={(value, name) => [
                    formatCurrency(Number(value ?? 0), currency),
                    name === "confirmedRevenue" ? "Confirmed" : "Pending",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="confirmedRevenue"
                  name="Confirmed"
                  stroke="#10b981"
                  fill="url(#fillRevenueConfirmed)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pendingRevenue"
                  name="Pending"
                  stroke="#f59e0b"
                  fill="url(#fillRevenuePending)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
