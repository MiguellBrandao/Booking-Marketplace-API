import { apiFetch } from "./client"

export type BookingGuestResponse = {
  id: number
  email: string
  name: string
}

export type BookingResponse = {
  id: number
  guest?: BookingGuestResponse
  startDate: string
  endDate: string
  status: "pending" | "confirmed" | "cancelled" | "expired"
  totalAmount: number
  currency: string
  expiresAt: string
  canceledAt?: string | null
  cancelReason?: string | null
  expiredAt?: string | null
}

export function getHostBookings(search?: string) {
  const searchParams = new URLSearchParams()
  const normalizedSearch = search?.trim()

  if (normalizedSearch) {
    searchParams.set("search", normalizedSearch)
  }

  const query = searchParams.toString()
  const path = query ? `/bookings?${query}` : "/bookings"

  return apiFetch<BookingResponse[]>(
    path,
    {
      method: "GET",
    },
    true,
  )
}
