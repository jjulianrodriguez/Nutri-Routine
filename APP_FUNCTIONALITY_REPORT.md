# Informe completo de funcionalidades actuales

**Fecha de auditoría:** 13 de junio de 2026  
**Proyecto:** ExercisesSystem  
**Alcance:** código presente en el workspace, migraciones locales y proyecto Supabase conectado, inspeccionado únicamente en modo lectura.

> El workspace contiene cambios sin confirmar de varios agentes. Este informe describe el estado actual observado, incluyendo esos cambios, y no solamente el último commit de Git.

## Criterio de evaluación

- **Operativa:** existe interfaz, acceso a datos, acciones principales y validación segura coherente.
- **Parcial:** existe y muestra datos reales, pero faltan acciones principales o integración.
- **Incompleta:** hay estructura o texto visible, pero el flujo no puede completarse.
- **Riesgo:** funciona, pero tiene una inconsistencia de permisos, datos, historial o experiencia de usuario.

## 1. Resumen general de la app

### Módulos existentes

La aplicación es una plataforma de acompañamiento de nutrición y entrenamiento construida con Next.js, TypeScript, TailwindCSS y Supabase. Actualmente contiene:

- Sitio público y página de presentación.
- Autenticación y registro por código de acceso.
- Dashboard privado adaptado al rol.
- Gestión y asignación de clientes.
- Nutrición y planes nutricionales.
- Entrenamiento.
- Catálogo de ejercicios.
- Constructor y gestión de rutinas.
- Asignación e historial de rutinas.
- Recursos externos.
- Calendario y citas.
- Seguimiento de progreso.
- Blog público y administración de publicaciones.
- Perfil y configuración personal.
- Creación de cuentas profesionales.
- Manejo de estados de error, acceso pendiente y páginas no encontradas.

### Roles existentes

El esquema define tres roles:

- `client`: cliente final.
- `professional`: profesional.
- `admin`: administrador.

Los profesionales también tienen una especialidad:

- `nutrition`
- `training`
- `both`

Existe además el concepto de **administrador universal**: un perfil con rol `admin` y sin fila asociada en `professional_profiles`.

Hay una inconsistencia importante en el alta actual: las cuentas profesionales creadas desde Configuración se guardan con `profiles.role = 'admin'` y su especialidad en `professional_profiles`. Por ello, el comportamiento efectivo no coincide plenamente con la separación conceptual entre `admin` y `professional`.

### Flujo principal

1. El usuario visita el sitio público, el blog o inicia el registro.
2. El registro público crea una cuenta de cliente mediante un código de acceso.
3. Tras iniciar sesión, `/app` redirige a la sección permitida según rol, especialidad y asignación profesional.
4. Un cliente sin nutricionista ni entrenador asignado solo puede usar Configuración.
5. Un cliente activado accede a las áreas correspondientes a sus servicios asignados.
6. Administradores y profesionales gestionan clientes, planes, ejercicios, rutinas, asignaciones y recursos según sus permisos efectivos.
7. El administrador universal puede crear cuentas profesionales y administrar funcionalidades globales.

## 2. Funcionalidades que ya existen y funcionan

