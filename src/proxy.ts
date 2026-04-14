import { auth } from "@/auth";
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/wallet") ||
    req.nextUrl.pathname.startsWith("/transfers") ||
    isAdminRoute;
  if (isAdminRoute && !isLoggedIn) {
    return Response.redirect(new URL("/unauthorized", req.nextUrl));
  }
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/?modal=login", req.nextUrl));
  }
});
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
