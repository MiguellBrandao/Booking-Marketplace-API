import { HugeiconsIcon } from "@hugeicons/react"
import { Home03Icon, TaskDone02Icon } from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"

import type { DashboardSummary } from "./types"
import { formatCurrency } from "./utils"

type DashboardSummaryCardsProps = {
  summary: DashboardSummary
  currency: string
}

export function DashboardSummaryCards({
  summary,
  currency,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardContent className="flex items-center justify-between pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Listings</p>
            <p className="text-xl font-semibold">{summary.totalListings}</p>
            <p className="text-xs text-muted-foreground">
              {summary.activeListings} active / {summary.inactiveListings} inactive
            </p>
          </div>
          <HugeiconsIcon icon={Home03Icon} strokeWidth={2} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Bookings</p>
            <p className="text-xl font-semibold">{summary.totalBookings}</p>
            <p className="text-xs text-muted-foreground">
              {summary.confirmed} confirmed / {summary.pending} pending
            </p>
          </div>
          <HugeiconsIcon icon={TaskDone02Icon} strokeWidth={2} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Confirmed Revenue</p>
          <p className="text-xl font-semibold">
            {formatCurrency(summary.confirmedRevenue, currency)}
          </p>
          <p className="text-xs text-muted-foreground">From confirmed bookings</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Pending Pipeline</p>
          <p className="text-xl font-semibold">
            {formatCurrency(summary.pendingRevenue, currency)}
          </p>
          <p className="text-xs text-muted-foreground">Value in pending bookings</p>
        </CardContent>
      </Card>
    </div>
  )
}
