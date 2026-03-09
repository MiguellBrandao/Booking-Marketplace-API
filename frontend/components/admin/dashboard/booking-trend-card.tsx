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

import type { BookingPeriod, TrendBucket } from "./types"
import { bookingPeriodLabels, dayLabel } from "./utils"

type BookingTrendCardProps = {
  period: BookingPeriod
  onPeriodChange: (period: BookingPeriod) => void
  data: TrendBucket[]
}

export function BookingTrendCard({
  period,
  onPeriodChange,
  data,
}: BookingTrendCardProps) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Booking Trend</CardTitle>
        <CardDescription>
          Booking flow across the selected period.
        </CardDescription>
        <CardAction>
          <select
            value={period}
            onChange={(event) => onPeriodChange(event.target.value as BookingPeriod)}
            aria-label="Select booking trend period"
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="7d">{bookingPeriodLabels["7d"]}</option>
            <option value="30d">{bookingPeriodLabels["30d"]}</option>
            <option value="90d">{bookingPeriodLabels["90d"]}</option>
            <option value="180d">{bookingPeriodLabels["180d"]}</option>
            <option value="1y">{bookingPeriodLabels["1y"]}</option>
            <option value="3y">{bookingPeriodLabels["3y"]}</option>
          </select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not enough data to draw the trend.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="fillBookingsTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillBookingsConfirmed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillBookingsPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
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
                <YAxis allowDecimals={false} />
                <RechartsTooltip
                  labelFormatter={(value) => dayLabel(String(value))}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#0ea5e9"
                  fill="url(#fillBookingsTotal)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="confirmed"
                  name="Confirmed"
                  stroke="#10b981"
                  fill="url(#fillBookingsConfirmed)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke="#f59e0b"
                  fill="url(#fillBookingsPending)"
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
