# Cuentas del equipo comercial en Supabase

Todo lo que necesita el catálogo para que las cuentas sean de verdad:

| Archivo | Qué es |
|---|---|
| `migrations/20261125180000_cuentas_comerciales.sql` | Tabla de cuentas, permisos y las funciones que usa cada comercial para leer y cambiar lo suyo |
| `functions/panel-ceo/index.ts` | Función del servidor para todo lo del panel CEO: crear comerciales, contraseñas provisionales, bloquear, eliminar |
| `primer-ceo.sql` | Convierte en CEO el primer usuario. Lleva el correo del CEO, así que solo está en este Mac (no se sube a GitHub) |
| `accesos-equipo.md` | Usuarios y contraseñas iniciales del equipo, para repartirlos. Solo en este Mac |
| `alta-equipo.sql` | Alta inicial del CEO y de los 11 agentes de FactuSOL (usuario en Auth y ficha). Lleva datos y contraseñas: solo en este Mac |
| `config.toml` | Configuración mínima para la herramienta `supabase` |
| `../assets/config-cuentas.js` | Dirección del proyecto y clave pública. Vacío = modo de prueba en local |

Cómo funciona:
- Los comerciales entran con un usuario («juanperez»). Supabase pide un correo por cuenta, así que por dentro es
  `usuario@usuarios.sebalcab.es`: no existe ni recibe nada, y el catálogo solo enseña el usuario. Quien tenga un
  correo de verdad, como el CEO, entra con él.
- Las cuentas nuevas o con la contraseña restablecida llevan `clave_provisional`: hasta que su dueño pone una
  contraseña suya, el catálogo solo le deja ver «Mi cuenta».
- Las contraseñas las guarda y comprueba Supabase. El catálogo nunca las ve guardadas.
- Con la clave pública nadie puede leer la tabla de cuentas. Cada comercial solo ve su propia cuenta y no ve las notas internas.
- Todo lo del CEO pasa por la función `panel-ceo`, que comprueba antes que quien llama es CEO y tiene la cuenta activa.
- Bloquear una cuenta también bloquea el usuario en Supabase. Esa persona ya no puede entrar ni renovar la sesión, y pierde el acceso al recargar la web.

Probado el 25/11/2026 sin proyecto real:
- El SQL, en un Postgres de prueba (PGlite) con un esquema `auth` de imitación.
- La función del panel y `assets/cuentas.js`, contra una imitación de Supabase: entrar, cuenta bloqueada, panel, alta, bloqueo, contraseñas, renovación de la sesión y eliminación.

Conectado el 26/11/2026 al proyecto `ketaoqjxsqeczsefqzhf` (región eu-west-1, Irlanda), con la migración aplicada,
la función `panel-ceo` desplegada y el alta del CEO y de los 11 agentes hecha con `alta-equipo.sql`. Comprobado sin
entrar: la tabla y las funciones están cerradas para la clave pública y la función responde «permiso» sin sesión.
El mismo día hubo que añadir `migrations/20261126100000_permisos_panel_ceo.sql`: los proyectos nuevos de Supabase no dan
permisos por defecto en las tablas nuevas, y la función del panel (rol `service_role`) no podía leer las cuentas.

## Montarlo (una vez)

1. **Cuenta.** En https://supabase.com, «Start your project». Te registras con el correo de Sebalcab y una
   contraseña tuya, y confirmas el correo.
2. **Proyecto.** «New project»:
   - Organización: SBC Grupo Sebalcab, plan Free.
   - Nombre: `catalogo-icsa`.
   - Contraseña de la base de datos: guárdala en tu gestor de contraseñas. No hace falta pasársela a nadie.
   - Región: **Central EU (Frankfurt)**.
   - Deja activada la «Data API».
3. **Cerrar el registro público.** En Authentication › Sign In / Providers, desactiva «Allow new users to sign up».
   Las cuentas solo las crea el CEO. En el proyecto real se cerró con `supabase config push` (`enable_signup = false`
   en `config.toml`). Ojo: ese comando sube todo `config.toml` y pone los valores por defecto de la herramienta en lo
   que no esté escrito, por eso `config.toml` lleva copiados los ajustes de Auth del proyecto. Antes de usarlo, mira
   la diferencia que enseña con `--agent no` y contesta «n».
4. **Base de datos.** En SQL Editor › New query, pega entero `migrations/20261125180000_cuentas_comerciales.sql`
   y pulsa Run.
5. **Primer CEO.**
   1. En Authentication › Users › Add user › Create new user, pon el correo de `primer-ceo.sql` y tu contraseña, y
      marca «Auto Confirm User».
   2. En SQL Editor, pega `primer-ceo.sql` y pulsa Run.
6. **Función del panel CEO.** En Terminal, desde la carpeta del catálogo. `<ref>` es el código del proyecto, el que va
   en su dirección: `https://<ref>.supabase.co`.

   ```bash
   supabase login
   ```

   ```bash
   supabase functions deploy panel-ceo --project-ref <ref> --no-verify-jwt --use-api
   ```

   Si la web se publica en otra dirección distinta de `rubxy-space.github.io`, avisa a la función de las direcciones
   que pueden llamarla:

   ```bash
   supabase secrets set ORIGENES=https://rubxy-space.github.io,http://localhost:8125 --project-ref <ref>
   ```

7. **Conectar la web.** En Project Settings › API Keys, copia la «Project URL» y la «Publishable key» (o la «anon
   public» de las claves antiguas) en `assets/config-cuentas.js`. **Nunca** la «secret key» ni la «service_role».
8. **Probar.** Abre http://localhost:8125, entra con tu usuario de CEO, ve a «Panel CEO» › «Nuevo comercial» y prueba
   a entrar con esa cuenta en otra ventana privada.

## Cosas que saber del plan gratuito

- Si pasa una semana sin que nadie entre, Supabase pausa el proyecto. Nadie puede entrar hasta que se reactiva con
  un botón desde su panel. No se pierde nada.
- No hace copias de seguridad automáticas. Con pocas cuentas basta con «Exportar CSV» de vez en cuando.
- El plan Pro (25 $ al mes) no se pausa y guarda copias diarias de 7 días.

## Lo siguiente

Hoy las cuentas solo ocultan el catálogo en la pantalla: `data/catalogo.js` y las fotos siguen siendo públicos en
GitHub Pages. Para cerrarlos del todo, hay que subirlos a un almacén privado de Supabase (Storage) y que la web
los pida con la sesión abierta. El catálogo con fotos pesa unos 4,4 MB y el plan gratuito da 1 GB.
