# Arquitectura de Plenty Hub

Este documento describe la arquitectura de alto nivel de **Plenty Hub**, una plataforma SaaS multi-tenant para gestión empresarial.

## Visión General

Plenty Hub es una aplicación web moderna construida sobre **Next.js 16**. Adopta una arquitectura modular basada en características (`features/`) para mantener la escalabilidad.

## Modelo de Datos (Multi-tenancy)

El sistema implementa **Multi-tenancy** a nivel de aplicación (Lógica), compartiendo la misma base de datos pero aislando los datos mediante `tenant_id`.

### Entidades Principales (`src/lib/db/schema.ts`)

* **Tenants**: Representa a la organización/empresa suscriptora.
* **Users**: Usuarios del sistema. Pertenecen a un Tenant.
* **Customers**: Clientes finales del Tenant.
* **Products**: Catálogo de productos/servicios del Tenant.
* **Invoices**: Facturas emitidas por el Tenant a sus Customers.

**Regla de Oro**: Todas las consultas a la base de datos deben filtrar explícitamente por `tenantId` para evitar fugas de datos entre organizaciones.

## Autenticación y Autorización

* **NextAuth.js**: Maneja sesiones y JWT.
* **Roles**:
  * `admin`: Acceso total al dashboard del Tenant.
  * `billing`: Acceso limitado a Facturación (`/dashboard/invoices`).
  * `user`: Acceso básico de lectura.

## Frontend y UI

* **Server Components (RSC)**: Se encargan de la obtención de datos (Data Fetching) segura en el servidor.
* **Client Components**: Manejan la interactividad (formularios, gráficos, toggles).
* **Shadcn UI**: Sistema de diseño base, personalizable mediante Tailwind CSS.

## Estructura de Características (`features/`)

Para mantener el código organizado, seguimos un patrón de "Feature Slices":

```
src/features/
  billing/
    components/   # Componentes UI específicos de facturación
    services/     # Lógica de negocio (ej: cálculos de impuestos)
    utils/        # Helpers puros
  analytics/
    ...
```

## Flujo de Desarrollo con Agentes

Al solicitar cambios a agentes como Jules:

1. Especifica si el cambio afecta la lógica de servidor o cliente.
2. Si modificas el esquema de BD, recuerda mencionar la necesidad de migración.
3. Respeta la separación de carpetas por `feature`.
