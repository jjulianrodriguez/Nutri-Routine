# Auditoria UX - Cliente con plan de entrenamiento activo

Fecha de auditoria: 15 de junio de 2026  
Perfil evaluado: cliente con entrenamiento activo, sin nutricion asignada.  
Restriccion aplicada: no se modifico codigo ni Supabase; las consultas fueron de solo lectura y no se ejecutaron acciones destructivas.

## 1. Resumen general desde perspectiva de cliente con entrenamiento activo

La experiencia ya permite que el cliente identifique que tiene una plantilla activa: `Rutina semanal`, estado `Vigente`, duracion de 6 semanas, fecha de inicio `15 de junio de 2026`, fecha de fin `26 de julio de 2026` y ciclo actual `Dia 1 de 3`.

El modulo de entrenamiento tiene buena base: muestra dias separados, ejercicios por orden, series, repeticiones, descanso, detalles y recursos externos. Tambien conserva historial con snapshots cuando estan disponibles.

El mayor problema es que la experiencia no termina de responder con claridad la pregunta principal del cliente: "Que hago hoy?". El dia actual aparece, pero compite con todos los demas dias desplegados y no hay accion de seguimiento, progreso, completar dia o guia paso a paso.

Tambien se detecto un riesgo visual importante: durante la carga del modulo de entrenamiento aparece una subnavegacion de gestion (`Ejercicios`, `Entrenamientos`, `Plantillas`, `Asignaciones`) que no corresponde al cliente. En una prueba real del navegador la ruta `/app/entrenamiento` quedo mostrando ese estado de carga durante mas de 12 segundos, aunque la respuesta autenticada del servidor si contenia el contenido final.

## 2. Funcionalidades que el cliente entiende bien

- La navegacion principal de cliente es adecuada: muestra `Dashboard`, `Mi perfil`, `Mi progreso`, `Entrenamiento`, `Notificaciones`, `Recursos`, `Calendario` y `Configuracion`; no muestra `Nutricion` para esta clienta.
- En el dashboard se entiende que existe una `Plantilla activa` y que la rutina asignada es `Rutina semanal`.
- En entrenamiento se entiende el estado general: `Vigente`, fechas de vigencia y dias restantes.
- El bloque `Ciclo actual` ayuda a identificar que corresponde el `Dia 1 de 3`.
- Los dias de la plantilla estan separados en tarjetas claras.
- Los nombres de ejercicios son visibles y faciles de ubicar: `Pull over`, `Press de hombros`, `Elevacion de hombros laterales`.
- Series, repeticiones y descanso aparecen como datos separados, lo cual mejora la lectura.
- El historial distingue asignaciones anteriores y muestra `Ver detalle` cuando hay snapshot disponible.
- Las rutas directas de gestion redirigen al cliente y no exponen formularios de crear, editar o eliminar.
- Los recursos multimedia externos dentro de ejercicios usan links con `target="_blank"` y `rel="noopener noreferrer"`.

## 3. Funcionalidades confusas o dificiles de usar

- El dashboard dice: "Esta vista muestra solo las areas que tenes asignadas: nutricion, entrenamiento o ambas." Para una clienta solo de entrenamiento, mencionar nutricion es innecesario y puede confundir.
- La tarjeta `Plantilla activa` del dashboard no tiene CTA claro hacia entrenamiento. Visualmente parece informativa, no una puerta de entrada para empezar.
- En entrenamiento se muestran todos los dias desplegados al mismo tiempo. El dia actual esta marcado, pero la pantalla puede sentirse larga y pesada.
- Cada tarjeta de dia usa el texto `Entrenamiento del dia`, incluso para dias que no son el actual. Eso puede diluir cual toca hoy.
- No hay una accion tipo `Empezar entrenamiento de hoy`, `Marcar dia como completado`, `Ver solo dia actual` o `Siguiente ejercicio`.
- Las dificultades aparecen en ingles (`intermediate`, `beginner`) dentro de los ejercicios. Deberian verse como `Intermedio` y `Principiante`.
- Los recursos multimedia se llaman `Recurso 1`, `Recurso 2`. El cliente no sabe si abrira video, imagen, Instagram u otra fuente.
- La seccion global `Recursos` esta vacia, pero los ejercicios si tienen recursos multimedia. Para el cliente puede parecer contradictorio.
- En `Recursos`, los filtros incluyen `Nutricion` aunque el cliente no tiene nutricion activa.
- En `Notificaciones`, el texto superior dice "cambios importantes en tus clientes, planes, asignaciones..." usando lenguaje de profesional/admin para un cliente.

## 4. Bugs o errores encontrados

- En una prueba real con navegador in-app, `/app/entrenamiento` quedo mostrando solo el fallback de carga con la subnavegacion de gestion. La respuesta autenticada por servidor si incluyo el contenido final, asi que conviene revisar streaming/hidratacion/cookies del App Router.
- La pantalla de carga de entrenamiento no esta adaptada al rol cliente: muestra enlaces de gestion que el cliente no deberia ver.
- Los textos de dificultad de ejercicios se renderizan en ingles.
- Hay inconsistencia de estados entre secciones: `Anterior`, `Archivada`, `Vencida` y `Caducada` se usan en distintos lugares. Para cliente deberia haber una taxonomia unica.
- Algunas asignaciones archivadas tienen fechas futuras. Aunque puede ser correcto tecnicamente, para cliente se ve raro: una plantilla "anterior" con fecha de fin futura.

## 5. Problemas visuales o de UI/UX

