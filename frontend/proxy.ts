import { type NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/auth/login", "/auth/signup"] as const
const REDIRECT_WHEN_NOT_AUTHENTICATED = "/auth/login"
const REDIRECT_WHEN_AUTHENTICATED = "/admin/dashboard"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  const refreshToken = request.cookies.get("refreshToken")?.value
  const isAuthenticated = Boolean(refreshToken)

  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthenticated && isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = REDIRECT_WHEN_AUTHENTICATED
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