| Funcionalidad | Estado | Observación |
| --- | --- | --- |
| Sitio público | Operativa | Presentación, servicios, enlaces de acceso, blog y contacto por WhatsApp. |
| Inicio de sesión | Operativa | Email/contraseña, manejo de sesión y redirección privada. |
| Registro de clientes | Operativa | Código de acceso, validación y confirmación de contraseña. |
| Confirmación de email | Operativa | Soporta token hash y flujo PKCE. |
| Mostrar/ocultar contraseña | Operativa | Componente accesible reutilizado en formularios actuales. |
| Dashboard | Operativa con limitación | Resume clientes, planes y recursos con datos reales según el rol. |
| Clientes | Operativa | Listado, filtros, detalle y asignación de profesionales por área. |
| Ejercicios | Operativa | Crear, listar, buscar, editar, activar, desactivar y eliminar. |
| Rutinas | Operativa con riesgos | Constructor, edición, detalle, activación, desactivación y eliminación. |
| Asignaciones de rutinas | Operativa con riesgos | Sección independiente para asignar, reemplazar y archivar asignaciones. |
| Recursos | Operativa | CRUD de enlaces externos y lectura filtrada por área/servicio. |
| Blog público | Operativa | Publicaciones visibles, detalle, categoría y filtros visuales. |
| Administración de blog | Operativa | Crear, editar, publicar, ocultar, anclar, desanclar y eliminar. |
| Configuración de perfil | Operativa | Información personal opcional, editable y eliminable. |
| Cuentas profesionales | Operativa con riesgo | Alta y listado desde una sección exclusiva del administrador universal. |
| Errores y páginas no encontradas | Operativa | Estados compartidos y límites de error en módulos relevantes. |
| Nutrición | Parcial | Consulta planes y recursos; no permite crear ni editar planes. |
| Calendario | Parcial | Consulta citas; no permite gestionarlas. |
| Progreso | Parcial | Consulta entradas; no permite registrarlas ni editarlas. |

## 3. Funcionalidades incompletas o faltantes

### Planes nutricionales

- La ruta y la consulta de datos existen.
- La interfaz presenta los planes y recursos relacionados.
- No existen formularios ni acciones para crear, editar, archivar o eliminar planes nutricionales.
- La tabla `diet_plans` tiene acceso de lectura, pero no políticas ni permisos finales de escritura para el flujo de la app.
- Algunos textos de la UI indican que se pueden crear o editar planes, aunque esas acciones no están disponibles.

### Calendario y citas

- `/app/calendario` muestra citas reales y un resumen.
- No hay acciones para crear, editar, cancelar o reprogramar citas.
- `appointments` está configurada como lectura para la aplicación actual.

### Seguimiento de progreso

- `/app/progreso` muestra entradas recientes y conteos.
- No hay formulario para registrar peso, notas, medidas u otros avances.
- No hay edición, eliminación ni visualizaciones de tendencias.
- El texto de “tendencias” no corresponde todavía a una gráfica o análisis real.

### Perfil del cliente frente a Configuración

- Configuración guarda los campos personales nuevos en `profile_personal_details`.
- El detalle administrativo del cliente sigue leyendo teléfono, fecha de nacimiento y género desde columnas antiguas de `client_profiles`.
- La información nueva no aparece de forma coherente en la vista administrativa del cliente.
- Peso, altura y condiciones médicas no tienen una vista profesional conectada, aunque RLS permite que profesionales asignados consulten esos datos.

### Gestión de profesionales

- Se pueden crear y listar cuentas profesionales.
- No se pueden editar especialidades, desactivar cuentas ni eliminarlas desde la UI.
- El modelo de rol usado al crear profesionales otorga permisos más amplios de lo esperado.

### Estado pendiente

- Existe `/app/pending`, pero las reglas de acceso envían al cliente pendiente a `/app/configuracion`.
- La comprobación general de rutas impide alcanzar normalmente `/app/pending`.
- La pantalla es, en la práctica, una ruta duplicada o muerta.

### Mensajería

- No existen rutas ni tablas activas de conversaciones o mensajes.
- Una migración elimina expresamente esas tablas, por lo que el sistema de mensajes debe considerarse retirado, no funcional.

### Pruebas automatizadas

- No se encontraron pruebas unitarias, de integración ni end-to-end.
- `package.json` no incluye un script de pruebas.
- Esto deja sin cobertura automatizada los permisos, RPC, formularios y flujos críticos.

## 4. Explicación por funcionalidad

### 4.1 Sitio público

**Propósito:** presentar el servicio, sus áreas y accesos principales.  
**Usuarios:** visitantes y usuarios no autenticados.  
**Rutas:** `/`, `/blog`, `/blog/[slug]`, `/login`, `/register`.  
**Datos:** publicaciones visibles de `blog_posts`; el resto del contenido es principalmente estático.  
**Acciones:** navegar, registrarse, iniciar sesión, leer blog y abrir contacto por WhatsApp.  
**Limitaciones:** nombres, textos y número de WhatsApp están incorporados en el código; no existe CMS para la página principal.

