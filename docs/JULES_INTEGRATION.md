# Integración de Google Jules

Este documento detalla los pasos para integrar y utilizar **Google Jules**, el Agente de Codificación Autónomo, en el proyecto Plenty Hub.

## 1. Instalación y Configuración

Dado que Jules funciona como una aplicación de GitHub, cada colaborador (o el administrador del repositorio) debe instalarla.

1. Visita **[jules.google](https://jules.google/)**.
2. Inicia sesión con tu cuenta de Google/GitHub.
3. Sigue el flujo para instalar la App de Jules en la organización o cuenta personal donde reside este repositorio (`plenty-hub`).
4. Concede acceso al repositorio `plenty-hub`.

## 2. Cómo Asignar Tareas a Jules

Una vez instalado, puedes interactuar con Jules de dos formas principales:

### A. A través de Issues (Recomendado)

Crea un nuevo Issue en GitHub y añade la etiqueta (label) **`jules`**.

* **Título**: Sé descriptivo con la tarea (ej: "Refactorizar componente de Login", "Crear endpoint de API para Clientes").
* **Descripción**: Provee detalles claros. Jules leerá el contexto del repositorio, pero cuanto más específica sea la instrucción, mejor. Referencia archivos específicos si es posible.

### B. Interfaz Web de Jules

Desde el dashboard en `jules.google`, puedes seleccionar el repositorio y escribir un prompt directamente para que el agente inicie el trabajo.

## 3. Flujo de Trabajo

1. **Planificación**: Jules analizará el código y propondrá un plan de implementación.
2. **Pull Request**: Una vez aprobado el plan (o automáticamente, según configuración), Jules generará un Pull Request (PR) con los cambios.
3. **Revisión**: Un humano debe revisar el PR. Jules suele incluir explicaciones detalladas y pruebas.
4. **Merge**: Si todo es correcto, fusiona el PR como lo harías con cualquier otro colaborador.

## 4. Recursos Adicionales

* [Documentación de Arquitectura](./ARCHITECTURE.md): Referencia útil para entender la estructura del proyecto.
* [Guía de Contribución](../CONTRIBUTING.md): Estándares de código que Jules intentará seguir.
