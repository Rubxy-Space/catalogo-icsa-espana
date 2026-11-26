-- Catálogo General ICSA España · cuentas del equipo comercial
--
-- Cada cuenta es un usuario de Supabase Auth (correo y contraseña) más una fila en public.cuentas.
-- Los comerciales entran con un usuario: su correo en Auth es usuario@usuarios.sebalcab.es (no existe ni recibe nada).
-- Con la clave pública nadie lee ni escribe la tabla directamente:
--   · cada comercial lee y cambia lo suyo con las funciones mi_cuenta, registrar_acceso y actualizar_mi_cuenta;
--   · el panel CEO pasa por la función del servidor «panel-ceo» (supabase/functions/panel-ceo), que comprueba
--     que quien llama es CEO y usa la clave secreta.
-- El primer CEO se da de alta a mano: ver supabase/LEEME-supabase.md.

create table public.cuentas (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique check (email = lower(email) and char_length(email) <= 90),
  rol text not null default 'comercial' check (rol in ('comercial', 'ceo')),
  estado text not null default 'activa' check (estado in ('activa', 'bloqueada')),
  nombre text not null default '' check (char_length(nombre) <= 60),
  telefono text not null default '' check (char_length(telefono) <= 20),
  zona text not null default '' check (char_length(zona) <= 80),
  agente text not null default '' check (agente ~ '^[0-9]{0,8}$'),
  notas text not null default '' check (char_length(notas) <= 500),
  creada timestamptz not null default now(),
  creada_por text not null default '',
  revisada timestamptz,          -- último bloqueo o desbloqueo
  revisada_por text not null default '',
  ultimo_acceso timestamptz,
  clave_provisional boolean not null default false  -- la puso el CEO: hay que cambiarla antes de usar el catálogo
);

comment on table public.cuentas is 'Cuentas del equipo comercial del Catálogo General ICSA España. Se gestionan desde el panel CEO.';

-- sin políticas: con la clave pública la tabla queda cerrada; la clave secreta (solo en el servidor) se salta estas reglas
alter table public.cuentas enable row level security;
revoke all on table public.cuentas from anon, authenticated;

-- ---------------------------------------------------------------------------------------------- funciones del comercial
-- Todas miran solo la cuenta de quien tiene la sesión abierta (auth.uid()) y solo si está activa.
-- Las notas internas no salen nunca: solo las ve el CEO desde su panel.

create or replace function public.mi_cuenta()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'id', c.id, 'email', c.email, 'rol', c.rol, 'estado', c.estado, 'nombre', c.nombre, 'telefono', c.telefono,
    'zona', c.zona, 'agente', c.agente, 'creada', c.creada, 'ultimoAcceso', c.ultimo_acceso,
    'claveProvisional', c.clave_provisional
  )
  from public.cuentas c
  where c.id = auth.uid() and c.estado = 'activa';
$$;

-- se llama justo después de entrar: apunta el último acceso y devuelve la cuenta (null si no hay o está bloqueada)
create or replace function public.registrar_acceso()
returns json
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.cuentas set ultimo_acceso = now() where id = auth.uid() and estado = 'activa';
  return public.mi_cuenta();
end;
$$;

-- el comercial puede cambiar su nombre y su teléfono; la zona, el correo y el código de agente los cambia el CEO
create or replace function public.actualizar_mi_cuenta(p_nombre text, p_telefono text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text := btrim(coalesce(p_nombre, ''));
  v_telefono text := btrim(coalesce(p_telefono, ''));
begin
  if v_nombre = '' or char_length(v_nombre) > 60
     or char_length(v_telefono) > 20 or char_length(regexp_replace(v_telefono, '\D', '', 'g')) < 9 then
    raise exception 'datos' using errcode = '22023';
  end if;
  update public.cuentas set nombre = v_nombre, telefono = v_telefono
  where id = auth.uid() and estado = 'activa';
  if not found then
    raise exception 'permiso' using errcode = '42501';
  end if;
  return public.mi_cuenta();
end;
$$;

-- se llama después de cambiar la contraseña en Auth: deja de pedir el cambio
create or replace function public.clave_cambiada()
returns json
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.cuentas set clave_provisional = false where id = auth.uid() and estado = 'activa';
  return public.mi_cuenta();
end;
$$;

revoke all on function public.mi_cuenta() from public, anon;
revoke all on function public.registrar_acceso() from public, anon;
revoke all on function public.actualizar_mi_cuenta(text, text) from public, anon;
revoke all on function public.clave_cambiada() from public, anon;
grant execute on function public.mi_cuenta() to authenticated;
grant execute on function public.registrar_acceso() to authenticated;
grant execute on function public.actualizar_mi_cuenta(text, text) to authenticated;
grant execute on function public.clave_cambiada() to authenticated;

-- ---------------------------------------------------------------------------------------------- primer CEO
-- Convierte en CEO a un usuario que ya existe en Authentication. Solo se puede ejecutar desde el editor SQL
-- del panel de Supabase (no desde la web): ver supabase/LEEME-supabase.md.
create or replace function public.hacer_ceo(p_email text, p_nombre text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cuentas (id, email, rol, estado, nombre)
  select u.id, lower(u.email), 'ceo', 'activa', left(btrim(coalesce(p_nombre, '')), 60)
  from auth.users u
  where lower(u.email) = lower(btrim(p_email))
  on conflict (id) do update set rol = 'ceo', estado = 'activa';
  if not found then
    raise exception 'No hay ningún usuario con el correo % en Authentication. Créalo primero en Authentication > Users.', p_email;
  end if;
end;
$$;

revoke all on function public.hacer_ceo(text, text) from public, anon, authenticated;
