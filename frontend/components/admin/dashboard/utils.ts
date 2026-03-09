import { format, parseISO } from "date-fns"

import type { BookingPeriod, RevenuePeriod } from "./types"

export const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  expired: "bg-zinc-200 text-zinc-700",
}

export const bookingPeriodLabels: Record<BookingPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "180d": "Last 180 days",
  "1y": "Last 1 year",
  "3y": "Last 3 years",
}

export const revenuePeriodLabels: Record<RevenuePeriod, string> = {
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "180d": "Last 180 days",
}

export const bookingPeriodDays: Record<BookingPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "1y": 365,
  "3y": 1095,
}

export const revenuePeriodDays: Record<RevenuePeriod, number> = {
  "30d": 30,
  "90d": 90,
  "180d": 180,
}

export function formatDateTime(value: string) {
  const parsedDate = parseISO(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return format(parsedDate, "dd MMM yyyy, HH:mm")
}

export function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

export function toDayKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function dayLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return format(parsed, "MMM d")
}
