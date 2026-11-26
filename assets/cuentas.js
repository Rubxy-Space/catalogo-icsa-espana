/* Catálogo General ICSA España · cuentas del equipo comercial y panel CEO (capa de datos)

   Las cuentas son solo para los comerciales de Sebalcab: no hay solicitud de cuenta pública, las crea el CEO.
   Las pantallas solo hablan con window.ICSACuentas, que tiene dos modos con las mismas funciones y respuestas:
   · «supabase»: cuentas de verdad. Se activa al poner la dirección y la clave pública del proyecto en
     assets/config-cuentas.js. Contraseñas y permisos los comprueba Supabase (ver supabase/LEEME-supabase.md).
   · «demo»: guarda las cuentas en este navegador y solo se activa en el ordenador de desarrollo (localhost)
     cuando no hay proyecto configurado. No protege nada: sirve para ver y probar las pantallas.

   Cada comercial entra con un usuario («juanperez»): por dentro es el correo usuario@usuarios.sebalcab.es, que no
   existe ni recibe nada (Supabase pide un correo por cuenta). Quien tenga un correo de verdad, como el CEO, entra
   con él. Las cuentas nuevas o con la contraseña restablecida llevan claveProvisional: hasta que la cambian en
   «Mi cuenta», el catálogo no deja ver nada más.

   Todas las funciones devuelven una promesa. Los errores llevan e.codigo:
   credenciales, bloqueada, existe, permiso, no-existe, propia, datos, red, servidor, muchos-intentos,
   misma-clave, clave-debil. */