### 4.2 Autenticación

**Propósito:** registrar clientes, iniciar sesión, confirmar correo y cerrar sesión.  
**Usuarios:** visitantes y todos los roles autenticados.  
**Rutas:** `/login`, `/register`, `/auth/confirm`.  
**Datos:** Supabase Auth y `profiles`.  
**Acciones:** registro con código, login por email/contraseña, confirmación de cuenta y logout.  
**Seguridad:** las rutas privadas validan sesión; las mutaciones sensibles se ejecutan en servidor.  
**Limitaciones:**

- No se encontró recuperación o cambio de contraseña.
- `/api/access-code` parece duplicar una validación que el registro ya hace en una acción de servidor y no se encontró uso desde el código fuente.
- No se observó rate limiting ni CAPTCHA para los intentos de códigos de acceso.
- Supabase reporta desactivada la protección contra contraseñas filtradas.

### 4.3 Dashboard

**Propósito:** resumir la actividad disponible para cada cuenta.  
**Usuarios:** clientes, profesionales y administradores.  
**Ruta:** `/app/dashboard`.  
**Datos:** `client_profiles`, `diet_plans`, `workout_plans` y `resources`.  
**Acciones:** consultar resúmenes y navegar a módulos permitidos.  
**Limitación:** varias consultas convierten errores en conteos cero o listas vacías; un fallo de RLS o red puede parecer simplemente “sin datos”.

### 4.4 Clientes y usuarios

**Propósito:** relacionar clientes con profesionales de nutrición y entrenamiento.  
**Usuarios:** administrador universal y profesionales autorizados.  
**Rutas:** `/app/clientes`, `/app/clientes/[id]`.  
**Datos:** `profiles`, `client_profiles`, `professional_profiles`, `diet_plans`, `workout_plans`.  
**Acciones:**

- Listar y filtrar clientes por estado o servicio.
- Ver el detalle del cliente.
- Asignar o cambiar nutricionista y entrenador.
- Consultar historial resumido de planes y rutinas.

**Seguridad:** las acciones verifican rol, especialidad, cliente objetivo y profesional seleccionado; RLS limita la visibilidad.  
**Limitaciones:**

- El correo del cliente no se obtiene para el listado normal y puede aparecer como no disponible.
- El detalle mezcla campos antiguos de `client_profiles` con el nuevo sistema `profile_personal_details`.
- Sin credenciales de servicio, algunos datos de Auth, como estado de cuenta o email, quedan desconocidos.

### 4.5 Nutrición

**Propósito:** mostrar planes nutricionales y recursos del área.  
**Usuarios:** clientes con nutrición activa y profesionales autorizados.  
**Ruta:** `/app/nutricion`.  
**Datos:** `diet_plans` y `resources`.  
**Acciones actuales:** consultar planes y abrir recursos externos.  
**Limitación principal:** el módulo es de solo lectura; no tiene constructor ni CRUD de planes.

### 4.6 Ejercicios

**Propósito:** mantener un catálogo reutilizable para construir rutinas.  
**Usuarios:** administradores y profesionales con acceso a entrenamiento; los clientes solo leen ejercicios incluidos en sus rutinas asignadas.  
**Ruta:** `/app/entrenamiento/ejercicios`.  
**Datos:** `exercises`.  
**Acciones:**

- Crear y editar nombre, instrucciones, dificultad, grupo muscular, categoría, tipo y URL multimedia externa.
- Buscar y filtrar.
- Activar o desactivar.
- Eliminar ejercicios no utilizados.

**Seguridad:** acción de servidor más RLS para responsables de entrenamiento. La URL se valida como HTTP/HTTPS y no existe subida de archivos.  
**Limitaciones:**

- Todos los responsables de entrenamiento comparten el catálogo y pueden modificar ejercicios de otros creadores.
- La validación fuerte de URL está en la aplicación; la columna no tiene una restricción equivalente para escrituras directas por API.
- Un ejercicio utilizado en una rutina no se puede eliminar, solo desactivar.

### 4.7 Rutinas

