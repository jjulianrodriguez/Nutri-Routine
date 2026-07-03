Antes de comenzar:

Lee AGENTS.md, las skills relevantes y el contrato técnico.

Objetivo
========

Construir el sistema oficial de Inputs del proyecto.

No debe existir más de una implementación oficial de Input.

Consolida toda la infraestructura para:

- Input
- PasswordInput
- NumberInput
- EmailInput
- SearchInput base (la lógica avanzada vendrá después)

Todos deben compartir:

- tokens
- tamaños
- estados
- disabled
- focus
- invalid
- readonly
- loading cuando aplique

Busca por toda la aplicación:

- inputs nativos
- clases repetidas
- inputClasses
- implementaciones locales
- inputs de auth
- inputs de app

Migra únicamente los casos compatibles.

No cambies comportamiento.

No implementes todavía FormField.

No implementes todavía SearchField completo.

Al finalizar:

- verifica que no existan inputs duplicados
- resume los archivos migrados
- documenta excepciones























Antes de comenzar:

Lee AGENTS.md y toda la documentación creada en fases anteriores.

Objetivo
========

Crear el componente oficial Select del Design System.

Actualmente existen múltiples selects con clases locales.

Todo debe converger hacia un único componente reutilizable.

Debe soportar:

- label
- placeholder
- disabled
- invalid
- helper
- error
- tamaños
- variantes
- icono
- keyboard navigation
- accesibilidad

Busca todas las implementaciones de:

<select>

y todas las constantes tipo:

selectClasses

Migra únicamente los casos compatibles.

No cambies comportamiento.

No cambies lógica de negocio.

No cambies formularios complejos todavía.

Al finalizar:

- resume todos los selects migrados
- documenta los casos especiales


























Antes de comenzar:

Lee AGENTS.md, las skills y el contrato técnico.

Objetivo
========

Construir el componente oficial Textarea.

Actualmente existen múltiples textareas con clases locales.

Todo debe reutilizar una única primitive.

Debe soportar:

- resize
- autoResize cuando aplique
- helper
- error
- disabled
- readonly
- tamaños
- variantes

Busca:

<textarea>

y

textareaClasses

Migra únicamente los casos compatibles.

No cambies comportamiento.

No implementes todavía FormField.

Al finalizar:

- verifica consistencia
- resume la migración





























Antes de comenzar:

Lee AGENTS.md y toda la documentación previa.

Objetivo
========

Crear el sistema oficial para controles booleanos.

Debe existir una infraestructura común para:

- Checkbox
- Radio
- Switch

Todos deben compartir:

- estados
- tamaños
- tokens
- focus
- disabled
- invalid
- accesibilidad

Busca implementaciones repetidas.

Migra únicamente las compatibles.

No modifiques lógica de negocio.

No cambies formularios complejos.

Al finalizar:

- resume los componentes creados
- documenta casos pendientes





























Antes de comenzar:

Lee AGENTS.md, las skills y el contrato técnico.

Objetivo
========

Construir toda la infraestructura oficial de formularios.

A partir de esta fase NO deberían existir implementaciones locales de:

FieldError

FieldHint

FieldLabel

RequiredIndicator

FormAlert

FieldGroup

Debe existir una arquitectura clara basada en:

FormField

que componga:

- Label
- Control
- Error
- Hint
- RequiredIndicator

Busca por toda la aplicación:

- FieldError locales
- mensajes de error repetidos
- labels duplicadas
- helpers duplicados

Migra únicamente los casos compatibles.

No cambies validaciones.

No cambies server actions.

No cambies lógica RHF.

No cambies comportamiento.

Al finalizar:

- resume todas las implementaciones eliminadas
- documenta los formularios pendientes






























Antes de comenzar:

Lee AGENTS.md y las fases anteriores.

Objetivo
========

Crear el componente oficial SearchField.

No debe ser solamente un Input con placeholder.

Debe servir como infraestructura para todos los buscadores del sistema.

Debe soportar:

- icono
- clear button
- loading
- debounce opcional
- disabled
- tamaños
- variantes
- accesibilidad

Busca buscadores repetidos en:

- clientes
- recursos
- ejercicios
- entrenamiento
- nutrición
- progreso
- cualquier otro módulo

Migra únicamente los casos seguros.

No cambies la lógica de búsqueda.

No cambies filtros.

No cambies URLs.

Solo unifica la infraestructura visual y de composición.

Al finalizar:

