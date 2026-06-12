## Prompt 1: Nueva sección de perfil público del cliente

TAREA:
Crear una sección de perfil público/administrativo para cada cliente.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero únicamente debes cambiar o crear lo necesario si realmente se ocupa.

OBJETIVO:
Crear una página de perfil para cada cliente, accesible desde la sección de clientes y desde cualquier lugar donde aparezca el cliente como elemento clickeable: nombre, foto/avatar, card, fila de tabla, etc.

REQUISITOS:

* Desde la sección de clientes, al seleccionar un cliente, debe redirigir a su perfil.
* Si en otras partes aparece el cliente con nombre/foto/card/fila, debe poder abrir su perfil cuando tenga sentido.
* Crear una ruta tipo `/app/clientes/[id]` o seguir el patrón de rutas existente.
* El perfil debe mostrar información pública/administrativa útil para administradores y profesionales autorizados.
* Mostrar como mínimo, si existe en la DB:

  * nombre
  * email
  * foto/avatar
  * rol
  * estado de cuenta
  * plan de nutrición activo/inactivo
  * plan de entrenamiento activo/inactivo
  * fecha de registro
  * información básica disponible del cliente
  * rutinas asignadas actuales/historial si ya existe esa relación
* No mostrar datos sensibles innecesarios.
* No permitir que clientes vean perfiles de otros clientes.
* Administrador universal puede ver todos los perfiles.
* Profesionales solo pueden ver clientes permitidos según las reglas actuales del proyecto.
* Reutilizar componentes, estilos y layout existentes.
* No rediseñar todo el dashboard.

SUPABASE/SEGURIDAD:

* Reutiliza tablas existentes.
* No dupliques datos.
* Si falta alguna relación o policy necesaria, crea o ajusta solo lo mínimo.
* Validar acceso en server/backend/RLS, no solo en UI.
* No hacer reset de Supabase ni comandos destructivos.

ENTREGA:
Resume archivos modificados, ruta creada, datos mostrados, cambios Supabase/RLS si hubo y pendientes.





















## Prompt 2: Refactor de asignación de rutinas a clientes

TAREA:
Refactorizar la funcionalidad de asignación de rutinas para que exista una sección independiente de asignación dentro de entrenamiento.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero únicamente debes cambiar o crear lo necesario si realmente se ocupa.

PROBLEMA ACTUAL:
Actualmente las rutinas se asignan desde `/app/entrenamiento/rutinas/[url-rutina]` o desde el detalle de una rutina. Eso no es el flujo correcto.

OBJETIVO:
Crear una sección independiente para asignar y desasignar rutinas a clientes desde entrenamiento.

REQUISITOS:

* Crear una nueva sección/ruta dentro de entrenamiento, por ejemplo:

  * `/app/entrenamiento/asignaciones`
  * o el nombre que mejor encaje con el patrón actual.
* En la pantalla principal de entrenamiento, donde ya existen opciones como:

  * Resumen
  * Ejercicios
  * Rutinas
    agregar otra opción:
  * Asignaciones
* La sección de asignaciones debe mostrar todos los clientes disponibles para el entrenador/profesional autorizado.
* Para cada cliente, debe permitir:

  * ver rutinas asignadas actuales
  * asignar una rutina existente
  * desasignar una rutina
  * ver si una rutina está activa o vencida, si esa lógica ya existe
* Al asignar una rutina, permitir seleccionar:

  * cliente
  * rutina
  * duración de la asignación, si ya existe esa funcionalidad
  * fecha de inicio, si el proyecto ya la maneja
* El detalle de rutina ya no debe ser el lugar principal para asignar rutinas.
* Si existe botón de asignar dentro del detalle de rutina, puede redirigir a la nueva sección de asignaciones con la rutina preseleccionada, pero no debe mantener una lógica duplicada.
* Clientes solo pueden ver sus rutinas asignadas, no asignarse rutinas.
* Entrenadores solo pueden asignar rutinas a sus clientes permitidos.
* Admin universal puede gestionar asignaciones según permisos actuales.
* Mantener diseño igual al módulo de entrenamiento mostrado: tabs/chips para Resumen, Ejercicios, Rutinas y Asignaciones.
* No rediseñar toda la sección.

SUPABASE/SEGURIDAD:

* Reutiliza tablas existentes de rutinas, clientes y asignaciones.
* No dupliques tablas si ya existe una relación de rutina asignada.
* Si hace falta ajustar SQL/RLS, haz solo lo mínimo necesario.
* Validar permisos en backend/server actions/API/RLS, no solo frontend.
* No hacer reset de Supabase ni comandos destructivos.

ENTREGA:
Resume archivos modificados, ruta/sección creada, cómo quedó el nuevo flujo de asignación, cambios Supabase/RLS si hubo y pendientes.












TAREA:
Corregir el sidebar/layout lateral de la app.

INSTRUCCIONES:
Antes de tocar código, lee `AGENTS.md` y `.agents/skills/`. Hay varios agentes trabajando simultáneamente, así que no borres ni sobrescribas cambios ajenos. Tienes libre acceso a Supabase, pero esta tarea es principalmente frontend; solo cambia Supabase si realmente se ocupa.

OBJETIVOS:

1. Eliminar completamente el bloque superior donde aparece el nombre/branding “Nutrición con...” y “Área privada”.
2. Dejar en esa zona únicamente el bloque de “Perfil activo”.
3. Corregir el sidebar colapsado/cerrado, porque actualmente los iconos y elementos quedan desacomodados, no centrados y generan scroll horizontal.
4. Corregir el comportamiento hover cuando el sidebar está colapsado.

REQUISITOS:

* Eliminar del sidebar el bloque de marca/título superior:

  * “Nutrición con...”
  * “Área privada”
  * cualquier logo/texto asociado a esa cabecera
* En la parte superior del sidebar debe quedar solo el bloque de “Perfil activo”.
* El bloque de “Perfil activo” debe verse bien tanto en modo abierto como colapsado.
* En modo colapsado:

  * todos los iconos deben quedar perfectamente centrados
  * no debe aparecer texto cortado dentro del sidebar
  * no debe generarse scroll horizontal
  * no debe desbordarse contenido hacia los lados
  * los botones deben conservar tamaño consistente
  * avatar, navegación, configuración, blogs y cerrar sesión deben quedar alineados
* Al hacer hover sobre un item colapsado:

  * la información debe mostrarse correctamente como tooltip, popover o label externo
  * no debe aparecer cortada dentro del sidebar
  * no debe crear scroll inferior/horizontal
  * no debe romper el layout
* Revisar especialmente:

  * ancho del sidebar abierto y colapsado
  * `overflow-x`
  * `min-width`
  * `max-width`
  * `justify-center`
  * `items-center`
  * labels ocultos en modo colapsado
  * tooltips/popovers
  * sección inferior de usuario/cerrar sesión
* Mantener el diseño visual actual.
* No rediseñar todo el dashboard.
* No cambiar rutas ni lógica de permisos.
* No modificar funcionalidades no relacionadas.
* No agregar librerías innecesarias.

ENTREGA:
Al finalizar, responde brevemente con:

* archivos modificados
* qué se eliminó del header del sidebar
* cómo se corrigió el modo colapsado
* cómo se corrigió el hover/tooltip
* si quedó algún pendiente