**Propósito:** crear plantillas de entrenamiento a partir del catálogo de ejercicios.  
**Usuarios:** administradores y profesionales de entrenamiento; clientes con una asignación relacionada tienen lectura limitada.  
**Rutas:** `/app/entrenamiento/rutinas`, `/nueva`, `/[id]`, `/[id]/editar`.  
**Datos:** `routines`, `routine_exercises`, `exercises`.  
**Acciones:**

- Crear y editar nombre, descripción, dificultad, categoría y público objetivo.
- Seleccionar ejercicios.
- Configurar series, repeticiones, descanso, duración y notas.
- Cambiar el orden mediante botones.
- Activar, desactivar y eliminar.

**Seguridad:** el RPC `save_routine` valida permisos, ejercicios activos y relación ordenada de ejercicios.  
**Limitaciones y riesgos:**

- La edición carga como opciones únicamente ejercicios activos. Si una rutina contiene un ejercicio desactivado, el editor puede mostrarlo sin poder resolverlo correctamente y el guardado puede fallar.
- No existe una instantánea de ejercicios por asignación. Editar una rutina modifica lo que se verá posteriormente en su historial.
- Eliminar una rutina conserva la fila histórica de asignación, pero elimina el vínculo detallado mediante `routine_id`.
- Todos los responsables de entrenamiento pueden editar rutinas creadas por otros responsables.

### 4.8 Asignación de rutinas

**Propósito:** asignar una plantilla existente a un cliente durante un periodo.  
**Usuarios:** administrador universal y entrenadores autorizados; el cliente solo consulta sus asignaciones.  
**Rutas:** `/app/entrenamiento/asignaciones`, `/app/entrenamiento/historial/[assignmentId]`.  
**Datos:** `workout_plans`, `routines`, `client_profiles`.  
**Acciones:**

- Ver clientes autorizados y su rutina actual.
- Seleccionar cliente, rutina, fecha inicial y duración en semanas.
- Reemplazar una asignación activa con confirmación.
- Desasignar archivando el plan.
- Ver estado próximo, activo o vencido.
- Abrir el historial del cliente.

**Seguridad:** el RPC `assign_routine_to_client` y las políticas verifican la relación entre entrenador y cliente.  
**Limitaciones y riesgos:**

- El estado vencido se calcula a partir de fechas, pero la fila puede continuar con `status = 'active'`.
- No se encontró una restricción única en base de datos que garantice una sola asignación activa por cliente si una escritura evita el RPC.
- El historial detallado depende de la versión actual de la rutina, no de la versión asignada originalmente.

### 4.9 Recursos

**Propósito:** compartir enlaces externos de nutrición, entrenamiento o ambas áreas.  
**Usuarios:** clientes y profesionales según área; administradores para gestión.  
**Ruta:** `/app/recursos`.  
**Datos:** `resources`.  
**Acciones:** listar, filtrar, crear, editar, abrir y eliminar recursos.  
**Seguridad:** validación HTTP/HTTPS, bloqueo de credenciales y destinos locales, más políticas RLS por rol y servicio.  
**Limitaciones y riesgos:**

- La UI crea recursos globales; aunque existe `client_id`, no hay flujo visible para asignar un recurso a un cliente concreto.
- Dos restricciones recientes de descripción y URL están creadas como `NOT VALID`; protegen nuevas escrituras, pero aún no certifican datos heredados.
- Debido al modelo actual de alta profesional con rol `admin`, un profesional de especialidad puede terminar administrando recursos fuera de su área.

### 4.10 Blog

**Propósito:** publicar contenido público clasificado por categoría.  
**Usuarios:** visitantes para lectura; administradores autorizados para gestión.  
**Rutas:** `/blog`, `/blog/[slug]`, `/app/blog`.  
**Datos:** `blog_posts`.  
**Acciones públicas:** ver publicaciones visibles, filtrar por categoría y abrir el detalle.  
**Acciones administrativas:** crear, editar, publicar, ocultar, anclar, desanclar y eliminar definitivamente con confirmación.  
**Comportamiento de categorías:** la lista genera chips con `Todos` y las categorías disponibles; el filtro solo opera sobre publicaciones visibles.  
**Slug técnico:** se genera internamente desde el título para la URL, se normaliza y se evita la colisión; no se expone como campo editable.  
**Seguridad:** anónimos solo leen publicaciones publicadas; las mutaciones verifican administración y RLS.  
**Limitaciones y riesgos:**