- resume todos los buscadores migrados
- documenta excepciones


























Objetivo:

Separar oficialmente IconButton de Button.

Actualmente existen muchos botones icon-only implementados manualmente.

Crear un componente reutilizable.

Debe soportar:

- tooltip opcional
- loading
- destructive
- ghost
- outline
- tamaños

No migrar todavía.

Entrega:

- API


























Objetivo:

Auditar que las nuevas primitives creadas durante la Fase 3 sean compatibles con toda la aplicación.

No modificar nada.

Revisar:

- Button
- Input
- PasswordInput
- SearchInput
- Select
- Textarea
- Checkbox
- Switch
- IconButton

Detectar:

- posibles regresiones
- componentes incompatibles
- imports futuros
- casos especiales

Generar un reporte indicando:

- qué módulos podrán migrarse directamente
- cuáles necesitarán adaptadores
- cuáles deberán esperar fases posteriores



















Objetivo

Migrar todos los formularios pequeños y medianos para utilizar exclusivamente el nuevo sistema de formularios del Design System.

Objetivos específicos

- Reemplazar todos los FieldError locales.
- Eliminar todas las implementaciones locales de:
  - selectClasses
  - textareaClasses
  - inputClasses
- Sustituirlos por:
  - FormField
  - FieldLabel
  - FieldHint
  - FieldError
  - FormAlert
  - Input
  - Select
  - Textarea
  - SearchField
- Mantener exactamente el mismo comportamiento funcional.
- No modificar server actions.
- No modificar validaciones.
- No modificar lógica RHF.
- No cambiar nombres de props públicas.

Prioridad

Migrar primero:

- Perfil
- Configuración
- Cuenta
- Login
- Registro
- Recuperación

Luego:

- Ejercicios
- Rutinas
- Plantillas
- Nutrición
- Recursos

No tocar todavía:

- ResourceManager
- CalendarManager
- BlogRichTextEditor

Al finalizar

Entregar un reporte indicando:

- formularios migrados
- formularios pendientes
- FieldError eliminados
- clases locales eliminadas
- comportamiento preservado


























Objetivo

Eliminar todas las implementaciones locales de navegación secundaria.

Migrar completamente al nuevo componente SectionTabs.

Debe reemplazar:

- TrainingSectionNav
- NutritionSectionNav
- navegación de Perfil
- navegación de Configuración
- tabs de Progreso
- tabs de Notificaciones
- cualquier navegación horizontal equivalente

Restricciones

- No cambiar rutas.
- No cambiar comportamiento.
- No cambiar permisos.
- Solo cambiar infraestructura visual.

Eliminar componentes duplicados cuando ya no sean utilizados.

Entregar un reporte indicando:

- componentes eliminados
- componentes migrados
- imports simplificados























Objetivo

Migrar toda la aplicación para utilizar únicamente los nuevos componentes oficiales de estados.

Debe reemplazar:

- EmptyState locales
- ErrorState locales
- LoadingState locales
- Skeletons personalizados

Utilizar exclusivamente:

- EmptyState
- ErrorState
- StateBlock
- SkeletonBlock
- LoadingState

No modificar:

- lógica
- fetch
- server actions

Solo presentación.

Entregar un resumen de:

- estados eliminados
- estados unificados

























Objetivo

Refactorizar ResourceManager.

Actualmente concentra demasiadas responsabilidades.

Debe dividirse sin modificar comportamiento.

Crear la siguiente arquitectura:

resources/

- ResourceManager
- ResourceList
- ResourceCard
- ResourceFilters
- ResourceUploadForm
- ExternalResourceForm
- FolderManager
- FolderCard
- ResourcePreview
- hooks/
    useResourceFilters
    useResourceMutations
    useFolderOperations

Restricciones

- No cambiar UI.
- No cambiar rutas.
- No cambiar comportamiento.
- No introducir regresiones.

Objetivo final

Ningún archivo debe superar aproximadamente 500 líneas salvo justificación técnica.

Entregar:

- árbol nuevo
- archivos creados
- responsabilidades de cada uno




























Objetivo

Dividir CalendarManager.

Separar completamente:

- CalendarGrid
- EventFormDialog
- UpcomingEventList
- CalendarFilters
- CalendarToolbar
- EventCard
- hooks

No modificar:

- comportamiento
- lógica
- permisos
- UX

Mantener exactamente el mismo resultado visual.

Reducir el archivo principal al mínimo.

Entregar reporte.























