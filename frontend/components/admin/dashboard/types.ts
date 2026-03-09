export type BookingPeriod = "7d" | "30d" | "90d" | "180d" | "1y" | "3y"
export type RevenuePeriod = "30d" | "90d" | "180d"

export type DashboardSummary = {
  totalListings: number
  activeListings: number
  inactiveListings: number
  totalBookings: number
  pending: number
  confirmed: number
  cancelled: number
  expired: number
  confirmedRevenue: number
  pendingRevenue: number
}

export type TrendBucket = {
  date: string
  total: number
  pending: number
  confirmed: number
}

export type RevenueBucket = {
  date: string
  confirmedRevenue: number
  pendingRevenue: number
}