- El autor público se presenta con un nombre fijo en vez del autor real.
- `tags TEXT[]` permanece por compatibilidad, pero la UI usa una categoría principal.
- Actualmente no hay publicaciones en la base inspeccionada.
- La inconsistencia de roles puede otorgar administración del blog a cuentas profesionales creadas como `admin`.

### 4.11 Calendario

**Propósito:** mostrar próximas citas.  
**Usuarios:** cuentas relacionadas según RLS.  
**Ruta:** `/app/calendario`.  
**Datos:** `appointments`.  
**Acciones actuales:** ver conteo y próximas citas.  
**Limitación:** no existe gestión de citas; el módulo es de solo lectura.

### 4.12 Progreso

**Propósito:** mostrar registros de avance del cliente.  
**Usuarios:** cliente autenticado.  
**Ruta:** `/app/progreso`.  
**Datos:** `progress_entries`.  
**Acciones actuales:** ver conteo y registros recientes.  
**Limitaciones:** no hay alta, edición, eliminación, gráficas ni vista profesional conectada.

### 4.13 Perfil y configuración

**Propósito:** mostrar la cuenta y editar información personal opcional.  
**Usuarios:** todos los roles para Configuración; el perfil resumido está orientado al cliente.  
**Rutas:** `/app/perfil`, `/app/configuracion`.  
**Datos:** `profiles`, `profile_personal_details` y parte de `client_profiles`.  
**Campos editables:** nombre, teléfono, fecha de nacimiento, género inclusivo/autodescripción, peso, altura y condiciones médicas.  
**Acciones:** guardar, actualizar y borrar valores opcionales. Si todos quedan vacíos, se elimina la fila de detalles.  
**Seguridad:** el usuario modifica únicamente su información; profesionales asignados tienen lectura controlada por RLS.  
**Limitaciones:**

- No se edita email, avatar ni contraseña.
- `/app/perfil` y `/app/configuracion` solapan conceptos y no muestran los mismos datos.
- La información médica no se expone públicamente, pero tampoco está integrada en una vista profesional útil.

### 4.14 Cuentas profesionales

**Propósito:** dar de alta profesionales y definir su especialidad.  
**Usuarios:** administrador universal.  
**Ruta:** `/app/configuracion/profesionales`.  
**Datos:** Supabase Auth, `profiles`, `professional_profiles`.  
**Acciones:** crear cuenta confirmada y listar cuentas existentes.  
**Seguridad:** usa código administrativo, cliente de servicio en servidor y revierte el usuario de Auth si falla la configuración de perfil.  
**Limitaciones:**

- Crea `profiles.role = 'admin'`, no `professional`.
- No existe edición, desactivación ni eliminación.
- La especialidad limita algunas áreas, pero el rol `admin` desbloquea políticas globales en otros módulos.

### 4.15 Navegación, errores y acceso

**Propósito:** ofrecer navegación según permisos y recuperación ante errores.  
**Usuarios:** todos.  
**Rutas:** layout privado, páginas `error.tsx`, `not-found.tsx`, `/app/[...segments]` y `/app/pending`.  
**Acciones:** redirección al destino inicial permitido, cierre de sesión y recuperación de vistas fallidas.  
**Limitaciones:** existen alias y una ruta pendiente redundante; algunas páginas muestran detalles de implementación que no aportan valor al usuario final.

## 5. Relaciones entre funcionalidades

### Clientes ↔ planes

- `client_profiles` representa la activación y asignación profesional del cliente.
- `diet_plans.client_id` relaciona planes nutricionales.
- `workout_plans.client_id` relaciona asignaciones de entrenamiento.
- Las políticas usan la relación profesional-cliente para decidir lectura y escritura.

### Clientes ↔ profesionales

