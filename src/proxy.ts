import { auth } from "@/lib/auth";
import { hasPermission, Resource, Action, Role } from "@/lib/permissions";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role as Role;
    const { pathname } = req.nextUrl;

    // Basic protection: all routes except auth-related require login
    if (!isLoggedIn && !pathname.startsWith('/api/auth') && pathname !== '/login') {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Example RBAC protection: /admin requires admin role
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.rewrite(url);
    }

    // Feature-based protection examples
    if (pathname.startsWith('/billing/manage') && !hasPermission(userRole, 'invoices', 'manage')) {
        const url = req.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.rewrite(url);
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