Objetivo

Dividir completamente BlogRichTextEditor.

Crear componentes independientes para:

- EditorToolbar
- FloatingToolbar
- LinkPopover
- ImagePopover
- ColorPicker
- MediaMenu
- EditorCanvas
- PreviewPanel

Extraer además hooks:

- useFloatingToolbar
- useSelectionState
- useEditorCommands

No modificar experiencia de usuario.

No cambiar funcionalidades.

Mantener compatibilidad total.

Entregar árbol nuevo.

























Objetivo

Separar ProgressDashboard.

Crear:

- ProgressTabs
- ProgressMetricGrid
- ProgressCharts
- ProgressClientSelector
- ProgressSummary
- ProgressEmptyState
- hooks

Reducir el componente principal únicamente a composición.

No modificar comportamiento.

Entregar resumen.























Objetivo

Separar HabitTracker.

Actualmente mezcla:

- biblioteca
- asignaciones
- tracking
- formularios
- tablas

Crear componentes independientes.

Extraer hooks.

Mantener API pública.

No modificar UX.

Entregar árbol final.

























Objetivo

Reorganizar completamente src/components siguiendo la arquitectura aprobada.

La estructura objetivo es:

src/components/

ui/

- actions
- forms
- navigation
- overlays
- feedback
- surfaces
- data-display
- utilities
- typography

app/

layouts/

shared/

domains/

clients

training

nutrition

resources

calendar

messaging

blog

progress

settings

profile

auth/

marketing/

Restricciones

NO cambiar comportamiento.

NO renombrar componentes públicos salvo que sea necesario.

Actualizar automáticamente todos los imports.

Eliminar carpetas vacías.

Eliminar duplicados.

Entregar:

- árbol final
- componentes movidos
- componentes eliminados






















Objetivo

Realizar una limpieza completa del proyecto.

Buscar y eliminar:

- componentes muertos
- imports muertos
- helpers sin uso
- hooks sin uso
- tipos sin uso
- constantes sin uso
- estilos sin uso
- variantes antiguas

No eliminar nada utilizado.

Mantener compatibilidad completa.

Entregar un listado de todo lo eliminado.












Objetivo

Realizar una validación completa del proyecto después del refactor.

Ejecutar únicamente verificaciones, sin modificar arquitectura.

Verificar:

- TypeScript sin errores.
- ESLint sin errores.
- Build de producción.
- Imports rotos.
- Exportaciones duplicadas.
- Componentes huérfanos.
- Rutas rotas.
- Barrel exports consistentes.
- Dependencias circulares.
- Accesibilidad básica (focus, aria, keyboard navigation).

Corregir únicamente errores detectados por estas verificaciones.

No introducir nuevas funcionalidades.

No reorganizar carpetas.

Entregar:

- errores encontrados
- errores corregidos
- problemas pendientes (si existen)
- confirmación de que el proyecto compila correctamente.











Objetivo

Realizar una auditoría completa de todo el proyecto después del refactor.

Verificar:

- ningún formulario usa componentes antiguos
- ningún FieldError local permanece
- no existen selectClasses locales
- no existen textareaClasses locales
- no existen inputClasses locales
- no existen window.confirm
- todos los diálogos usan AppDialog o ConfirmDialog
- todas las acciones usan AppDropdownMenu cuando corresponde
- todas las páginas usan layouts oficiales
- todos los estados usan StateBlock
- todos los badges usan StatusBadge
- toda navegación secundaria usa SectionTabs

Generar un reporte indicando:

✅ completamente migrado

⚠️ pendiente

❌ inconsistente

No modificar código.

























Objetivo

Realizar la auditoría arquitectónica final del proyecto.

Evaluar:

- separación de responsabilidades
- cohesión
- acoplamiento
- reutilización
- tamaño de componentes
- reutilización de hooks
- reutilización de helpers
- organización por dominios
- cumplimiento del Design System
- cumplimiento de Next.js Best Practices
- cumplimiento de Web Interface Guidelines
- escalabilidad a largo plazo

Buscar cualquier nueva duplicación introducida durante el refactor.

No modificar archivos.

Entregar un documento con:

- fortalezas
- debilidades
- riesgos futuros
- mejoras opcionales
- valoración global de la arquitectura (0–10)
- valoración del Design System (0–10)
- valoración de mantenibilidad (0–10)
- valoración de escalabilidad (0–10)
- recomendación final sobre si el proyecto está listo para una versión 1.0.