# Catálogo General ICSA España (beta interactiva)

Web estática, sin dependencias, generada a partir del PDF oficial
`CATALOGO_IC_w011.pdf` publicado en icsacerraduras.es (104 páginas, noviembre 2026).
En toda la web el nombre es «Catálogo General ICSA España», sin año (petición de Sebalcab del 20/11/2026).

- 50 modelos, 93 versiones y 2.582 códigos en 8 familias.
- Fotos reales sacadas de las imágenes originales del PDF, sin textos superpuestos.
  Excepción: la C4 usa la foto del catálogo Sebalcab 2026/27 que ya estaba en `../ICSA`,
  porque la del PDF lleva la marca de agua de otra empresa.
- Tablas de medidas y códigos leídas del texto del PDF, con filtros por medida, leva, frente, acabado o color.
- Buscador que entiende la referencia como se pide de palabra: mezcla modelo, versión, medidas, leva, acabado, mano,
  color y código en la misma consulta («hs6 pro embrague corta 35/45 latón» da un único código; «102 inox 25», «600 negro»,
  «a402 blanco», «l 80 s10 pomo»). Acepta sinónimos (bombín, dcha, níquel/niquelado) y, si ninguna referencia tiene todas
  las palabras, avisa y muestra los resultados sin la que sobra. La página de resultados se afina por modelo, versión, leva y acabado.
  El motor está en `assets/buscador.js` y se puede probar fuera del navegador con Node.
- Compatibilidades con otras marcas (tabla de compatibilidades ICSA de junio de 2026, `_fuente/COMPATIBILIDADES_ICSA_JUNIO_2026.pdf`):
  151 equivalencias de 43 artículos ICSA con 18 marcas. Apartado propio con matriz y filtro por marca, bloque con logo y
  referencia en cada ficha, tira de logos junto al título y búsqueda inversa («tesa 2210», «iseo 741-7411», «yale 5000»).
  21 artículos están enlazados a su producto (`COMPAT_ENLACES` en `_generador/productos.py`); el resto no está en el catálogo España.
- Buscador de cilindros por gama, tipo, leva y medida.
- Pedido cerrado desde la app: el cliente elige referencias, cantidades, sus datos y observaciones en el panel «Pedido».
  Al enviar, el correo a icsa@sebalcab.es no lleva la lista editable, sino un enlace al pedido (`#/pedido/...`) y un
  código de control. Sebalcab abre el enlace y ve el pedido de solo lectura, con fotos y detalle, y puede copiar códigos y
  cantidades o imprimirlo. Si alguien cambia el enlace, el código de control no cuadra y la página lo avisa en rojo.
  Límite: el código detecta cambios, pero no es una firma criptográfica; para un envío que el cliente no pueda tocar en
  absoluto hace falta un servicio de envío (formulario con servidor propio o tipo Formspree).

## Cambios pedidos por Sebalcab (20/11/2026, primera fase)

Correo «Propuesta de mejoras y modificaciones en la web de ICSA España»:

1. Logotipo nuevo de ICSA España (`img/marca/logo-icsa-espana.png`, original en `_fuente/logo-icsa-espana-original.webp`),
   más grande en la cabecera: 88 px de alto en escritorio y 58 px en móvil. El favicon sale del mismo logo.
