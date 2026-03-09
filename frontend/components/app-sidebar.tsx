"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { logout, refresh } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/auth-store"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare03Icon,
  Home03Icon,
  TaskDone02Icon,
  Logout03Icon,
} from "@hugeicons/core-free-icons"

const navItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: <HugeiconsIcon icon={DashboardSquare03Icon} strokeWidth={2} />,
  },
  {
    title: "Listings",
    url: "/admin/listings",
    icon: <HugeiconsIcon icon={Home03Icon} strokeWidth={2} />,
  },
  {
    title: "Bookings",
    url: "/admin/bookings",
    icon: <HugeiconsIcon icon={TaskDone02Icon} strokeWidth={2} />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const setTokens = useAuthStore((state) => state.setTokens)
  const clear = useAuthStore((state) => state.clear)

  async function handleLogout() {
    let token = accessToken

    if (!token) {
      try {
        const refreshed = await refresh()
        setTokens({ accessToken: refreshed.accessToken })
        token = refreshed.accessToken
      } catch {
        clear()
        router.push("/auth/login")
        return
      }
    }

    await logout(token).catch(async () => {
      const refreshed = await refresh()
      setTokens({ accessToken: refreshed.accessToken })
      await logout(refreshed.accessToken)
    }).catch(() => null)

    clear()
    router.push("/auth/login")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <HugeiconsIcon icon={Home03Icon} strokeWidth={2} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-tight">
              Booking Marketplace
            </p>
            <p className="truncate text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
            onClick={handleLogout}
          >
            <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
