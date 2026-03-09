"use client"

import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Clock01Icon,
  RefreshIcon,
  Search01Icon,
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
import { Input } from "@/components/ui/input"
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
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  const bookingsQuery = useBookings(search)
  const bookings = bookingsQuery.data

  const summary = useMemo(() => {
    return (bookings ?? []).reduce(
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
  }, [bookings])

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  function handleClearSearch() {
    setSearchInput("")
    setSearch("")
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
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full items-center gap-2 md:w-[28rem]"
              >
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by id, status, guest, listing..."
                />
                <Button type="submit" variant="outline">
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                  Search
                </Button>
              </form>
              {search ? (
                <Button type="button" variant="ghost" onClick={handleClearSearch}>
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
          (bookings?.length ?? 0) === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>
                  {search ? "No results for this search" : "No bookings yet"}
                </CardTitle>
                <CardDescription>
                  {search
                    ? "Try another term to find bookings."
                    : "Bookings from your listings will appear here."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {!bookingsQuery.isLoading &&
          !bookingsQuery.isError &&
          (bookings?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {bookings?.map((booking) => (
                <Card key={booking.id} className="border-border/70">
                  <CardHeader className="gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">Booking #{booking.id}</CardTitle>
                        <CardDescription>
                          Guest: {booking.guest?.name || "Unknown"}{" "}
                          {booking.guest?.email ? `(${booking.guest.email})` : ""}
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
