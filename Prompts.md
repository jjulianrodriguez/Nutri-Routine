# Prompt 1: Corregir modelo de roles y permisos de profesionales

TAREA:
Corregir el modelo de cuentas profesionales y permisos para separar correctamente `admin`, `professional` y `client`.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero solo debes crear o modificar lo necesario.

PROBLEMA:
Actualmente las cuentas profesionales se crean con `profiles.role = 'admin'` y su especialidad en `professional_profiles`. Esto hace que profesionales de nutrición/entrenamiento hereden permisos globales de administrador.

OBJETIVO:
Separar correctamente:

* `admin`: administrador universal.
* `professional`: profesional con especialidad.
* `client`: cliente final.

REQUISITOS:

* Identificar toda la lógica que crea cuentas profesionales.
* Cambiar la creación para que las cuentas profesionales usen `profiles.role = 'professional'`.
* Mantener `professional_profiles.specialty` como fuente de especialidad:

  * `nutrition`
  * `training`
  * `both`
* El administrador universal debe seguir siendo `profiles.role = 'admin'` y no debe depender de `professional_profiles`.
* Migrar/corregir cuentas profesionales existentes que tengan `role = 'admin'` y fila en `professional_profiles`, cambiándolas a `role = 'professional'` de forma segura.
* Revisar y corregir permisos en:

  * server actions
  * helpers de acceso
  * middleware/layout privado
  * RLS
  * rutas administrativas
  * blog
  * recursos
  * clientes
  * ejercicios
  * rutinas
  * asignaciones
* Profesionales de nutrición solo pueden gestionar nutrición y clientes asignados en nutrición.
* Profesionales de entrenamiento solo pueden gestionar entrenamiento y clientes asignados en entrenamiento.
* Profesionales `both` pueden gestionar ambas áreas, pero no deben ser administradores universales.
* Solo el admin universal puede crear cuentas profesionales.
* Solo el admin universal puede gestionar áreas globales como administración completa de blog/recursos si ese es el patrón del proyecto.

SUPABASE:

* Si hay que modificar RLS, hacerlo con migraciones seguras.
* No hacer reset de Supabase.
* No borrar usuarios.
* No borrar tablas.
* No exponer `SUPABASE_SERVICE_ROLE_KEY`.
* Usar service role solo en servidor si ya existe ese patrón.

VERIFICACIÓN:

* Confirmar que un profesional ya no pasa validaciones globales de admin.
* Confirmar que admin universal conserva acceso total.
* Confirmar que clientes no obtienen permisos extra.
* Confirmar que las cuentas profesionales existentes quedan corregidas.

ENTREGA:
Resume:

* causa encontrada
* archivos modificados
* cambios SQL/RLS/migraciones
* cómo quedó definido admin universal vs professional
* cuentas existentes corregidas
* pruebas/verificaciones realizadas
























# Prompt 3: Hacer historial de rutinas inmutable con snapshots

TAREA:
Crear una estrategia de snapshots para que el historial de rutinas conserve la rutina original asignada al cliente.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero solo debes crear o modificar lo necesario.

PROBLEMA:
Actualmente el historial de rutinas depende de la versión actual de la rutina. Si una rutina se edita, se elimina o cambian sus ejercicios, el historial del cliente puede perder o alterar la información original.

OBJETIVO:
Cuando se asigna una rutina a un cliente, guardar una copia histórica de la rutina y sus ejercicios para que el historial sea inmutable.

REQUISITOS:

* Revisar cómo funciona actualmente `workout_plans`, `routines`, `routine_exercises` y asignaciones.
* Definir e implementar la estrategia más segura:

  * snapshot JSONB en `workout_plans`, o
  * tabla separada tipo `workout_plan_exercise_snapshots`, si encaja mejor.
* El snapshot debe guardar como mínimo:

  * nombre de rutina al momento de asignación
  * descripción
  * dificultad
  * categoría
  * público objetivo
  * ejercicios
  * nombre de cada ejercicio
  * grupo muscular
  * tipo/categoría
  * series
  * repeticiones
  * descanso
  * duración si existe
  * notas
  * orden
* Al asignar una rutina nueva, crear el snapshot automáticamente.
* El historial del cliente debe leer primero desde el snapshot, no desde la rutina viva.
* Si la rutina original se edita después, el historial no debe cambiar.
* Si la rutina original se elimina, el historial debe seguir mostrando el snapshot.
* Si hay asignaciones antiguas sin snapshot, hacer backfill seguro usando la rutina actual cuando sea posible.
* Si no se puede reconstruir una asignación antigua, mostrar “Información histórica no disponible” sin romper la vista.

SUPABASE:

