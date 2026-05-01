import { NextResponse } from "next/server";
import { auth } from "./auth";

export const proxy = auth((req) => {
  if (!req.auth?.user) {
    const signIn = req.nextUrl.clone();
    signIn.pathname = "/login";
    signIn.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signIn);
  }
  if (req.auth.user.role !== "ADMIN") {
    return NextResponse.rewrite(new URL("/admin-forbidden", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
