import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, primaryKey, index } from 'drizzle-orm/pg-core';
import { type AdapterAccount } from 'next-auth/adapters';

export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logoUrl: text('logo_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    image: text("image"),
    passwordHash: text('password_hash'),
    role: text('role').default('user').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable("account", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
}, (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] })
]);

export const sessions = pgTable("session", {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [
    primaryKey({ columns: [vt.identifier, vt.token] })
]);

export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    usersId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    details: jsonb('details'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customers = pgTable('customers', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: text('name').notNull(),
    type: text('type').default('B2C').notNull(),
    clientType: text('client_type').default('02').notNull(), // 01=Contribuyente, 02=Consumidor Final, 04=Extranjero
    ruc: text('ruc'),
    dv: text('dv'),
    email: text('email'),
    phone: text('phone'),
    address: text('address'),
    version: integer('version').default(1).notNull(),
    clv: integer('clv').default(0),
    avgTicket: integer('avg_ticket').default(0),
    frequency: integer('frequency').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('customer_tenant_idx').on(table.tenantId),
    index('customer_ruc_idx').on(table.ruc)
]);

export const taxes = pgTable('taxes', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: text('name').notNull(),
    rate: integer('rate').notNull(), // Basis points (e.g. 700 = 7%)
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sku: text('sku'),
    price: integer('price').notNull(), // In cents
    stock: integer('stock').default(0).notNull(),
    taxId: uuid('tax_id').references(() => taxes.id),
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    customerId: uuid('customer_id').references(() => customers.id).notNull(),
    number: text('number').notNull(),
    status: text('status').default('draft').notNull(),
    issuedAt: timestamp('issued_at'),
    dueDate: timestamp('due_date'),
    subtotal: integer('subtotal').notNull(),
    taxTotal: integer('tax_total').notNull(),
    totalDiscount: integer('total_discount').default(0).notNull(),
    total: integer('total').notNull(),
    currency: text('currency').default('USD').notNull(),
    notes: text('notes'),
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('invoice_tenant_number_idx').on(table.tenantId, table.number),
    index('invoice_customer_date_idx').on(table.customerId, table.issuedAt)
]);

export const invoiceItems = pgTable('invoice_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
    productId: uuid('product_id').references(() => products.id),
    description: text('description').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: integer('unit_price').notNull(),
    discount: integer('discount').default(0).notNull(),
    total: integer('total').notNull(),
    taxRate: integer('tax_rate').default(0).notNull(),
    taxCode: text('tax_code').default('01').notNull(),
});