* Crear migración segura si hace falta.
* No resetear Supabase.
* No borrar asignaciones históricas.
* No eliminar rutinas existentes como parte de esta tarea.
* Ajustar RLS para que el cliente solo vea sus propios snapshots y profesionales/admins vean según permisos.

UI:

* En historial y detalle histórico, mostrar los datos del snapshot.
* Marcar claramente si la rutina está histórica, vencida o archivada.
* No rediseñar todo el módulo.

ENTREGA:
Resume:

* estrategia de snapshot usada
* tablas/columnas creadas
* archivos modificados
* backfill realizado o pendiente
* cómo se muestra una rutina histórica aunque la original cambie o se elimine
























# Prompt 4: Unificar datos personales del cliente

TAREA:
Unificar la fuente de datos personales del cliente usando `profile_personal_details`.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero solo debes crear o modificar lo necesario.

PROBLEMA:
Configuración guarda datos personales en `profile_personal_details`, pero el detalle administrativo del cliente sigue leyendo campos antiguos desde `client_profiles`. Esto crea dos fuentes de verdad.

OBJETIVO:
Hacer que `profile_personal_details` sea la fuente principal para la información personal opcional del usuario.

REQUISITOS:

* Revisar dónde se leen datos personales del cliente.
* Actualizar `/app/clientes/[id]` y cualquier perfil administrativo para leer desde `profile_personal_details`.
* Mostrar, si existen:

  * teléfono
  * fecha de nacimiento
  * género
  * peso
  * altura
  * enfermedades/condiciones médicas
* No mostrar datos médicos en listados generales.
* Mostrar datos sensibles solo en vistas autorizadas.
* El usuario debe seguir pudiendo editar sus datos desde Configuración.
* Profesionales asignados pueden ver datos del cliente solo si las políticas actuales lo permiten.
* Clientes no pueden ver datos de otros clientes.
* Admin universal puede ver perfiles según reglas globales.
* Si hay datos antiguos en `client_profiles`, migrarlos o copiarlos hacia `profile_personal_details` solo si el campo nuevo está vacío.
* No borrar columnas antiguas todavía; dejarlas sin uso o documentarlas como legacy.
* Evitar duplicar escritura futura en ambas tablas.

SUPABASE:

* Si hace falta migración, hacerla segura.
* No borrar datos.
* No hacer reset.
* Revisar RLS para `profile_personal_details`.

UI:

* Actualizar textos para que se vean profesionales y no técnicos.
* Si un dato no existe, mostrar “No indicado” o equivalente.
* Mantener diseño actual.

ENTREGA:
Resume:

* fuente de datos final
* archivos modificados
* migración/backfill si hubo
* datos personales ahora visibles en perfil administrativo
* columnas legacy detectadas
* pendientes


















# Prompt 7: Mejorar gestión de profesionales

TAREA:
Completar la gestión administrativa de profesionales.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero solo debes crear o modificar lo necesario.

DEPENDENCIA:
Antes de implementar, verifica el modelo actual de roles. Si todavía existen profesionales con `profiles.role = 'admin'`, no amplíes permisos sobre ese modelo sin corregir o respetar la separación entre admin universal y professional.

OBJETIVO:
Permitir que el administrador universal pueda gestionar cuentas profesionales después de crearlas.

REQUISITOS:

* En la sección de profesionales, permitir:

  * listar profesionales
  * ver detalle
  * editar nombre/datos básicos permitidos
  * cambiar especialidad
  * activar/desactivar profesional
  * eliminar profesional solo si es seguro
* Especialidades:

  * nutrición
  * entrenamiento
  * ambos
* Si se cambia la especialidad de un profesional:

  * actualizar permisos efectivos
  * revisar asignaciones existentes
  * evitar dejar clientes en estado inconsistente
* Si se desactiva un profesional:

  * no debe poder iniciar/usar funcionalidades profesionales
  * debe quedar claro en la UI
  * no debe eliminar sus asignaciones automáticamente salvo que el flujo lo indique
* Si se elimina un profesional:

  * validar que no tenga clientes asignados o manejar reasignación/desasignación de forma segura
  * nunca dejar clientes con referencias rotas
* Solo admin universal puede gestionar profesionales.
* Un profesional no puede editar su propia especialidad ni elevar permisos.
* Clientes no pueden acceder a esta sección.

SUPABASE:

* Reutilizar `profiles` y `professional_profiles`.
* Agregar campos mínimos si hacen falta, por ejemplo `is_active`.
* Ajustar RLS/actions si se ocupa.
* No resetear Supabase.
* No borrar usuarios de Auth sin flujo seguro.

UI:

* Mantener diseño actual.
* Agregar acciones con menú o botones existentes.
* Usar modal de confirmación para acciones destructivas.
* Mostrar estado activo/inactivo.

