import { NextResponse } from "next/server";
export function proxy(request: Request) {
  const headers = new Headers(request.headers);
  const pathname = new URL(request.url).pathname;
  headers.set("x-current-path", pathname);
  
  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|__nextjs_original-stack-frame).*)",
  ],
};
