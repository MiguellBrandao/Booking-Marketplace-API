"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PencilEdit02Icon,
  PlusSignIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useListings } from "@/hooks/use-listings"

export default function Page() {
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useListings()

  const totalListings = data?.length ?? 0

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
                      Listings
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
            <h1 className="text-2xl font-semibold tracking-tight">My Listings</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => refetch()}
                aria-label="Refresh listings"
                title="Refresh listings"
              >
                <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 rounded-xl border bg-muted/30"
                />
              ))}
            </div>
          ) : null}

          {isError ? (
            <Card>
              <CardHeader>
                <CardTitle>Could not load listings</CardTitle>
                <CardDescription>
                  {error instanceof Error ? error.message : "Unknown error"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" onClick={() => refetch()}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && !isError && totalListings === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No listings yet</CardTitle>
                <CardDescription>
                  Create your first listing to start receiving bookings.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link href="/admin/listings/new">Create Listing</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : null}

          {!isLoading && !isError && totalListings > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.map((listing) => (
                <Card
                  key={listing.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      router.push(`/listings/${listing.id}`)
                    }
                  }}
                  className="cursor-pointer border-border/70 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                          listing.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {listing.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-xs text-muted-foreground">City</p>
                        <p className="font-medium">{listing.city}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-xs text-muted-foreground">Price / Night</p>
                        <p className="font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: listing.currency,
                          }).format(listing.pricePerNight)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                        Edit
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
