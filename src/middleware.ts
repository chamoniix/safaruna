import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Exclude public pages under /guide
    if (path === "/guide/inscription") {
      return NextResponse.next()
    }

    // Protect /guide/* routes
    if (path.startsWith("/guide") && token?.role !== "GUIDE" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/connexion", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If it's a public path under protected directories, let it pass
        if (req.nextUrl.pathname === "/guide/inscription") {
          return true;
        }
        // Otherwise require a token
        return !!token
      },
    },
    pages: {
      signIn: '/connexion',
    }
  }
)

export const config = {
  matcher: [
    "/espace/:path*",
    "/guide/:path*"
  ]
}
