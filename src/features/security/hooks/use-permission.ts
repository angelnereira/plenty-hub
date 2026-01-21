'use client';

import { useSession } from "next-auth/react";
import { hasPermission, Resource, Action, Role } from "@/lib/permissions";

export function usePermission() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role as Role;

    const can = (resource: Resource, action: Action) => {
        if (!userRole) return false;
        return hasPermission(userRole, resource, action);
    };

    return { can, role: userRole };
}
