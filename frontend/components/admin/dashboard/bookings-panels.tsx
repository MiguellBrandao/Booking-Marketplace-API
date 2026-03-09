import { Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { BookingResponse } from "@/lib/api/bookings"

import { formatCurrency, formatDateTime, statusClasses } from "./utils"

type DashboardBookingsPanelsProps = {
  recentBookings: BookingResponse[]
  pendingExpiringSoon: BookingResponse[]
  upcomingCheckIns: BookingResponse[]
}

export function DashboardBookingsPanels({
  recentBookings,
  pendingExpiringSoon,
  upcomingCheckIns,
}: DashboardBookingsPanelsProps) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest booking records across your listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings available.</p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        Booking #{booking.id}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                          statusClasses[booking.status] ?? statusClasses.expired
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Guest: {booking.guest?.name || "Unknown"}{" "}
                      {booking.guest?.email ? `(${booking.guest.email})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(booking.startDate)} to {formatDateTime(booking.endDate)}
                    </p>
                    <p className="text-xs font-medium">
                      {formatCurrency(booking.totalAmount, booking.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Expiring Soon</CardTitle>
            <CardDescription>
              Pending bookings that may require fast action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingExpiringSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending bookings expiring soon.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingExpiringSoon.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border bg-muted/20 p-3"
                  >
                    <p className="text-sm font-medium">Booking #{booking.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Guest: {booking.guest?.name || "Unknown"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
                      Expires: {formatDateTime(booking.expiresAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Check-ins</CardTitle>
          <CardDescription>
            Next confirmed arrivals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingCheckIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming confirmed check-ins.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingCheckIns.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border bg-muted/20 p-3"
                >
                  <p className="text-sm font-medium">Booking #{booking.id}</p>
                  <p className="text-xs text-muted-foreground">
                    Guest: {booking.guest?.name || "Unknown"}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
                    Check-in: {formatDateTime(booking.startDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
