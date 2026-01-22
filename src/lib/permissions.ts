export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Resource = 'invoices' | 'customers' | 'products' | 'users' | 'reports';

export type Role = 'admin' | 'manager' | 'user' | 'viewer' | 'billing';

export const ROLE_PERMISSIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
    admin: {
        invoices: ['create', 'read', 'update', 'delete', 'manage'],
        customers: ['create', 'read', 'update', 'delete', 'manage'],
        products: ['create', 'read', 'update', 'delete', 'manage'],
        users: ['create', 'read', 'update', 'delete', 'manage'],
        reports: ['read', 'manage']
    },
    manager: {
        invoices: ['create', 'read', 'update', 'manage'],
        customers: ['create', 'read', 'update', 'manage'],
        products: ['create', 'read', 'update', 'manage'],
        reports: ['read']
    },
    user: {
        invoices: ['create', 'read', 'update'],
        customers: ['create', 'read', 'update'],
        products: ['read'],
    },
    billing: {
        invoices: ['create', 'read', 'update', 'delete', 'manage'],
        customers: ['read'], // Needs access to select customers for invoice
        products: ['read'],  // Needs access to select products
    },
    viewer: {
        invoices: ['read'],
        customers: ['read'],
        products: ['read'],
    }
};

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
    const permissions = ROLE_PERMISSIONS[role]?.[resource];
    if (!permissions) return false;
    return permissions.includes(action) || permissions.includes('manage');
}