2. Azul corporativo de ICSA (#034EA2 en el PDF) en menús, botones, títulos, fondos destacados, enlaces, iconos y pie.
   Solo conservan otro color los avisos de errata («Revisar») y los errores.
3. «Venta exclusivamente a profesionales»: grande y en azul bajo el título de la portada, y en una franja
   superior en el resto de páginas y en el pie.
4. «Doble cilindro» pasa a «Cilindro» (y «2170 doble cilindro» a «2170 cilindro exterior e interior»). En
   `_generador/productos.py` esas versiones llevan `alias=ALIAS_DOBLE`, así que buscar «doble cilindro» sigue funcionando.
5. Nombre único «Catálogo General ICSA España» en títulos, ruta, pie, enlace de descarga del PDF y textos.
6. Marcas de otros fabricantes: se mantienen logos y referencias, con el texto aclaratorio que propuso Sebalcab en el
   apartado de compatibilidades, en cada ficha y en el pie. Las equivalencias son las de la tabla de junio de 2026:
   Sebalcab debe confirmar que son correctas.

## Cuentas del equipo comercial y panel CEO (24/11/2026, cambiado a comerciales el 25/11/2026)

Rama `cuentas-login-ceo`, sin publicar. Hoy funciona solo en local, en modo de prueba; la web publicada no enseña
el botón «Entrar» y las rutas de cuentas avisan de que el acceso aún no está activo.

Las cuentas son solo para los comerciales de Sebalcab (unos 5). No hay solicitud de cuenta pública: el CEO las crea
desde su panel y da a cada comercial una contraseña provisional.

- Sin sesión no se ve el catálogo: cualquier dirección lleva a la entrada (`#/acceso`) y, al entrar, vuelve a la
  página que se pedía (también los enlaces de pedido). Sin sesión se ocultan el buscador, las familias, el pedido y el
  enlace al PDF; solo queda la entrada.
- Cabecera: con la sesión abierta, botón «Mi cuenta» o «Panel CEO» (en móvil, solo el icono).
- `#/acceso`: entrar con usuario y contraseña. Los comerciales tienen un usuario («juanperez»); por dentro es el
  correo `usuario@usuarios.sebalcab.es`, que no existe ni recibe nada. Quien tenga un correo de verdad (el CEO) entra
  con su correo. Avisa si la cuenta está bloqueada.
- Contraseña provisional: las cuentas nuevas y las que tienen la contraseña restablecida solo pueden ver «Mi cuenta»
  hasta que ponen una contraseña suya.
- `#/cuenta`: teléfono, zona y código de agente en FactuSOL; el comercial puede cambiar su nombre, su teléfono y su
  contraseña. La zona, el usuario y el código de agente los cambia el CEO.
- `#/ceo`: panel CEO «Equipo comercial». Resumen por estado (activas, bloqueadas, total) que filtra la tabla,
  buscador, tabla con teléfono, zona, agente FactuSOL, estado, último acceso («Hoy», «Hace 3 días») y botón «Quitar
  acceso» o «Dar acceso» en cada fila, y exportación a CSV.
- `#/ceo/cuenta/<id>`: ficha para cambiar nombre, teléfono, usuario, zona, código de agente, rol y notas internas;
  quitar o dar el acceso (bloquear o desbloquear), generar una contraseña provisional (se enseña una sola vez) y eliminar. Historial con el
  alta, el último bloqueo o desbloqueo y el último acceso. El CEO no puede bloquear, eliminar ni quitar el rol de CEO
  a su propia cuenta.
- `#/ceo/nueva`: «Nuevo comercial»; la cuenta queda activa con una contraseña provisional.
- Pedido: con la sesión abierta, el formulario pide los «Datos del cliente» y el pedido lleva el nombre del comercial
  y su código de agente (salen en la página del pedido y en el correo). «Otro cliente» borra los datos del cliente
  anterior para no mandar un pedido a su nombre.

Código: `assets/cuentas.js` (capa de datos) y el bloque «cuentas del equipo comercial y panel CEO» de `assets/app.js`.

### Modo de prueba

Se activa solo en el ordenador de desarrollo (servidor `catalogo-icsa`, http://localhost:8125). Guarda las cuentas en
el navegador y no protege nada: sirve para ver y probar las pantallas. Cuentas inventadas para probar:

| Usuario | Contraseña | Cuenta |
|---|---|---|
| ceo@demo.local | ceo-demo-2026 | CEO |
| comercial1 a comercial4 | comercial-demo-2026 | comerciales activos |
| comercial5 | comercial-demo-2026 | bloqueado |

En la entrada, «Entrar de prueba como CEO o como comercial» abre la sesión sin escribir la contraseña, y
`#/acceso?demo=ceo` entra directo al panel CEO. En el panel, «Volver a las cuentas de prueba iniciales» borra los
cambios de prueba. Las cuentas de prueba de versiones anteriores (clientes profesionales, comerciales con correo) se
borran solas al abrir esta.

### Supabase (cuentas de verdad, preparado el 25/11/2026)

`assets/cuentas.js` tiene dos modos con las mismas funciones, y las pantallas no cambian:
- **Supabase.** Se activa al poner la dirección del proyecto y su clave pública en `assets/config-cuentas.js`.
  Contraseñas, sesión y permisos los comprueba Supabase: un comercial no puede leer otras cuentas ni darse el rol de
  CEO, y no ve las notas internas.
- **Prueba.** Se usa con `assets/config-cuentas.js` vacío y solo en local.

Todo lo de Supabase está en `supabase/`, con los pasos para montarlo en `supabase/LEEME-supabase.md`:
- la tabla y los permisos;
- la función del servidor `panel-ceo`;
- el alta del primer CEO, en `supabase/primer-ceo.sql`, que no se sube a GitHub;
- los usuarios y contraseñas iniciales del equipo, en `supabase/accesos-equipo.md`, que tampoco se sube.

Para el equipo comercial (11 agentes en FactuSOL) basta el plan gratuito. Tiene dos pegas: se pausa si pasa una semana sin que nadie entre, y no
hace copias de seguridad. El plan Pro cuesta 25 $ al mes. La cuenta de Supabase es de Sebalcab.

Hoy el bloqueo es de la pantalla: los archivos del catálogo (`data/catalogo.js` y las imágenes) siguen siendo
públicos en GitHub Pages para quien sepa la dirección. Para cerrarlos del todo, hay que pasarlos a un almacén privado
de Supabase y que la web los pida con la sesión abierta, igual que los precios y el stock que vendrán de FactuSOL.

Antes de publicar: visto bueno de Albert al diseño.

## Abrirlo

Abre `index.html` en el navegador o sube la carpeta entera a cualquier hosting estático
(por ejemplo, una subcarpeta de icsacerraduras.es). No necesita servidor ni base de datos.
Se pueden omitir `_fuente/`, `_generador/` y este archivo.

## Regenerar tras un PDF nuevo

1. Sustituye `_fuente/CATALOGO_IC_w011.pdf`.
2. Revisa en `_generador/productos.py` las páginas, recortes de foto y columnas de cada producto.
3. Ejecuta `python3 _generador/construir_catalogo.py` (necesita PyMuPDF y Pillow).
   El script avisa de tablas que no cuadran y de filas cuyo código no corresponde a sus medidas.
4. Sube el número `?v=` de los enlaces de `index.html` para que los navegadores no usen la versión en caché.

## Actualizar las compatibilidades

Sustituye `_fuente/COMPATIBILIDADES_ICSA_JUNIO_2026.pdf` (mismo formato: tabla exportada de Excel con una columna por marca),
revisa `COMPAT_ENLACES` si hay artículos nuevos que estén en el catálogo y vuelve a ejecutar el generador.
Los logos de las marcas se sacan de la cabecera de ese PDF. En la cabecera pone «EZQURRA»; se muestra como EZCURRA, que es lo que dice su logo.
TOVER aparece en la tabla sin ninguna equivalencia.

## Pendiente de confirmar con Sebalcab (erratas del PDF)

En la web aparecen marcadas con «Revisar» o con una nota:

- HS6 PRO y HS6 con pomo, leva corta, 80 (40/40): el código de latón (H166354512 y 0166354512) no corresponde a 40/40.
- S3 149 y 149/F, L 100 con A 40 y B 65: los códigos dicen 40/60 y la suma da 105.
- L18 1118 frente en U: los códigos llevan «§» impreso (1118§30-, 1118§35-).
- DC9 661: repite el código 0660B0000 del 660.
- L6 402: códigos con puntos por completar (0402T70...N-).
- Barra A1100/3/R: la página 86 dice 1.450 mm y la 100 dice 1.300 mm (se ha usado 1.300).

## Siguientes pasos posibles

- Precios y stock desde Factusol (el código de artículo ya está en cada fila).
- Fotos propias en alta para los productos con imagen pequeña en el PDF (candados Apollo, llaves).
- Dominio o subcarpeta definitiva y analítica de búsquedas.