- La jerarquia del dashboard es bonita, pero no orienta a la accion principal del cliente: entrenar hoy.
- La plantilla actual puede saturar porque muestra todos los dias y todos sus ejercicios en una sola vista.
- Los detalles y multimedia estan dentro de `Ver detalles`; esto reduce ruido, pero tambien puede ocultar recursos importantes para ejecutar bien el ejercicio.
- Las etiquetas `Recurso 1` no tienen contexto visual suficiente.
- La biblioteca de recursos usa texto tecnico: "vista previa segura", "Una URL sin portada nunca rompe la biblioteca". Es lenguaje de implementacion, no de usuario final.
- Los estados vacios son funcionales, pero algunos no estan personalizados al plan activo. Ejemplo: en recursos vacios se sugiere "Selecciona otra categoria" aunque todas las categorias visibles estan vacias.

## 6. Problemas de permisos o acciones que no deberian aparecer

- No se encontraron botones finales de crear, editar o eliminar entrenamiento, ejercicios o plantillas para el cliente.
- Las rutas directas de gestion (`/app/entrenamiento/ejercicios`, `/rutinas`, `/plantillas`, `/asignaciones`, `/rutinas/nueva`, `/plantillas/nueva`) no exponen formularios al cliente y redirigen hacia entrenamiento.
- Problema pendiente: durante el estado de carga si aparecen enlaces de gestion en la subnavegacion. Aunque no permiten gestionar, generan desconfianza y ruido para cliente.
- En recursos, el cliente no ve `Crear recurso`, `Editar` ni `Eliminar`, correcto.
- En notificaciones, no se expone informacion sensible, pero el copy habla como si el cliente tuviera clientes.

## 7. Funcionalidades que deberian agregarse para el cliente

- Vista principal `Entrenamiento de hoy` con el dia actual primero y los demas dias colapsados.
- CTA claro: `Empezar entrenamiento de hoy`.
- Checklist por ejercicio o boton `Marcar como realizado`.
- Estado de avance del dia: ejercicios completados, pendientes y porcentaje.
- Historial de dias realizados, no solo historial de plantillas asignadas.
- Mejor presentacion de multimedia: tipo (`Video`, `Imagen`, `Instagram`), dominio y titulo opcional.
- Acceso rapido desde dashboard a `Ver entrenamiento de hoy`.
- Filtro en recursos que oculte nutricion si el cliente no tiene ese plan.
- Mensajes de estado vencido/caducado con instrucciones claras: "Consulta a tu entrenador para renovarlo".
- Notificaciones redactadas para cliente: "Tu entrenador te asigno..." en lugar de copy generico de gestion.

## 8. Mejoras recomendadas por prioridad

### Alta

- Corregir el fallback/loading de entrenamiento para que clientes no vean subnavegacion de gestion.
- Investigar por que el navegador puede quedar atrapado en el loading de `/app/entrenamiento`.
- Crear un bloque dominante `Hoy te toca: Dia 1 - Espalda + Hombros` con CTA para empezar.
- Mostrar solo el dia actual expandido por defecto y colapsar los demas.
- Traducir dificultades y etiquetas tecnicas visibles: `intermediate` -> `Intermedio`, `beginner` -> `Principiante`.
- Ajustar textos de notificaciones y dashboard para rol cliente.

### Media

- Mejorar labels de recursos multimedia con tipo y dominio en vez de `Recurso 1`.
- Vincular visualmente los recursos de ejercicios con la seccion `Recursos` o aclarar que son materiales propios de cada ejercicio.
- Unificar estados: usar una sola familia de terminos para `Vigente`, `Anterior`, `Vencida` o `Caducada`.
- Hacer que la tarjeta de `Plantilla activa` del dashboard sea clickeable o tenga boton `Ver entrenamiento`.
- Personalizar estados vacios de recursos segun plan activo.

### Baja

- Agregar microcopy de ayuda para descanso opcional y duracion opcional.
- Mostrar dominio o fuente de multimedia antes de abrir el link.
- Mejorar historial con una explicacion corta de que es una "copia historica".
- Mostrar fecha relativa ademas de fecha normal en historial y notificaciones.

## 9. Flujo ideal recomendado para el cliente

1. El cliente entra al dashboard.
2. Ve una tarjeta principal: `Hoy te toca Dia 1: Espalda + Hombros`.
3. Presiona `Empezar entrenamiento`.
4. Entra a una vista enfocada solo en el dia actual.
5. Ve ejercicios en orden, con nombre, series, repeticiones, descanso y notas simples.
6. Puede abrir multimedia con labels claros: `Video Instagram`, `Imagen de referencia`, `Guia externa`.
7. Marca ejercicios como completados.
8. Al terminar, ve confirmacion y resumen del dia.
9. Puede consultar `Ver plantilla completa` si quiere revisar otros dias.
10. En historial, ve plantillas anteriores y detalle snapshot sin depender de cambios futuros.

## 10. Conclusion final

La experiencia actual es funcional y tiene una estructura solida para mostrar una plantilla asignada, dias, ejercicios, multimedia e historial. Sin embargo, todavia se siente mas como una vista de consulta que como una guia diaria para entrenar.

Para un cliente con entrenamiento activo, la claridad es media: puede encontrar su plantilla y leer ejercicios, pero no recibe una instruccion fuerte de que hacer hoy ni una forma de seguir su avance. La prioridad deberia ser convertir el modulo en una experiencia centrada en el dia actual, ocultar por completo elementos de gestion durante carga y limpiar textos genericos o administrativos.
