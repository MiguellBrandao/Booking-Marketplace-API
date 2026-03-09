import { useQuery } from "@tanstack/react-query"

import { getHostBookings } from "@/lib/api/bookings"

export function useBookings(search?: string) {
  return useQuery({
    queryKey: ["host-bookings", search?.trim() ?? ""],
    queryFn: () => getHostBookings(search),
  })
}