- `client_profiles.nutritionist_id` conecta al cliente con nutrición.
- `client_profiles.trainer_id` conecta al cliente con entrenamiento.
- `professional_profiles.specialty` define qué área puede gestionar el profesional.
- Un cliente sin ninguna de estas relaciones queda limitado a Configuración.

### Ejercicios ↔ rutinas

- `routine_exercises` relaciona `routines` con `exercises`.
- La relación almacena series, repeticiones, descanso, duración, notas y posición.
- Un ejercicio relacionado no puede borrarse directamente.

### Rutinas ↔ asignaciones

- `routines` contiene plantillas reutilizables.
- `workout_plans.routine_id` conecta una plantilla con una asignación.
- La asignación también copia título y descripción, pero no los ejercicios ni su configuración.

### Rutinas ↔ clientes

- Un cliente recibe rutinas mediante `workout_plans`.
- El entrenador autorizado depende de `client_profiles.trainer_id`.
- El cliente consulta la rutina actual y su historial, sin capacidad de autoasignarse.

### Recursos ↔ planes

- Los recursos no tienen una relación directa con una fila concreta de plan.
- Se clasifican por área y opcionalmente por `client_id`.
- La UI actual los presenta como contenido complementario global según el servicio activo.

### Blogs ↔ categorías y visibilidad

- `blog_posts.category` define la clasificación principal.
- `is_published` controla visibilidad pública.
- `is_pinned` destaca una publicación y un trigger mantiene consistencia.
- El slug interno resuelve la ruta de detalle, pero no es una categoría visual.

### Configuración ↔ perfil

- `profiles` guarda la identidad básica.
- `profile_personal_details` guarda información personal opcional y sensible.
- `client_profiles` todavía conserva campos personales antiguos, generando dos fuentes parciales de verdad.

### Roles ↔ permisos

- El layout y las páginas usan `getCurrentUserAccess` y `requireRouteAccess`.
- Las acciones repiten validaciones de rol, área y relación.
- RLS constituye la última capa de protección en Supabase.
- El alta de profesionales como `admin` debilita la separación esperada entre administración global y especialidad profesional.

## 6. Riesgos o problemas detectados

### Prioridad alta

1. **Profesionales creados como administradores.** Pueden obtener permisos globales de blog y recursos porque varias políticas comprueban solo `profiles.role = 'admin'`.
2. **Nutrición anunciada como gestionable pero solo disponible en lectura.** La UI y la expectativa funcional no coinciden con acciones y RLS.
3. **Datos personales divididos en dos estructuras.** Configuración escribe `profile_personal_details`, mientras el detalle de cliente consulta campos antiguos.
4. **Historial de rutinas no inmutable.** Una edición posterior cambia la interpretación histórica y una eliminación impide recuperar el detalle.

### Prioridad media

5. **Rutinas con ejercicios desactivados.** Pueden quedar difíciles de editar y fallar al guardar sin una explicación precisa.
6. **Una sola rutina activa no está garantizada por restricción.** El RPC mantiene el flujo normal, pero la base no impide completamente duplicados activos.
7. **Errores ocultos como estados vacíos.** Dashboard y algunos listados pueden mostrar cero elementos ante un fallo real.
8. **Calendario y progreso son pantallas de solo lectura.** Parecen módulos completos, pero no permiten operar.
9. **Ruta `/app/pending` no alcanzable normalmente.**
10. **Datos técnicos visibles.** Algunos textos mencionan tablas, RLS, segundos internos o nombres como `client_profiles`, `appointments` y `progress_entries`.
11. **Sin pruebas automatizadas.** Los permisos por rol y relaciones críticas dependen de revisión manual.

### Prioridad baja o de mantenimiento

12. `/api/access-code` parece redundante y amplía superficie sin uso identificado.
13. El perfil y Configuración ofrecen experiencias parcialmente duplicadas.
14. El blog muestra un autor fijo.
15. Existen índices reportados como no utilizados; con el volumen actual no justifican una eliminación inmediata.
16. Las restricciones `NOT VALID` de recursos deberían validarse cuando se confirme que no hay datos heredados incompatibles.

## 7. Recomendaciones siguientes

