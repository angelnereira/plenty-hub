import type { NextAuthConfig } from "next-auth";
import { hasPermission, Role } from "./permissions";

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role as Role;
            const pathname = nextUrl.pathname;

            // Define protected paths
            const isOnDashboard = pathname.startsWith('/dashboard');
            const isOnAdmin = pathname.startsWith('/admin');
            const isOnBillingManage = pathname.startsWith('/billing/manage');

            // Check protection for these paths
            if (isOnDashboard || isOnAdmin || isOnBillingManage) {
                if (isLoggedIn) {
                   // RBAC Checks
                   if (isOnAdmin && userRole !== 'admin') {
                       // Rewrite to 403 or redirect? Redirect is safer for now.
                       // Note: authorized callback return value: true = allow, false = redirect to login, Response = use that response.
                       return Response.redirect(new URL('/403', nextUrl));
                   }
                   if (isOnBillingManage && !hasPermission(userRole, 'invoices', 'manage')) {
                        return Response.redirect(new URL('/403', nextUrl));
                   }
                   return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && pathname === '/login') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            // Allow access to Hero (/) and other public pages
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
