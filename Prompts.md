
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
- recomendación final sobre si el proyecto está listo para una versión 1.0.}




























Antes de comenzar:

Lee AGENTS.md, todas las skills relevantes y toda la documentación generada durante el refactor.

Lee también el contrato técnico y el roadmap de refactorización.

NO modifiques ningún archivo.

NO escribas código.

NO ejecutes scripts de corrección.

Esta es una auditoría exclusivamente de verificación.

Objetivo

Verificar que cada fase del roadmap de refactorización realmente se haya ejecutado como fue solicitada.

No evaluar si la arquitectura "podría ser mejor".

No proponer nuevos refactors.

No inventar mejoras.

El objetivo es comprobar si el trabajo solicitado en cada prompt fue realmente realizado.

Debes comparar el estado actual del proyecto contra los objetivos definidos para cada fase.

Qué debes verificar
Fase 3 — Primitives del Design System

Verificar que realmente existan y funcionen:

Button
IconButton
LinkButton (si estaba planificado)
Input
PasswordInput
NumberInput
EmailInput
SearchInput base
Select
Textarea
Checkbox
Radio
Switch

Comprobar además que:

usan la misma infraestructura
usan los mismos tokens
comparten tamaños
comparten variantes
comparten estados
comparten accesibilidad

Verificar que las implementaciones locales realmente hayan sido migradas cuando el prompt así lo pedía.

Fase 4 — Sistema de Formularios

Verificar que exista realmente:

FormField
FieldLabel
FieldError
FieldHint
RequiredIndicator
FormAlert
FieldGroup

Comprobar que:

los FieldError locales hayan desaparecido
las clases locales de inputs hayan sido eliminadas
los formularios migrados realmente utilicen la infraestructura nueva
Fase 5 — Migración de Formularios

Verificar que los formularios pequeños y medianos realmente hayan sido migrados.

Especialmente revisar:

Perfil
Configuración
Cuenta
Login
Registro
Recuperación
Ejercicios
Rutinas
Plantillas
Nutrición
Recursos

Confirmar que:

no quedó infraestructura antigua
no aparecieron duplicaciones nuevas
no se modificó el comportamiento funcional
Fase 6 — Navegación Secundaria

Verificar que SectionTabs realmente reemplazó:

TrainingSectionNav
NutritionSectionNav
navegación de Perfil
navegación de Configuración
tabs de Progreso
tabs de Notificaciones
equivalentes

Comprobar que los componentes antiguos fueron eliminados cuando correspondía.

Fase 7 — Estados Compartidos

Verificar que realmente exista un sistema oficial para:

EmptyState
ErrorState
LoadingState
SkeletonBlock
StateBlock

Comprobar que los estados locales hayan sido reemplazados donde el roadmap lo indicaba.

Fase 8 — Managers Grandes

Verificar individualmente:

ResourceManager
CalendarManager
BlogRichTextEditor
ProgressDashboard
HabitTracker

Comprobar que:

fueron divididos
las responsabilidades fueron separadas
los hooks fueron extraídos
el archivo principal quedó reducido
no cambió el comportamiento
Fase 9 — Organización

Verificar que:

la estructura final de carpetas coincida con la arquitectura aprobada
los imports hayan sido actualizados
no existan duplicados producto de la reorganización
los componentes estén ubicados en el dominio correcto
Fase 10 — Limpieza

Verificar que realmente se eliminaron:

componentes muertos
helpers muertos
hooks muertos
imports muertos
variantes antiguas
constantes sin uso

Confirmar que no se eliminaron elementos todavía utilizados.

Qué NO debes hacer

No propongas nuevas mejoras.

No rediseñes la arquitectura.

No sugieras nuevos componentes.

No critiques decisiones del roadmap.

No propongas nuevas fases.

No generes código.

No modifiques archivos.

Esta auditoría es únicamente para verificar el cumplimiento del trabajo solicitado.

Entrega

Genera un informe organizado por fases.

Para cada fase incluye:

Estado
✅ Completamente cumplida
⚠️ Parcialmente cumplida
❌ No cumplida
Evidencia

Lista los componentes, archivos o cambios que demuestran el cumplimiento (o incumplimiento).

Desviaciones

Describe exactamente qué objetivos del prompt original no se cumplieron.

No menciones mejoras futuras; solo diferencias respecto al contrato.

Riesgo

Clasifica el impacto de las desviaciones:

Bajo
Medio
Alto
Crítico
Resumen Final

Incluye una tabla como esta:

Fase	Estado	Cumplimiento
Fase 3	✅	100%
Fase 4	⚠️	85%
Fase 5	✅	100%
...	...	...

Después indica:

Porcentaje total de cumplimiento del roadmap.
Fases que requieren retrabajo.
Componentes que quedaron pendientes respecto al plan original.
Confirmación de si el proyecto cumple o no con el roadmap acordado.

Importante: evalúa únicamente el cumplimiento de los prompts originales. No penalices decisiones de diseño distintas si cumplen el objetivo solicitado. No conviertas esta auditoría en una nueva revisión arquitectónica.