-- La función del servidor «panel-ceo» trabaja con la clave secreta (rol service_role). Los proyectos nuevos de
-- Supabase ya no dan permisos por defecto en las tablas nuevas, así que hay que darle a ese rol los que necesita.
-- anon y authenticated siguen sin ninguno: los comerciales solo pasan por las funciones de la migración anterior.
grant select, insert, update, delete on table public.cuentas to service_role;