(function () {
  "use strict";

  var LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
  var CONFIG = window.ICSA_CUENTAS || {};
  var MODO = CONFIG.modo || (CONFIG.url && CONFIG.clave ? "supabase" : LOCAL ? "demo" : "");

  var API = { modo: MODO, disponible: !!MODO };
  window.ICSACuentas = API;

  // usuario <-> correo interno de Supabase (mismo dominio en los dos modos)
  var DOMINIO = "usuarios.sebalcab.es";
  var RE_USUARIO = /^[a-z0-9][a-z0-9._-]{1,39}$/;
  function plano(s) { return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, ""); }
  // lo que se escribe en «Usuario»: «Juan Pérez» -> juanperez@usuarios.sebalcab.es; un correo se deja tal cual
  function aCorreo(txt) {
    var t = String(txt || "").trim().toLowerCase();
    return t.indexOf("@") >= 0 ? t : plano(t) + "@" + DOMINIO;
  }
  API.usuario = function (email) {
    var e = String(email || ""), fin = "@" + DOMINIO;
    return e.slice(-fin.length) === fin ? e.slice(0, -fin.length) : e;
  };
  API.usuarioValido = function (txt) {
    var t = String(txt || "").trim();
    return t.indexOf("@") >= 0 ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) : RE_USUARIO.test(plano(t));
  };
  API.aCorreo = aCorreo;
  document.documentElement.classList.toggle("cuentas", !!MODO); // con cuentas, el catálogo pide entrar
  if (MODO === "supabase") { modoSupabase(); return; }
  if (MODO !== "demo") return; // sin servidor configurado y fuera de local: las pantallas de cuentas no se muestran

  // v3: comerciales con usuario (la v1 eran cuentas de clientes y la v2 entraba con correo; se descartan)
  var CLAVE_DATOS = "icsa-cuentas-demo-v3", CLAVE_SESION = "icsa-sesion-demo-v3";
  try { ["v1", "v2"].forEach(function (v) { localStorage.removeItem("icsa-cuentas-demo-" + v); localStorage.removeItem("icsa-sesion-demo-" + v); }); } catch (e) { /* sin almacenamiento */ }
  var EDITABLES = ["nombre", "telefono", "email", "zona", "agente", "notas", "rol", "estado"];
  var PROPIOS = ["nombre", "telefono"]; // lo que un comercial puede cambiar de su propia cuenta

  function fallo(codigo, msg) { var e = new Error(msg || codigo); e.codigo = codigo; return Promise.reject(e); }
  function espera(v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 220); }); }
  function ahora() { return new Date().toISOString(); }
  function normEmail(s) { return aCorreo(s); }
  function copia(o) { return o ? JSON.parse(JSON.stringify(o)) : o; }
  function azar(n) {
    var a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (var i = 0; i < n; i++) a[i] = Math.random() * 256;
    return a;
  }
  function nuevoId() { return "c" + Array.prototype.map.call(azar(8), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function claveProvisional() {
    var A = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789", a = azar(10), r = "";
    for (var i = 0; i < a.length; i++) r += A[a[i] % A.length];
    return r.slice(0, 5) + "-" + r.slice(5);
  }
  // huella de la contraseña: en el modo real la guarda y la comprueba el servidor, nunca el navegador
  function huella(txt) {
    var t = "icsa-demo|" + txt;
    if (window.crypto && crypto.subtle && window.isSecureContext) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
      });
    }
    var h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return Promise.resolve("f" + h.toString(16));
  }

  // ---- almacén del modo demo
  var datos = null;
  function leer() {
    if (datos) return Promise.resolve(datos);
    try { datos = JSON.parse(localStorage.getItem(CLAVE_DATOS)); } catch (e) { datos = null; }
    if (datos && datos.cuentas) return Promise.resolve(datos);
    return sembrar();
  }
  function guardar() { try { localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos)); } catch (e) { /* almacenamiento no disponible */ } }
  // cuentas inventadas para probar; las claves de prueba están en LEEME.md (apartado «Modo de prueba»)
  var SEMILLA = [
    { email: "ceo@demo.local", clave: "ceo-demo-2026", rol: "ceo", estado: "activa", nombre: "Dirección (cuenta de prueba)", telefono: "985 016 946", zona: "Toda España", dias: 200 },
    { email: "comercial1@" + DOMINIO, clave: "comercial-demo-2026", rol: "comercial", estado: "activa", nombre: "Comercial de prueba 1", telefono: "600 000 001", zona: "Asturias", agente: "1", dias: 180, acceso: 0 },
    { email: "comercial2@" + DOMINIO, clave: "comercial-demo-2026", rol: "comercial", estado: "activa", nombre: "Comercial de prueba 2", telefono: "600 000 002", zona: "León y Zamora", agente: "2", dias: 150, acceso: 3 },
    { email: "comercial3@" + DOMINIO, clave: "comercial-demo-2026", rol: "comercial", estado: "activa", nombre: "Comercial de prueba 3", telefono: "600 000 003", zona: "Cantabria y País Vasco", agente: "3", dias: 90, acceso: 12 },
    { email: "comercial4@" + DOMINIO, clave: "comercial-demo-2026", rol: "comercial", estado: "activa", nombre: "Comercial de prueba 4", telefono: "600 000 004", zona: "Galicia", dias: 2 },
    { email: "comercial5@" + DOMINIO, clave: "comercial-demo-2026", rol: "comercial", estado: "bloqueada", nombre: "Comercial de prueba 5", telefono: "600 000 005", zona: "Madrid", agente: "5", dias: 300, acceso: 60, notas: "Bloqueada de prueba: ya no trabaja con Sebalcab." }
  ];
  function haceDias(n) { return new Date(Date.now() - n * 864e5).toISOString(); }
  function sembrar() {
    datos = { cuentas: [], claves: {} };
    return Promise.all(SEMILLA.map(function (s) {
      var f = haceDias(s.dias);
      var c = {
        id: nuevoId(), email: s.email, rol: s.rol, estado: s.estado, nombre: s.nombre, telefono: s.telefono, zona: s.zona || "",
        agente: s.agente || "", notas: s.notas || "", creada: f, creadaPor: s.rol === "ceo" ? "" : "ceo@demo.local",
        revisada: s.estado === "bloqueada" ? haceDias(30) : "", revisadaPor: s.estado === "bloqueada" ? "ceo@demo.local" : "",
        ultimoAcceso: s.acceso != null ? haceDias(s.acceso) : ""
      };
      datos.cuentas.push(c);
      return huella(s.clave).then(function (h) { datos.claves[c.id] = h; });
    })).then(function () { guardar(); return datos; });
  }
  function porId(id) { return datos.cuentas.find(function (c) { return c.id === id; }); }
  function porEmail(e) { e = normEmail(e); return datos.cuentas.find(function (c) { return c.email === e; }); }

  // ---- sesión
  var oyentes = [];
  function idSesion() { try { return (JSON.parse(localStorage.getItem(CLAVE_SESION)) || {}).id || null; } catch (e) { return null; } }
  function avisarCambio() { API.sesion().then(function (c) { oyentes.forEach(function (f) { f(c); }); }); }
  function yo() {
    var id = idSesion(), c = id && porId(id);
    return c && c.estado === "activa" ? c : null;
  }
  function abrirSesion(c) {
    c.ultimoAcceso = ahora(); guardar();
    try { localStorage.setItem(CLAVE_SESION, JSON.stringify({ id: c.id })); } catch (e) { /* sin almacenamiento */ }
    avisarCambio();
    return espera(copia(c));
  }
  function soloCeo() {
    return leer().then(function () {
      var c = yo();
      return c && c.rol === "ceo" ? c : fallo("permiso", "Solo el CEO puede hacer esto.");
    });
  }
  window.addEventListener("storage", function (ev) {
    if (ev.key === CLAVE_SESION || ev.key === CLAVE_DATOS) { datos = null; avisarCambio(); }
  });

  API.alCambiar = function (f) { oyentes.push(f); };
  API.sesion = function () { return leer().then(function () { return copia(yo()); }); };
  API.entrar = function (email, clave) {
    return leer().then(function () {
      var c = porEmail(email);
      return huella(clave).then(function (h) {
        if (!c || datos.claves[c.id] !== h) return espera().then(function () { return fallo("credenciales"); });
        if (c.estado !== "activa") return espera().then(function () { return fallo("bloqueada"); });
        return abrirSesion(c);
      });
    });
  };
  API.salir = function () {
    try { localStorage.removeItem(CLAVE_SESION); } catch (e) { /* sin almacenamiento */ }
    avisarCambio();
    return Promise.resolve();
  };
  API.actualizarPropia = function (cambios) {
    return leer().then(function () {
      var c = yo();
      if (!c) return fallo("permiso");
      PROPIOS.forEach(function (k) { if (k in cambios) c[k] = String(cambios[k]).trim(); });
      guardar(); avisarCambio();
      return espera(copia(c));
    });
  };
  API.cambiarClave = function (actual, nueva) {
    return leer().then(function () {
      var c = yo();
      if (!c) return fallo("permiso");
      return huella(actual).then(function (h) {
        if (datos.claves[c.id] !== h) return espera().then(function () { return fallo("credenciales"); });
        if (actual === nueva) return espera().then(function () { return fallo("misma-clave"); });
        return huella(nueva).then(function (h2) {
          datos.claves[c.id] = h2; c.claveProvisional = false; guardar(); avisarCambio();
          return espera(copia(c));
        });
      });
    });
  };

  // ---- panel CEO
  API.listar = function () { return soloCeo().then(function () { return espera(copia(datos.cuentas)); }); };
  API.obtener = function (id) {
    return soloCeo().then(function () { var c = porId(id); return c ? copia(c) : fallo("no-existe"); });
  };
  API.actualizar = function (id, cambios) {
    return soloCeo().then(function (ceo) {
      var c = porId(id);
      if (!c) return fallo("no-existe");
      if (c.id === ceo.id && (("estado" in cambios && cambios.estado !== "activa") || ("rol" in cambios && cambios.rol !== "ceo")))
        return fallo("propia", "No puedes bloquear ni quitar el rol de CEO a tu propia cuenta.");
      if ("email" in cambios) {
        var otro = porEmail(cambios.email);
        if (otro && otro.id !== c.id) return fallo("existe", "Ya hay una cuenta con ese usuario.");
        cambios.email = normEmail(cambios.email);
      }
      var antes = c.estado;
      EDITABLES.forEach(function (k) { if (k in cambios) c[k] = String(cambios[k] == null ? "" : cambios[k]).trim(); });
      if (c.rol !== "ceo") c.rol = "comercial";
      if (c.estado !== "bloqueada") c.estado = "activa";
      if (c.estado !== antes) { c.revisada = ahora(); c.revisadaPor = ceo.email; }
      guardar(); avisarCambio();
      return espera(copia(c));
    });
  };
  API.crear = function (d) {
    return soloCeo().then(function (ceo) {
      if (porEmail(d.email)) return fallo("existe", "Ya hay una cuenta con ese usuario.");
      var c = {
        id: nuevoId(), email: normEmail(d.email), rol: d.rol === "ceo" ? "ceo" : "comercial", estado: "activa",
        nombre: String(d.nombre || "").trim(), telefono: String(d.telefono || "").trim(), zona: String(d.zona || "").trim(),
        agente: String(d.agente || "").trim(), notas: String(d.notas || "").trim(),
        creada: ahora(), creadaPor: ceo.email, revisada: "", revisadaPor: "", ultimoAcceso: "", claveProvisional: true
      };
      var prov = claveProvisional();
      return huella(prov).then(function (h) {
        datos.cuentas.push(c); datos.claves[c.id] = h; guardar();
        return espera({ cuenta: copia(c), clave: prov });
      });
    });
  };
  API.restablecerClave = function (id) {
    return soloCeo().then(function () {
      var c = porId(id);
      if (!c) return fallo("no-existe");
      var prov = claveProvisional();
      return huella(prov).then(function (h) { datos.claves[c.id] = h; c.claveProvisional = true; guardar(); return espera(prov); });
    });
  };
  API.eliminar = function (id) {
    return soloCeo().then(function (ceo) {
      if (id === ceo.id) return fallo("propia", "No puedes eliminar tu propia cuenta.");
      var i = datos.cuentas.findIndex(function (c) { return c.id === id; });
      if (i < 0) return fallo("no-existe");
      datos.cuentas.splice(i, 1); delete datos.claves[id]; guardar();
      return espera(true);
    });
  };
  // atajo del modo de prueba: abre la sesión de la cuenta inventada de ese rol sin escribir la contraseña
  API.entrarDemo = function (rol) {
    return leer().then(function () {
      var s = SEMILLA.find(function (x) { return rol === "ceo" ? x.rol === "ceo" : x.rol === "comercial" && x.estado === "activa"; });
      var c = s && porEmail(s.email);
      if (!c || c.estado !== "activa") return fallo("no-existe", "Esa cuenta de prueba ya no está activa.");
      return abrirSesion(c);
    });
  };
  // vuelve a las cuentas de prueba iniciales (solo modo demo)
  API.reiniciarDemo = function () {
    try { localStorage.removeItem(CLAVE_DATOS); localStorage.removeItem(CLAVE_SESION); } catch (e) { /* sin almacenamiento */ }
    datos = null;
    return leer().then(function () { avisarCambio(); return true; });
  };

  // ---------------------------------------------------------------------------- modo Supabase (cuentas de verdad)
  // Habla con Supabase por HTTP, sin librerías: Auth para entrar, salir y cambiar la contraseña; las funciones SQL
  // mi_cuenta, registrar_acceso, actualizar_mi_cuenta y clave_cambiada para la cuenta propia; y la función del servidor «panel-ceo»
  // para todo lo del CEO (código en supabase/). Usa las funciones de ayuda de arriba (fallo, copia, normEmail).
  function modoSupabase() {
    var BASE = String(CONFIG.url).replace(/\/+$/, ""), CLAVE_PUB = String(CONFIG.clave);
    var CLAVE_SESION = "icsa-sesion-supabase-v1";
    var VIGENCIA = 5 * 60 * 1000; // cada 5 minutos se vuelve a comprobar que la cuenta sigue activa
    var auth = leerAuth(), cuenta = null, comprobada = 0, oyentes = [], refresco = null;

    function leerAuth() { try { return JSON.parse(localStorage.getItem(CLAVE_SESION)); } catch (e) { return null; } }
    function guardarAuth(a) {
      auth = a;
      try { if (a) localStorage.setItem(CLAVE_SESION, JSON.stringify(a)); else localStorage.removeItem(CLAVE_SESION); } catch (e) { /* sin almacenamiento */ }
    }
    function deToken(d, email) {
      guardarAuth({
        a: d.access_token, r: d.refresh_token, x: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
        email: normEmail((d.user && d.user.email) || email)
      });
    }
    // petición a Supabase: da { ok, estado, datos } o falla con «red» si no hay conexión
    function pedir(ruta, metodo, cuerpo, tk) {
      var h = { apikey: CLAVE_PUB, "Content-Type": "application/json" };
      if (tk) h.Authorization = "Bearer " + tk;
      return fetch(BASE + ruta, { method: metodo, headers: h, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }).then(function (r) {
        return r.text().then(function (t) {
          var d = null;
          try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
          return { ok: r.ok, estado: r.status, datos: d };
        });
      }, function () { return fallo("red", "Sin conexión con el servidor de cuentas."); });
    }
    function textoError(r) { return JSON.stringify(r.datos || "").toLowerCase(); }
    // token de la sesión, renovado si caduca en menos de un minuto
    function token() {
      if (!auth) return Promise.resolve(null);
      if (auth.x - 60 > Date.now() / 1000) return Promise.resolve(auth.a);
      if (!refresco) {
        refresco = pedir("/auth/v1/token?grant_type=refresh_token", "POST", { refresh_token: auth.r }).then(function (r) {
          refresco = null;
          if (r.ok) { deToken(r.datos, auth && auth.email); return auth.a; }
          if (r.estado >= 400 && r.estado < 500) guardarAuth(null); // sesión caducada o acceso bloqueado
          return null;
        }, function (e) { refresco = null; throw e; });
      }
      return refresco;
    }
    function conSesion(ruta, cuerpo) {
      return token().then(function (tk) { return tk ? pedir(ruta, "POST", cuerpo || {}, tk) : fallo("permiso"); });
    }
    function rpc(nombre, args) {
      return conSesion("/rest/v1/rpc/" + nombre, args).then(function (r) {
        if (r.ok) return r.datos;
        var t = textoError(r);
        return fallo(r.estado === 401 || /permiso/.test(t) ? "permiso" : /datos/.test(t) ? "datos" : "servidor");
      });
    }
    function panel(accion, extra) {
      var cuerpo = { accion: accion };
      for (var k in extra || {}) cuerpo[k] = extra[k];
      return conSesion("/functions/v1/panel-ceo", cuerpo).then(function (r) {
        if (r.datos && r.datos.ok) return r.datos.datos;
        return fallo((r.datos && r.datos.codigo) || (r.estado === 401 ? "permiso" : "servidor"));
      });
    }
    function ponerCuenta(c) { cuenta = c || null; comprobada = Date.now(); return copia(cuenta); }
    function avisarCambio() { var c = copia(cuenta); oyentes.forEach(function (f) { f(c); }); }
    function cerrar() {
      var a = auth;
      guardarAuth(null); ponerCuenta(null);
      if (a) pedir("/auth/v1/logout", "POST", {}, a.a).catch(function () { /* aquí ya está cerrada */ });
    }
    // sesión abierta, renovada o cerrada en otra pestaña
    window.addEventListener("storage", function (ev) {
      if (ev.key !== CLAVE_SESION) return;
      auth = leerAuth(); comprobada = 0;
      API.sesion().then(avisarCambio);
    });

    API.alCambiar = function (f) { oyentes.push(f); };
    API.sesion = function () {
      if (!auth) return Promise.resolve(ponerCuenta(null));
      if (comprobada && Date.now() - comprobada < VIGENCIA) return Promise.resolve(copia(cuenta));
      return rpc("mi_cuenta").then(function (c) {
        if (!c) cerrar(); // bloqueada, eliminada o sin ficha
        return ponerCuenta(c);
      }, function (e) {
        if (e.codigo === "permiso") { cerrar(); return null; }
        cuenta = null; comprobada = 0; // sin conexión: se vuelve a intentar en la siguiente pantalla
        return null;
      });
    };
    API.entrar = function (email, clave) {
      return pedir("/auth/v1/token?grant_type=password", "POST", { email: normEmail(email), password: clave }).then(function (r) {
        if (!r.ok) {
          return fallo(/banned/.test(textoError(r)) ? "bloqueada" : r.estado === 429 ? "muchos-intentos" : r.estado >= 500 ? "servidor" : "credenciales");
        }
        deToken(r.datos, email);
        return rpc("registrar_acceso").then(function (c) {
          if (!c) { cerrar(); return fallo("bloqueada"); }
          ponerCuenta(c); avisarCambio();
          return copia(c);
        });
      });
    };
    API.salir = function () { cerrar(); avisarCambio(); return Promise.resolve(); };
    API.actualizarPropia = function (d) {
      return rpc("actualizar_mi_cuenta", { p_nombre: d.nombre, p_telefono: d.telefono }).then(function (c) {
        if (!c) return fallo("permiso");
        ponerCuenta(c); avisarCambio();
        return copia(c);
      });
    };
    API.cambiarClave = function (actual, nueva) {
      var email = (cuenta && cuenta.email) || (auth && auth.email);
      if (!email) return fallo("permiso");
      // la contraseña actual se comprueba entrando otra vez con ella
      return pedir("/auth/v1/token?grant_type=password", "POST", { email: email, password: actual }).then(function (r) {
        if (!r.ok) return fallo(r.estado === 429 ? "muchos-intentos" : "credenciales");
        deToken(r.datos, email);
        return pedir("/auth/v1/user", "PUT", { password: nueva }, auth.a).then(function (r2) {
          if (r2.ok) {
            // ya no es provisional: el catálogo deja de pedir el cambio
            return rpc("clave_cambiada").then(function (c) { ponerCuenta(c); avisarCambio(); return copia(c); });
          }
          var t = textoError(r2);
          return fallo(/same_password|different from the old/.test(t) ? "misma-clave" : /weak|password/.test(t) ? "clave-debil" : "servidor");
        });
      });
    };
    API.listar = function () { return panel("listar"); };
    API.obtener = function (id) { return panel("obtener", { id: id }); };
    API.actualizar = function (id, cambios) {
      var x = copia(cambios); if ("email" in x) x.email = aCorreo(x.email);
      return panel("actualizar", { id: id, cambios: x }).then(function (c) {
        if (cuenta && c.id === cuenta.id) { comprobada = 0; API.sesion().then(avisarCambio); } // el CEO cambió su propia ficha
        return c;
      });
    };
    API.crear = function (d) {
      var x = copia(d); x.email = aCorreo(x.email);
      return panel("crear", { datos: x });
    };
    API.restablecerClave = function (id) { return panel("restablecer", { id: id }); };
    API.eliminar = function (id) { return panel("eliminar", { id: id }); };
  }
})();
