// Catálogo General ICSA España · función del servidor «panel-ceo»
//
// Todo lo del panel CEO pasa por aquí, porque necesita la clave secreta (crear usuarios, cambiar contraseñas,
// bloquear el acceso, eliminar). Primero comprueba que quien llama tiene la sesión abierta y que su cuenta es de
// CEO y está activa; después hace la acción. Responde siempre { ok: true, datos } o { ok: false, codigo }, con los
// mismos códigos de error que el modo de prueba de assets/cuentas.js.
//
// Se despliega con: supabase functions deploy panel-ceo --no-verify-jwt --use-api
// (la sesión la comprueba la propia función). Ver supabase/LEEME-supabase.md.

import { createClient } from "jsr:@supabase/supabase-js@2";

type Fila = Record<string, string | boolean | null>;
type Datos = Record<string, unknown>;

const BLOQUEO = "876000h"; // unos cien años: bloqueada hasta que el CEO la desbloquee
const LIMITES: Record<string, number> = { nombre: 60, telefono: 20, email: 90, zona: 80, agente: 8, notas: 500 };
const EDITABLES = ["nombre", "telefono", "email", "zona", "agente", "notas", "rol", "estado"];
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Fallo extends Error {
  codigo: string;
  estado: number;
  constructor(codigo: string, estado = 400) { super(codigo); this.codigo = codigo; this.estado = estado; }
}

// misma forma que las cuentas del modo de prueba (assets/cuentas.js)
function aCuenta(f: Fila) {
  return {
    id: f.id, email: f.email, rol: f.rol, estado: f.estado, nombre: f.nombre, telefono: f.telefono, zona: f.zona,
    agente: f.agente, notas: f.notas, creada: f.creada, creadaPor: f.creada_por, revisada: f.revisada || "",
    revisadaPor: f.revisada_por, ultimoAcceso: f.ultimo_acceso || "", claveProvisional: !!f.clave_provisional,
  };
}

function claveProvisional(): string {
  const A = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (;;) {
    const a = crypto.getRandomValues(new Uint8Array(10));
    let r = "";
    for (const b of a) r += A[b % A.length];
    // con minúscula, mayúscula y número, por si el proyecto exige contraseñas con las tres cosas
    if (/[a-z]/.test(r) && /[A-Z]/.test(r) && /\d/.test(r)) return r.slice(0, 5) + "-" + r.slice(5);
  }
}

// valida y limpia los campos que llegan del panel; con «completa», nombre, teléfono y correo son obligatorios
function limpiar(d: Datos, completa: boolean): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of EDITABLES) {
    if (!(k in d)) continue;
    let v = String(d[k] ?? "").trim();
    if (k === "email") v = v.toLowerCase();
    if (LIMITES[k] && v.length > LIMITES[k]) throw new Fallo("datos");
    if (k === "email" && !RE_EMAIL.test(v)) throw new Fallo("datos");
    if (k === "telefono" && v.replace(/\D/g, "").length < 9) throw new Fallo("datos");
    if (k === "nombre" && !v) throw new Fallo("datos");
    if (k === "agente" && !/^\d*$/.test(v)) throw new Fallo("datos");
    if (k === "rol" && v !== "comercial" && v !== "ceo") throw new Fallo("datos");
    if (k === "estado" && v !== "activa" && v !== "bloqueada") throw new Fallo("datos");
    out[k] = v;
  }
  if (completa && (!out.nombre || !out.telefono || !out.email)) throw new Fallo("datos");
  return out;
}

