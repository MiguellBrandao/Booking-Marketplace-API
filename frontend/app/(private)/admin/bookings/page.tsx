"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Clock01Icon,
  RefreshIcon,
  TaskDone02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { AppSidebar } from "@/components/app-sidebar"
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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-"
  }

  const parsedDate = parseISO(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return format(parsedDate, "dd MMM yyyy, HH:mm")
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value)
}

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  expired: "bg-zinc-200 text-zinc-700",
}

export default function Page() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [guestFilter, setGuestFilter] = useState("all")
  const [listingFilter, setListingFilter] = useState("all")

  const bookingsQuery = useBookings()
  const bookings = useMemo(() => bookingsQuery.data ?? [], [bookingsQuery.data])

  const guestOptions = useMemo(() => {
    const map = new Map<number, { id: number; label: string }>()

    for (const booking of bookings) {
      if (!booking.guest?.id) continue

      if (!map.has(booking.guest.id)) {
        const label = booking.guest.email
          ? `${booking.guest.name} (${booking.guest.email})`
          : booking.guest.name

        map.set(booking.guest.id, {
          id: booking.guest.id,
          label,
        })
      }
    }

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
  }, [bookings])

  const listingOptions = useMemo(() => {
    const map = new Map<number, { id: number; label: string }>()

    for (const booking of bookings) {
      if (!booking.listing?.id) continue

      if (!map.has(booking.listing.id)) {
        const label = booking.listing.city
          ? `${booking.listing.title} (${booking.listing.city})`
          : booking.listing.title

        map.set(booking.listing.id, {
          id: booking.listing.id,
          label,
        })
      }
    }

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
  }, [bookings])

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false
      }

      if (guestFilter !== "all" && String(booking.guest?.id ?? "") !== guestFilter) {
        return false
      }

      if (listingFilter !== "all" && String(booking.listing?.id ?? "") !== listingFilter) {
        return false
      }

      return true
    })
  }, [bookings, statusFilter, guestFilter, listingFilter])

  const summary = useMemo(() => {
    return filteredBookings.reduce(
      (acc, booking) => {
        acc.total += 1
        if (booking.status === "pending") acc.pending += 1
        if (booking.status === "confirmed") acc.confirmed += 1
        if (booking.status === "cancelled") acc.cancelled += 1
        if (booking.status === "expired") acc.expired += 1
        return acc
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        expired: 0,
      },
    )
  }, [filteredBookings])

  const hasActiveFilters =
    statusFilter !== "all" || guestFilter !== "all" || listingFilter !== "all"

  function handleClearFilters() {
    setStatusFilter("all")
    setGuestFilter("all")
    setListingFilter("all")
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
                    <BreadcrumbLink href="#">Bookings</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>
              <p className="text-sm text-muted-foreground">
                Manage reservations from your listings in one place.
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Filter by status"
              >
                <option value="all">Status: All</option>
                <option value="pending">Status: Pending</option>
                <option value="confirmed">Status: Confirmed</option>
                <option value="cancelled">Status: Cancelled</option>
                <option value="expired">Status: Expired</option>
              </select>

              <select
                value={guestFilter}
                onChange={(event) => setGuestFilter(event.target.value)}
                className="h-8 min-w-52 rounded-lg border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Filter by guest"
              >
                <option value="all">Guest: All</option>
                {guestOptions.map((guest) => (
                  <option key={guest.id} value={String(guest.id)}>
                    {guest.label}
                  </option>
                ))}
              </select>

              <select
                value={listingFilter}
                onChange={(event) => setListingFilter(event.target.value)}
                className="h-8 min-w-52 rounded-lg border border-input bg-background px-2 text-xs text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Filter by listing"
              >
                <option value="all">Listing: All</option>
                {listingOptions.map((listing) => (
                  <option key={listing.id} value={String(listing.id)}>
                    {listing.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters ? (
                <Button type="button" variant="ghost" onClick={handleClearFilters}>
                  Clear
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => bookingsQuery.refetch()}
                aria-label="Refresh bookings"
                title="Refresh bookings"
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  strokeWidth={2}
                  className={bookingsQuery.isFetching ? "animate-spin" : undefined}
                />
              </Button>
            </div>
          </div>

          {bookingsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-xl border bg-muted/30"
                />
              ))}
            </div>
          ) : null}

          {bookingsQuery.isError ? (
            <Card>
              <CardHeader>
                <CardTitle>Could not load bookings</CardTitle>
                <CardDescription>
                  {bookingsQuery.error instanceof Error
                    ? bookingsQuery.error.message
                    : "Unknown error"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" onClick={() => bookingsQuery.refetch()}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {!bookingsQuery.isLoading && !bookingsQuery.isError && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardContent className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-semibold">{summary.total}</p>
                  </div>
                  <HugeiconsIcon icon={TaskDone02Icon} strokeWidth={2} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-xl font-semibold">{summary.pending}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                  <p className="text-xl font-semibold">{summary.confirmed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                  <p className="text-xl font-semibold">{summary.cancelled}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Expired</p>
                  <p className="text-xl font-semibold">{summary.expired}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {!bookingsQuery.isLoading &&
          !bookingsQuery.isError &&
          filteredBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>
                  {hasActiveFilters ? "No results for current filters" : "No bookings yet"}
                </CardTitle>
                <CardDescription>
                  {hasActiveFilters
                    ? "Try different filter combinations."
                    : "Bookings from your listings will appear here."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {!bookingsQuery.isLoading &&
          !bookingsQuery.isError &&
          filteredBookings.length > 0 ? (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="border-border/70">
                  <CardHeader className="gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">Booking #{booking.id}</CardTitle>
                        <CardDescription>
                          Guest: {booking.guest?.name || "Unknown"}{" "}
                          {booking.guest?.email ? `(${booking.guest.email})` : ""}
                        </CardDescription>
                        <CardDescription>
                          Listing: {booking.listing?.title || "Unknown"}{" "}
                          {booking.listing?.city ? `(${booking.listing.city})` : ""}
                        </CardDescription>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                          statusClasses[booking.status] ?? statusClasses.expired
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                        Guest
                      </p>
                      <p className="pt-1 font-medium">
                        {booking.guest?.name || "Unknown guest"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
                        Stay
                      </p>
                      <p className="pt-1 font-medium">
                        {formatDateTime(booking.startDate)} to{" "}
                        {formatDateTime(booking.endDate)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="pt-1 font-medium">
                        {formatCurrency(booking.totalAmount, booking.currency)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
                        Expires At
                      </p>
                      <p className="pt-1 font-medium">{formatDateTime(booking.expiresAt)}</p>
                    </div>
                  </CardContent>
                  {booking.cancelReason ? (
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">Cancel reason</p>
                      <p className="text-sm">{booking.cancelReason}</p>
                    </CardContent>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
