# TAREAS



- En la parte de medidas en progreso, se debe de mostrar aunque tenga una sola configurada.

- El boton de ... en mensajes no funciona















































Codex, haz una auditoría visual final del rediseño y corrige únicamente inconsistencias visuales.

IMPORTANTE:
No hagas otro rediseño.
No cambies la paleta.
No restaures archivos.
No uses `git checkout`, `git reset`, `git restore`.
No cambies lógica, Supabase, RLS, auth ni permisos.

Objetivo:
Asegurar que la app quedó coherente, premium y equilibrada con la nueva paleta.

Revisar toda la app:

* landing
* login/register
* dashboard
* clientes
* detalle de cliente
* progreso
* nutrición
* entrenamiento
* ejercicios
* plantillas
* recursos
* blogs
* notificaciones
* calendario
* mensajes
* configuración
* perfil
* mobile
* modo claro
* modo oscuro

Checklist obligatorio:

1. Paleta:

* No debe dominar un solo color.
* No deben dominar solo dos colores.
* En cada sección deben aparecer varios colores de la paleta.
* No deben quedar colores viejos.
* No deben quedar fondos blancos puros si deberían ser blanco hueso.
* No debe haber combinaciones ilegibles.

2. Contraste:

* No texto oscuro sobre fondo oscuro.
* No texto claro sobre fondo claro.
* Botones legibles.
* Badges legibles.
* Sidebar legible.
* Modo oscuro legible.

3. Sidebar:

* color primario aplicado
* textos pálidos normales
* activo con barra blanca izquierda
* texto activo blanco
* hover premium

4. Cards:

* sin bordes visibles
* sombras 3D mínimas
* sin cards internas ruidosas
* sin cards vacías gigantes
* altura independiente

5. Hover/click:

* premium y sutil
* sin saltos de layout
* sin hover en elementos no interactivos
* focus visible

6. Tipografía:

* aplicada globalmente
* títulos, textos, botones y formularios se ven coherentes
* no rompe layout ni mobile

Corrige solo lo necesario para cumplir el checklist.

Ejecuta:
`npm run lint`
`npm run build`

Entrega:
secciones revisadas, inconsistencias encontradas, correcciones hechas, archivos modificados y confirmación de que no usaste comandos destructivos.