ENTREGA:
Resume:

* funcionalidades agregadas
* archivos modificados
* cambios SQL/RLS si hubo
* cómo se manejan especialidad, desactivación y eliminación
* casos bloqueados por seguridad





















# Prompt 8: Manejar rutinas con ejercicios desactivados

TAREA:
Corregir el manejo de rutinas que contienen ejercicios desactivados.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero solo debes crear o modificar lo necesario.

PROBLEMA:
Si una rutina contiene un ejercicio desactivado, el editor puede fallar o mostrarlo de forma confusa porque solo carga ejercicios activos como opciones.

OBJETIVO:
Permitir editar rutinas existentes aunque contengan ejercicios desactivados, sin romper el guardado ni ocultar información importante.

REQUISITOS:

* Revisar carga de datos en:

  * listado de rutinas
  * detalle de rutina
  * editor de rutina
  * RPC/action de guardado
* En el editor, mostrar ejercicios desactivados que ya pertenecen a la rutina.
* Marcar esos ejercicios con una etiqueta clara:

  * “Desactivado”
  * “No disponible para nuevas rutinas”
* Permitir conservar un ejercicio desactivado si ya estaba en la rutina.
* Permitir quitarlo o reemplazarlo.
* No permitir agregar ejercicios desactivados nuevos a una rutina.
* El guardado no debe fallar si el ejercicio desactivado ya pertenecía a esa rutina y no se está agregando como nuevo.
* Si una rutina tiene ejercicios desactivados, mostrar advertencia clara pero no bloquear innecesariamente.
* Mejorar mensajes de error si el guardado falla por ejercicios inválidos.

SUPABASE:

* Revisar RPC `save_routine` o acciones equivalentes.
* Ajustar validación para distinguir:

  * ejercicio activo nuevo
  * ejercicio desactivado ya existente en la rutina
  * ejercicio inexistente/eliminado
* No resetear Supabase.
* No reactivar ejercicios automáticamente.
* No borrar ejercicios.

UI:

* Mantener diseño actual.
* En select/lista de ejercicios, separar o marcar activos/desactivados cuando aplique.
* Evitar textos técnicos.
* No rediseñar todo el constructor.

ENTREGA:
Resume:

* causa del fallo
* archivos modificados
* cambios en RPC/actions si hubo
* comportamiento nuevo para ejercicios desactivados
* casos que ahora se permiten y casos que se bloquean



















# Prompt 9: Garantizar una sola rutina activa por cliente

TAREA:
Garantizar a nivel de aplicación y base de datos que un cliente no tenga más de una rutina activa al mismo tiempo.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero solo debes crear o modificar lo necesario.

PROBLEMA:
El flujo normal intenta manejar una sola rutina activa por cliente, pero no hay garantía fuerte en base de datos. Si alguien escribe fuera del RPC, podrían existir varias asignaciones activas.

OBJETIVO:
Asegurar que cada cliente tenga como máximo una asignación activa de rutina.

REQUISITOS:

* Revisar `workout_plans`, RPC `assign_routine_to_client`, acciones de asignación, desasignación y reemplazo.
* Definir claramente qué significa “activa”:

  * `status = 'active'`
  * no archivada
  * no vencida, si aplica
* Antes de crear la restricción, revisar si ya existen duplicados activos.
* Si existen duplicados:

  * no borrar datos
  * proponer o aplicar una estrategia segura: archivar las anteriores y conservar la más reciente, si el patrón del proyecto lo permite
* Agregar garantía en Supabase, preferiblemente:

  * índice único parcial por `client_id` para asignaciones activas
  * o constraint equivalente compatible con el esquema actual
* Actualizar el RPC/action para que al asignar una nueva rutina:

  * archive o cierre la activa anterior
  * cree la nueva asignación
  * todo ocurra de forma transaccional
* Desasignar debe archivar/cerrar correctamente la asignación activa.
* Si una rutina está vencida por fecha, definir si debe seguir con `status = 'active'` o pasar a `expired/archived`.
* Evitar estados contradictorios: activa pero vencida sin explicación.

SUPABASE:

* Crear migración segura.
* No resetear Supabase.
* No borrar historial.
* No romper rutinas históricas.
* Ajustar RLS si hace falta.

UI:

* Mostrar una sola rutina actual.
* Mostrar anteriores en historial.
* Si se intenta asignar otra rutina, usar confirmación de reemplazo.
* Mostrar mensajes claros si hay conflicto.

ENTREGA:
Resume:

* definición final de rutina activa
* duplicados detectados y cómo se manejaron
* cambios SQL/RLS/RPC
* archivos modificados
* cómo se garantiza una sola rutina activa
* pruebas/verificaciones realizadas
