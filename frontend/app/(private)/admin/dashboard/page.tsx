"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  RefreshIcon,
  TaskDone02Icon,
} from "@hugeicons/core-free-icons"

import { AppSidebar } from "@/components/app-sidebar"
import {
  BookingTrendCard,
} from "@/components/admin/dashboard/booking-trend-card"
import {
  DashboardBookingsPanels,
} from "@/components/admin/dashboard/bookings-panels"
import {
  RevenueTrendCard,
} from "@/components/admin/dashboard/revenue-trend-card"
import {
  DashboardSummaryCards,
} from "@/components/admin/dashboard/summary-cards"
import type {
  BookingPeriod,
  DashboardSummary,
  RevenueBucket,
  RevenuePeriod,
  TrendBucket,
} from "@/components/admin/dashboard/types"
import {
  bookingPeriodDays,
  endOfDay,
  revenuePeriodDays,
  startOfDay,
  toDayKey,
} from "@/components/admin/dashboard/utils"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useBookings } from "@/hooks/use-bookings"
import { useListings } from "@/hooks/use-listings"

export default function Page() {
  const listingsQuery = useListings()
  const bookingsQuery = useBookings()

  const [bookingPeriod, setBookingPeriod] = useState<BookingPeriod>("90d")
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("90d")

  const isLoading = listingsQuery.isLoading || bookingsQuery.isLoading
  const isError = listingsQuery.isError || bookingsQuery.isError
  const listings = listingsQuery.data
  const bookings = bookingsQuery.data

  const errorMessage = listingsQuery.error instanceof Error
    ? listingsQuery.error.message
    : bookingsQuery.error instanceof Error
    ? bookingsQuery.error.message
    : "Unknown error"

  const summary = useMemo<DashboardSummary>(() => {
    const listingData = listings ?? []
    const bookingData = bookings ?? []

    let confirmedRevenue = 0
    let pendingRevenue = 0
    let pending = 0
    let confirmed = 0
    let cancelled = 0
    let expired = 0

    for (const booking of bookingData) {
      if (booking.status === "confirmed") {
        confirmed += 1
        confirmedRevenue += booking.totalAmount
      } else if (booking.status === "pending") {
        pending += 1
        pendingRevenue += booking.totalAmount
      } else if (booking.status === "cancelled") {
        cancelled += 1
      } else if (booking.status === "expired") {
        expired += 1
      }
    }

    const activeListings = listingData.filter(
      (listing) => listing.status === "active",
    ).length

    return {
      totalListings: listingData.length,
      activeListings,
      inactiveListings: Math.max(listingData.length - activeListings, 0),
      totalBookings: bookingData.length,
      pending,
      confirmed,
      cancelled,
      expired,
      confirmedRevenue,
      pendingRevenue,
    }
  }, [listings, bookings])

  const bookingWindow = useMemo(() => {
    const end = endOfDay(new Date())
    const start = startOfDay(new Date())
    start.setDate(start.getDate() - (bookingPeriodDays[bookingPeriod] - 1))

    return { start, end }
  }, [bookingPeriod])

  const bookingTrendData = useMemo<TrendBucket[]>(() => {
    const buckets = new Map<string, TrendBucket>()

    for (
      let cursor = new Date(bookingWindow.start);
      cursor <= bookingWindow.end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = toDayKey(cursor)
      buckets.set(key, {
        date: key,
        total: 0,
        pending: 0,
        confirmed: 0,
      })
    }

    for (const booking of bookings ?? []) {
      const parsedDate = new Date(booking.startDate)
      if (Number.isNaN(parsedDate.getTime())) continue
      if (parsedDate < bookingWindow.start || parsedDate > bookingWindow.end) {
        continue
      }

      const key = toDayKey(parsedDate)
      const entry = buckets.get(key)
      if (!entry) continue

      entry.total += 1
      if (booking.status === "pending") entry.pending += 1
      if (booking.status === "confirmed") entry.confirmed += 1
    }

    return [...buckets.values()]
  }, [bookings, bookingWindow])

  const revenueWindow = useMemo(() => {
    const end = endOfDay(new Date())
    const start = startOfDay(new Date())
    start.setDate(start.getDate() - (revenuePeriodDays[revenuePeriod] - 1))

    return { start, end }
  }, [revenuePeriod])

  const revenueTrendData = useMemo<RevenueBucket[]>(() => {
    const buckets = new Map<string, RevenueBucket>()

    for (
      let cursor = new Date(revenueWindow.start);
      cursor <= revenueWindow.end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = toDayKey(cursor)
      buckets.set(key, {
        date: key,
        confirmedRevenue: 0,
        pendingRevenue: 0,
      })
    }

    for (const booking of bookings ?? []) {
      const parsedDate = new Date(booking.startDate)
      if (Number.isNaN(parsedDate.getTime())) continue
      if (parsedDate < revenueWindow.start || parsedDate > revenueWindow.end) {
        continue
      }

      const key = toDayKey(parsedDate)
      const entry = buckets.get(key)
      if (!entry) continue

      if (booking.status === "confirmed") {
        entry.confirmedRevenue += booking.totalAmount
      }

      if (booking.status === "pending") {
        entry.pendingRevenue += booking.totalAmount
      }
    }

    return [...buckets.values()]
  }, [bookings, revenueWindow])

  const revenueTotals = useMemo(() => {
    let confirmed = 0
    let pending = 0

    for (const item of revenueTrendData) {
      confirmed += item.confirmedRevenue
      pending += item.pendingRevenue
    }

    return { confirmed, pending }
  }, [revenueTrendData])

  const upcomingCheckIns = useMemo(() => {
    const now = new Date()
    return (bookings ?? [])
      .filter((booking) => {
        if (booking.status !== "confirmed") return false
        const start = new Date(booking.startDate)
        return !Number.isNaN(start.getTime()) && start >= now
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
      .slice(0, 5)
  }, [bookings])

  const pendingExpiringSoon = useMemo(() => {
    const now = new Date()
    return (bookings ?? [])
      .filter((booking) => {
        if (booking.status !== "pending") return false
        const expiresAt = new Date(booking.expiresAt)
        return !Number.isNaN(expiresAt.getTime()) && expiresAt >= now
      })
      .sort(
        (a, b) =>
          new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
      )
      .slice(0, 5)
  }, [bookings])

  const recentBookings = useMemo(() => {
    return [...(bookings ?? [])]
      .sort((a, b) => b.id - a.id)
      .slice(0, 6)
  }, [bookings])

  const primaryCurrency = bookings?.[0]?.currency ?? listings?.[0]?.currency ?? "EUR"

  function handleRefresh() {
    void Promise.all([listingsQuery.refetch(), bookingsQuery.refetch()])
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
              <p className="text-sm text-muted-foreground">
                Snapshot of your listings and booking operations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleRefresh}
                aria-label="Refresh dashboard"
                title="Refresh dashboard"
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  strokeWidth={2}
                  className={listingsQuery.isFetching || bookingsQuery.isFetching ? "animate-spin" : undefined}
                />
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/bookings">
                  <HugeiconsIcon icon={TaskDone02Icon} strokeWidth={2} />
                  View Bookings
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/listings/new">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  Create Listing
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-28 rounded-xl border bg-muted/30" />
                ))}
              </div>
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="h-80 rounded-xl border bg-muted/30 xl:col-span-2" />
                <div className="h-80 rounded-xl border bg-muted/30" />
              </div>
            </div>
          ) : null}

          {isError ? (
            <Card>
              <CardHeader>
                <CardTitle>Could not load dashboard</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" onClick={handleRefresh}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && !isError ? (
            <>
              <DashboardSummaryCards
                summary={summary}
                currency={primaryCurrency}
              />

              <div className="grid gap-4 xl:grid-cols-3">
                <BookingTrendCard
                  period={bookingPeriod}
                  onPeriodChange={setBookingPeriod}
                  data={bookingTrendData}
                />
                <RevenueTrendCard
                  period={revenuePeriod}
                  onPeriodChange={setRevenuePeriod}
                  data={revenueTrendData}
                  currency={primaryCurrency}
                  totals={revenueTotals}
                />
              </div>

              <DashboardBookingsPanels
                recentBookings={recentBookings}
                pendingExpiringSoon={pendingExpiringSoon}
                upcomingCheckIns={upcomingCheckIns}
              />
            </>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