### Hacer primero

1. Corregir el modelo de cuentas profesionales: usar `role = 'professional'` o actualizar todas las comprobaciones para distinguir administrador universal de administrador con especialidad.
2. Añadir pruebas de permisos para blog, recursos, clientes, ejercicios, rutinas y asignaciones antes de ampliar módulos.
3. Unificar la fuente de datos personales y conectar `profile_personal_details` con el detalle autorizado del cliente.
4. Definir una estrategia de instantáneas para asignaciones de rutinas, de modo que el historial conserve ejercicios y parámetros originales.
5. Resolver el manejo de ejercicios desactivados al editar rutinas.

### Hacer después

6. Completar CRUD de planes nutricionales con validaciones y RLS equivalentes al módulo de entrenamiento.
7. Definir si Calendario y Progreso serán operativos; implementar sus acciones o ajustar el texto para presentarlos claramente como consulta.
8. Añadir una garantía de base de datos para evitar más de una asignación activa por cliente, compatible con fechas y archivado.
9. Dejar de convertir silenciosamente errores de datos en listas vacías y mostrar estados de recuperación claros.
10. Retirar la ruta pendiente redundante y el endpoint de código si se confirma que no tienen consumidores.

### Conviene no tocar todavía

- No eliminar índices solo por la advertencia de “no usado” mientras el conjunto de datos sea mínimo y el producto siga evolucionando.
- No separar recursos en nuevas tablas hasta definir si realmente habrá recursos por cliente o por plan.
- No rediseñar la navegación global antes de estabilizar roles y permisos.
- No migrar o borrar los campos personales antiguos hasta conectar todas las lecturas y verificar datos existentes.

## 8. Inventario técnico resumido

### Tablas funcionales inspeccionadas

- `profiles`
- `professional_profiles`
- `client_profiles`
- `profile_personal_details`
- `diet_plans`
- `workout_plans`
- `exercises`
- `routines`
- `routine_exercises`
- `resources`
- `appointments`
- `progress_entries`
- `blog_posts`

Todas las tablas funcionales inspeccionadas tienen RLS habilitado.

### Estado de datos al 13 de junio de 2026

| Tabla | Filas |
| --- | ---: |
| `profiles` | 4 |
| `professional_profiles` | 1 |
| `client_profiles` | 1 |
| `exercises` | 1 |
| `routines` | 1 |
| `routine_exercises` | 1 |
| `workout_plans` | 3 |
| `diet_plans` | 0 |
| `blog_posts` | 0 |
| `resources` | 0 |
| `appointments` | 0 |
| `progress_entries` | 0 |
| `profile_personal_details` | 0 |

Estos conteos son diagnósticos y no demuestran por sí solos el funcionamiento de una interfaz.

### Verificaciones realizadas

- Lectura de rutas, componentes, acciones, validaciones y migraciones relevantes.
- Inspección de tablas, políticas, funciones, restricciones y asesores de Supabase en modo lectura.
- `tsc --noEmit`: completado correctamente.
- Pruebas HTTP locales:
  - `/`: `200`
  - `/blog`: `200`
  - `/login`: `200`
  - `/register`: `200`
  - `/app`: `307` hacia `/login` sin sesión
- No se ejecutó un build completo ni una suite de pruebas.
- No fue posible completar una inspección visual autenticada con el navegador integrado; la evaluación de UI se basa en el código y en las respuestas HTTP.

### Fuentes externas de referencia

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Supabase changelog](https://supabase.com/changelog)
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)

## Conclusión

La app tiene una base funcional sólida en autenticación, clientes, ejercicios, rutinas, asignaciones, recursos, blog y configuración personal. El módulo de entrenamiento es el área más completa. Nutrición, Calendario y Progreso existen como consultas, pero todavía no como flujos de gestión completos.

El problema transversal más importante no es visual, sino de autorización: las cuentas profesionales se crean con rol administrativo y pueden heredar permisos globales no relacionados con su especialidad. Después de corregir esa separación, las prioridades deberían ser consolidar los datos personales, preservar el historial real de rutinas y completar los módulos actualmente de solo lectura.
