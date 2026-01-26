# Guía de Contribución para Plenty Hub

¡Gracias por contribuir a **Plenty Hub**! Esta guía establece los estándares y flujos de trabajo recomendados para desarrolladores humanos y agentes autónomos (Google Jules).

## Stack Tecnológico

Asegúrate de que tu código sea compatible con las siguientes tecnologías clave:

* **Framework**: Next.js 16 (App Router)
* **Lenguaje**: TypeScript
* **Base de Datos**: PostgreSQL
* **ORM**: Drizzle ORM
* **Estilos**: Tailwind CSS 4
* **UI Components**: Shadcn UI (basado en Radix UI) / Lucide React
* **Autenticación**: NextAuth.js (Beta)

## Estilo de Código

### TypeScript

* Usa **tipado estricto**. Evita `any` siempre que sea posible.
* Define interfaces para props de componentes y estructuras de datos.

### Componentes React

* Usa **Componentes Funcionales** y Hooks.
* Prefiere **Server Components** por defecto. Usa `'use client'` solo cuando sea necesario (interactividad, estado, efectos).
* Nombrado de archivos: `kebab-case.tsx` (ej: `invoice-list.tsx`).

### Estilos (Tailwind CSS)

* Utiliza clases de utilidad de Tailwind directamente en JSX.
* Usa variables CSS para colores temáticos (ej: `bg-background`, `text-primary`) para soportar modo oscuro/claro y temas personalizados.

### Base de Datos (Drizzle)

* Define esquemas en `src/lib/db/schema.ts`.
* Usa migraciones (`drizzle-kit`) para cambios en la BD.
* Queries: Prefiere la API relacional de Drizzle (`db.query...`) para lecturas simples.

## Estructura de Directorios

* `src/app`: Rutas del App Router (páginas y layouts).
* `src/lib`: Utilidades compartidas, configuración de DB y Auth.
* `src/features`: Código organizado por dominio (Billing, Analytics, Customers), incluyendo componentes y lógica específica.
* `src/components`: Componentes UI genéricos/reutilizables (botones, inputs).