// el cliente de Supabase con la clave secreta; en las pruebas se cambia por uno de imitación
// deno-lint-ignore no-explicit-any
export function crearManejador(admin: any, origenes: string[]) {
  async function fila(id: unknown): Promise<Fila> {
    const { data, error } = await admin.from("cuentas").select("*").eq("id", String(id || "")).maybeSingle();
    if (error) throw error;
    if (!data) throw new Fallo("no-existe", 404);
    return data;
  }
  async function correoLibre(email: string, id = "") {
    const { data, error } = await admin.from("cuentas").select("id").eq("email", email);
    if (error) throw error;
    if ((data || []).some((x: Fila) => x.id !== id)) throw new Fallo("existe", 409);
  }
  function errorDeAuth(error: { message?: string; code?: string; status?: number } | null) {
    if (!error) return;
    const t = (String(error.code || "") + " " + String(error.message || "")).toLowerCase();
    if (/already|exists|registered/.test(t)) throw new Fallo("existe", 409);
    if (/password/.test(t)) throw new Fallo("clave-debil", 422);
    throw error;
  }

  const ACCIONES: Record<string, (b: Datos, ceo: Fila) => Promise<unknown>> = {
    async listar() {
      const { data, error } = await admin.from("cuentas").select("*").order("nombre");
      if (error) throw error;
      return (data || []).map(aCuenta);
    },
    async obtener(b) {
      return aCuenta(await fila(b.id));
    },
    async actualizar(b, ceo) {
      const c = await fila(b.id);
      const cambios = limpiar((b.cambios || {}) as Datos, false);
      if (c.id === ceo.id && ((cambios.estado && cambios.estado !== "activa") || (cambios.rol && cambios.rol !== "ceo"))) {
        throw new Fallo("propia", 403);
      }
      if (cambios.email && cambios.email !== c.email) {
        await correoLibre(cambios.email, String(c.id));
        const { error } = await admin.auth.admin.updateUserById(c.id, { email: cambios.email, email_confirm: true });
        errorDeAuth(error);
      }
      const nuevo: Record<string, string | boolean | null> = { ...cambios };
      if (cambios.estado && cambios.estado !== c.estado) {
        const { error } = await admin.auth.admin.updateUserById(c.id, { ban_duration: cambios.estado === "bloqueada" ? BLOQUEO : "none" });
        errorDeAuth(error);
        nuevo.revisada = new Date().toISOString();
        nuevo.revisada_por = String(ceo.email);
      }
      if (!Object.keys(nuevo).length) return aCuenta(c);
      const { data, error } = await admin.from("cuentas").update(nuevo).eq("id", c.id).select("*").single();
      if (error) throw error;
      return aCuenta(data);
    },
    async crear(b, ceo) {
      const d = limpiar((b.datos || {}) as Datos, true);
      await correoLibre(d.email);
      const clave = claveProvisional();
      const { data: u, error } = await admin.auth.admin.createUser({ email: d.email, password: clave, email_confirm: true });
      errorDeAuth(error);
      const fila0 = {
        id: u.user.id, email: d.email, rol: d.rol === "ceo" ? "ceo" : "comercial", estado: "activa", nombre: d.nombre,
        telefono: d.telefono, zona: d.zona || "", agente: d.agente || "", notas: d.notas || "", creada_por: String(ceo.email),
        clave_provisional: true,
      };
      const r = await admin.from("cuentas").insert(fila0).select("*").single();
      if (r.error) { await admin.auth.admin.deleteUser(u.user.id); throw r.error; } // sin ficha no debe quedar el usuario
      return { cuenta: aCuenta(r.data), clave };
    },
    async restablecer(b) {
      const c = await fila(b.id);
      const clave = claveProvisional();
      const { error } = await admin.auth.admin.updateUserById(c.id, { password: clave });
      errorDeAuth(error);
      // se le pedirá cambiarla al entrar
      const r = await admin.from("cuentas").update({ clave_provisional: true }).eq("id", c.id);
      if (r.error) throw r.error;
      return clave;
    },
    async eliminar(b, ceo) {
      const c = await fila(b.id);
      if (c.id === ceo.id) throw new Fallo("propia", 403);
      const { error } = await admin.auth.admin.deleteUser(c.id); // borra también su fila de public.cuentas
      errorDeAuth(error);
      return true;
    },
  };

  return async function (req: Request): Promise<Response> {
    const origen = req.headers.get("origin") || "";
    const cabeceras: Record<string, string> = {
      "Access-Control-Allow-Origin": origenes.includes(origen) ? origen : origenes[0],
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Origin",
    };
    const responder = (cuerpo: unknown, estado = 200) => new Response(JSON.stringify(cuerpo), { status: estado, headers: cabeceras });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cabeceras });
    try {
      if (req.method !== "POST") throw new Fallo("datos", 405);
      const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
      const { data: u, error } = token ? await admin.auth.getUser(token) : { data: null, error: true };
      if (error || !u?.user) throw new Fallo("permiso", 401);
      const { data: ceo } = await admin.from("cuentas").select("*").eq("id", u.user.id).maybeSingle();
      if (!ceo || ceo.rol !== "ceo" || ceo.estado !== "activa") throw new Fallo("permiso", 403);
      let b: Datos;
      try { b = await req.json(); } catch { throw new Fallo("datos"); }
      const accion = ACCIONES[String(b.accion)];
      if (!accion) throw new Fallo("datos");
      return responder({ ok: true, datos: await accion(b, ceo) });
    } catch (e) {
      if (e instanceof Fallo) return responder({ ok: false, codigo: e.codigo }, e.estado);
      console.error(e);
      return responder({ ok: false, codigo: "servidor" }, 500);
    }
  };
}

// en Supabase: clave secreta del propio proyecto (o el secreto CLAVE_SECRETA si el proyecto no la da)
// y webs que pueden llamar (secreto ORIGENES, separadas por comas)
if (typeof Deno !== "undefined" && Deno.env.get("SUPABASE_URL")) {
  const secreta = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("CLAVE_SECRETA") || "";
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, secreta, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const origenes = (Deno.env.get("ORIGENES") || "https://rubxy-space.github.io,http://localhost:8125").split(",").map((s) => s.trim());
  Deno.serve(crearManejador(admin, origenes));
}
