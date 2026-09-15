import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isSuperAdmin = token?.role === "SUPER_ADMIN";
    const path = req.nextUrl.pathname;

    const isChangePasswordPage = path.startsWith('/change-password');

    if (token) {
      // Force password change enforcement
      if (token.forcePasswordChange && !isChangePasswordPage) {
        return NextResponse.redirect(new URL('/change-password', req.url));
      }
      
      // Prevent access to change password page if not forced
      if (!token.forcePasswordChange && isChangePasswordPage) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Super Admin should be redirected from client dashboard to admin dashboard
      if (path === "/" && isSuperAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, they have their own auth checks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page itself)
     * - forgot-password (public page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|forgot-password).*)",
  ],
};
