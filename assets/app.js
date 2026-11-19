/* Catálogo ICSA España 2026 · lógica de la interfaz (sin dependencias) */
(function () {
  "use strict";

  var D = window.ICSA;
  var app = document.getElementById("app");
  if (!D) {
    app.innerHTML = '<div class="envoltura pagina"><h1>No se han podido cargar los datos</h1><p>Falta el archivo data/catalogo.js.</p></div>';
    return;
  }

  // ------------------------------------------------------------------ utilidades
  var PDF = D.fuente.pdf;
  var FAM = {}; D.familias.forEach(function (f) { FAM[f.id] = f; });
  var PROD = {}; D.productos.forEach(function (p) { PROD[p.id] = p; });
  var COLS_CODIGO = ["Código", "Latón", "Níquel"];
  var SIN_FILTRO = { "Código": 1, "Latón": 1, "Níquel": 1, "Caja": 1, "Embalaje": 1, "Descripción": 1, "Adaptable para": 1, "Pág.": 1, "Art.": 1, "Peso (kg)": 1 };
  var NUMERICAS = { "L": 1, "A": 1, "B": 1, "C": 1, "D": 1, "E": 1, "F": 1, "H": 1, "S": 1, "ØD": 1, "Caja": 1, "Embalaje": 1, "Peso (kg)": 1, "Ancho máx. (mm)": 1, "L (mm)": 1, "Largo (mm)": 1, "Cilindro": 0 };
  var COLS_ANCHAS = { "Adaptable para": 1, "Descripción": 1 };

  var ICO = {
    copiar: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
    mas: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    menos: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    hecho: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>',
    borrar: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    externo: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    aviso: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>',
    correo: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    tabla: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg>'
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function plano(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function normCod(s) { return String(s).toUpperCase().replace(/[^A-Z0-9§]/g, ""); }
  function num(n) { return n.toLocaleString("es-ES"); }
  function uniq(a) { var v = []; a.forEach(function (x) { if (v.indexOf(x) < 0) v.push(x); }); return v; }
  function ordenValores(a) {
    return a.slice().sort(function (x, y) {
      var nx = parseFloat(String(x).replace(",", ".")), ny = parseFloat(String(y).replace(",", "."));
      if (!isNaN(nx) && !isNaN(ny) && nx !== ny) return nx - ny;
      return String(x).localeCompare(String(y), "es");
    });
  }
  function pdfPag(n) { return PDF + "#page=" + n; }
  function idxCodigo(v) {
    var r = [];
    v.cols.forEach(function (c, i) { if (COLS_CODIGO.indexOf(c) >= 0) r.push(i); });
    if (!r.length && v.cols.indexOf("Art.") >= 0) r.push(v.cols.indexOf("Art."));
    return r;
  }
  function esCil(v) { return v.cols[0] === "Leva"; }

  // índice de códigos
  var IDX = [];
  D.productos.forEach(function (p) {
    p.nCodigos = 0;
    p.variantes.forEach(function (v) {
      var ci = idxCodigo(v);
      v.nCodigos = 0;
      v.filas.forEach(function (f, i) {
        ci.forEach(function (k) {
          if (!f[k]) return;
          IDX.push({ cod: f[k], n: normCod(f[k]), p: p, v: v, i: i, k: k });
          v.nCodigos++; p.nCodigos++;
        });
      });
    });
    p.texto = plano([p.nombre, p.sub, p.mod, p.art, FAM[p.fam].nombre].concat(
      p.variantes.map(function (v) { return v.nombre + " " + (v.art || ""); })).join(" "));
  });
  D.familias.forEach(function (f) {
    f.nCodigos = D.productos.filter(function (p) { return p.fam === f.id; })
      .reduce(function (s, p) { return s + p.nCodigos; }, 0);
  });

  // ------------------------------------------------------------------ compatibilidades
  var CMP = D.compat || { marcas: [], filas: [], logos: {}, marcas_vacias: [] };
  function logoMarca(m, cls) {
    var l = CMP.logos && CMP.logos[m];
    return l ? '<img class="' + (cls || "logo-marca") + '" src="' + esc(l.src) + '" alt="' + esc(m) + '" loading="lazy" decoding="async">'
      : '<span class="' + (cls || "logo-marca") + ' logo-texto">' + esc(m) + "</span>";
  }
  function compatDe(p) { return CMP.filas.filter(function (f) { return f.pid === p.id; }); }
  function marcasDe(filas) { return CMP.marcas.filter(function (m) { return filas.some(function (f) { return f.refs[m]; }); }); }
  D.productos.forEach(function (p) { p.nMarcas = marcasDe(compatDe(p)).length; });
  // agrupa artículos con las mismas equivalencias (402-60-/70, 402-80 y 402-90)
  function gruposCompat(filas) {
    var g = [];
    filas.forEach(function (f) {
      var clave = JSON.stringify(f.refs) + "|" + (f.vid || "");
      var x = g.find(function (y) { return y.clave === clave; });
      if (x) x.arts.push(f.art); else g.push({ clave: clave, arts: [f.art], refs: f.refs, vid: f.vid });
    });
    return g;
  }
  var N_EQUIV = CMP.filas.reduce(function (s, f) { return s + Object.keys(f.refs).length; }, 0);
  function hrefCompat(f) { return f.pid ? "#/p/" + f.pid + (f.vid ? "/" + f.vid : "") + "?compat=1" : "#/compatibilidades?q=" + encodeURIComponent(f.art); }
  function compatProductoHTML(p) {
    var filas = compatDe(p);
    if (!filas.length) return "";
    return '<section class="compat" id="compatibilidades" aria-labelledby="tit-compat"><h2 id="tit-compat">Compatibilidades</h2>' +
      '<p class="compat__intro">Sustituye a estas referencias de otras marcas, según la tabla de compatibilidades ICSA de junio de 2026. <a href="#/compatibilidades">Ver la tabla completa</a></p>' +
      gruposCompat(filas).map(function (g) {
        var v = g.vid && p.variantes.find(function (x) { return x.id === g.vid; });
        return '<div class="compat__grupo"><h3>ICSA ' + g.arts.map(esc).join(" · ") + (v ? " <small>" + esc(v.nombre) + "</small>" : "") + "</h3>" +
          '<ul class="equivs">' + CMP.marcas.filter(function (m) { return g.refs[m]; }).map(function (m) {
            return '<li class="equiv"><span class="equiv__logo">' + logoMarca(m) + '</span><span class="equiv__ref mono">' + esc(g.refs[m]) + "</span>" +
              '<span class="equiv__nombre">' + esc(m) + "</span>" +
              '<button class="icono-boton equiv__copiar" type="button" data-copiar="' + esc(g.refs[m]) + '" aria-label="Copiar referencia ' + esc(m + " " + g.refs[m]) + '">' + ICO.copiar + "</button></li>";
          }).join("") + "</ul></div>";
      }).join("") + "</section>";
  }

  function resumenFila(v, f, k) {
    var out = [];
    v.cols.forEach(function (c, j) {
      if (COLS_CODIGO.indexOf(c) >= 0 || c === "Caja" || c === "Embalaje" || c === "Pág." || c === "Descripción" || c === "Adaptable para" || c === "Art.") return;
      var val = f[j];
      if (!val) return;
      if (c === "Leva") out.push("leva " + val.toLowerCase());
      else if (/^[A-Z]$|^ØD$/.test(c)) out.push(c + " " + val);
      else if (c === "Mano") out.push(val.toLowerCase());
      else if (c === "DCF" || c === "DCS" || c === "Barras" || c === "Pernio") out.push(c.toLowerCase());
      else out.push(val);
    });
    var col = v.cols[k];
    if (col === "Latón" || col === "Níquel") out.push(col.toLowerCase());
    return out.join(" · ");
  }
  function tituloProducto(p) { return p.mod + " " + p.art; }

  // ------------------------------------------------------------------ aviso flotante
  var avisoEl = document.getElementById("aviso"), avisoT;
  function avisar(msg) {
    avisoEl.textContent = msg;
    avisoEl.classList.add("visible");
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { avisoEl.classList.remove("visible"); }, 2200);
  }
  function copiar(txt, okMsg) {
    function hecho() { avisar(okMsg || ("Copiado: " + txt)); }
    function respaldo() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* sin portapapeles */ }
      ta.remove(); hecho();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(hecho, respaldo);
    else respaldo();
  }

  // ------------------------------------------------------------------ lista
  var CLAVE = "icsa-lista-v1";
  var lista = [];
  try { lista = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { lista = []; }
  var contador = document.getElementById("contador-lista");
  function guardarLista(animar) {
    try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (e) { /* almacenamiento no disponible */ }
    contador.textContent = lista.length;
    if (animar) { contador.classList.remove("salta"); void contador.offsetWidth; contador.classList.add("salta"); }
    if (!listaEl.hidden) pintarLista();
  }
  function anadir(e) {
    var ya = lista.find(function (x) { return x.cod === e.cod; });
    if (ya) ya.cant++;
    else lista.push({ cod: e.cod, titulo: tituloProducto(e.p) + " · " + e.p.nombre, desc: e.v.nombre + (resumenFila(e.v, e.v.filas[e.i], e.k) ? " · " + resumenFila(e.v, e.v.filas[e.i], e.k) : ""), pid: e.p.id, vid: e.v.id, cant: 1 });
    guardarLista(true);
    avisar((ya ? "Una unidad más de " : "Añadido a la lista: ") + e.cod);
  }
  function entradaPor(pid, vid, i, k) {
    var p = PROD[pid], v = p && p.variantes.find(function (x) { return x.id === vid; });
    if (!v) return null;
    return { cod: v.filas[i][k], p: p, v: v, i: +i, k: +k };
  }

  var listaEl = document.getElementById("lista"), velo = document.getElementById("velo");
  var listaCuerpo = document.getElementById("lista-cuerpo"), listaPie = document.getElementById("lista-pie");
  var abrirBtn = document.getElementById("abrir-lista"), cerrarBtn = document.getElementById("cerrar-lista");
  function textoLista() {
    return lista.map(function (x) { return x.cant + " x " + x.cod + "  " + x.titulo + " · " + x.desc; }).join("\n");
  }
  function pintarLista() {
    if (!lista.length) {
      listaCuerpo.innerHTML = '<p class="lista__vacia">La lista está vacía. Usa el botón + de cualquier tabla o del buscador de cilindros para añadir referencias.</p>';
      listaPie.hidden = true;
      return;
    }
    listaPie.hidden = false;
    listaCuerpo.innerHTML = lista.map(function (x, n) {
      return '<div class="item">' +
        '<div><a class="item__cod" href="#/p/' + esc(x.pid) + "/" + esc(x.vid) + "?ref=" + encodeURIComponent(x.cod) + '" data-cerrar>' + esc(x.cod) + "</a></div>" +
        '<div class="item__cant">' +
        '<button class="icono-boton" type="button" data-cant="' + n + '" data-d="-1" aria-label="Quitar una unidad de ' + esc(x.cod) + '">' + ICO.menos + "</button>" +
        '<label class="oculto" for="cant-' + n + '">Cantidad de ' + esc(x.cod) + "</label>" +
        '<input id="cant-' + n + '" type="number" min="1" inputmode="numeric" value="' + x.cant + '" data-cant-input="' + n + '">' +
        '<button class="icono-boton" type="button" data-cant="' + n + '" data-d="1" aria-label="Añadir una unidad de ' + esc(x.cod) + '">' + ICO.mas + "</button>" +
        '<button class="icono-boton" type="button" data-quitar="' + n + '" aria-label="Quitar ' + esc(x.cod) + ' de la lista">' + ICO.borrar + "</button>" +
        "</div>" +
        '<div class="item__desc">' + esc(x.titulo) + "<br>" + esc(x.desc) + "</div></div>";
    }).join("");
    var uds = lista.reduce(function (s, x) { return s + x.cant; }, 0);
    var cuerpo = "Hola, os paso esta lista del catálogo ICSA España 2026:\n\n" + textoLista() + "\n\nNombre:\nEmpresa:\nTeléfono:\n";
    var mailto = "mailto:icsa@sebalcab.es?subject=" + encodeURIComponent("Consulta catálogo ICSA España (" + lista.length + " referencias)") + "&body=" + encodeURIComponent(cuerpo);
    listaPie.innerHTML =
      '<p class="lista__resumen">' + lista.length + (lista.length === 1 ? " referencia" : " referencias") + " · " + uds + (uds === 1 ? " unidad" : " unidades") + "</p>" +
      '<a class="boton" href="' + mailto + '">' + ICO.correo + "Enviar por correo a Sebalcab</a>" +
      '<div class="lista__fila"><button class="boton boton--sec" type="button" data-copiar-lista>' + ICO.copiar + "Copiar lista</button>" +
      '<button class="boton boton--sec" type="button" data-vaciar>' + ICO.borrar + "Vaciar</button></div>";
  }
  var focoPrevio = null;
  function abrirLista() {
    focoPrevio = document.activeElement;
    pintarLista();
    listaEl.hidden = false; velo.hidden = false;
    abrirBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    cerrarBtn.focus();
  }
  function cerrarLista() {
    if (listaEl.hidden) return;
    listaEl.hidden = true; velo.hidden = true;
    abrirBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (focoPrevio && focoPrevio.focus) focoPrevio.focus();
  }
  abrirBtn.addEventListener("click", abrirLista);
  cerrarBtn.addEventListener("click", cerrarLista);
  velo.addEventListener("click", cerrarLista);
  listaEl.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { cerrarLista(); return; }
    if (ev.key !== "Tab") return;
    var f = listaEl.querySelectorAll("a[href], button, input");
    if (!f.length) return;
    var primero = f[0], ultimo = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
  });
  listaEl.addEventListener("click", function (ev) {
    var b = ev.target.closest("button, a");
    if (!b) return;
    if (b.hasAttribute("data-cant")) {
      var it = lista[+b.getAttribute("data-cant")];
      it.cant = Math.max(1, it.cant + (+b.getAttribute("data-d")));
      guardarLista();
      var inp = document.getElementById(b.id || "") || null; if (inp) inp.focus();
    } else if (b.hasAttribute("data-quitar")) {
      var q = lista.splice(+b.getAttribute("data-quitar"), 1)[0];
      guardarLista(); avisar("Quitado de la lista: " + q.cod); cerrarBtn.focus();
    } else if (b.hasAttribute("data-vaciar")) {
      if (window.confirm("¿Vaciar la lista de referencias?")) { lista = []; guardarLista(); cerrarBtn.focus(); }
    } else if (b.hasAttribute("data-copiar-lista")) {
      copiar(textoLista(), "Lista copiada al portapapeles");
    } else if (b.hasAttribute("data-cerrar")) {
      cerrarLista();
    }
  });
  listaEl.addEventListener("change", function (ev) {
    var n = ev.target.getAttribute("data-cant-input");
    if (n == null) return;
    lista[+n].cant = Math.max(1, parseInt(ev.target.value, 10) || 1);
    guardarLista();
  });
  contador.textContent = lista.length;

  // ------------------------------------------------------------------ navegación de familias
  var CORTOS = { metalica: "Puerta metálica", madera: "Puerta de madera", sobreponer: "Sobreponer", garaje: "Eléctricas y garaje" };
  var navFam = document.getElementById("nav-familias");
  navFam.innerHTML = '<a href="#/">Todo</a>' + D.familias.map(function (f) {
    return '<a href="#/f/' + f.id + '">' + esc(CORTOS[f.id] || f.nombre) + "</a>";
  }).join("") + '<a class="familias__compat" href="#/compatibilidades">Compatibilidades</a>';
  function marcarNav(famId) {
    Array.prototype.forEach.call(navFam.querySelectorAll("a"), function (a) {
      var activo = famId === "compat" ? a.getAttribute("href") === "#/compatibilidades"
        : famId ? a.getAttribute("href") === "#/f/" + famId : a.getAttribute("href") === "#/";
      if (activo) { a.setAttribute("aria-current", "page"); a.scrollIntoView({ block: "nearest", inline: "nearest" }); }
      else a.removeAttribute("aria-current");
    });
  }

  // ------------------------------------------------------------------ piezas comunes
  function tarjeta(p, nivel) {
    var h = nivel || "h3";
    var nv = p.variantes.length;
    var meta = (nv > 1 ? nv + " versiones · " : "") + num(p.nCodigos) + (p.nCodigos === 1 ? " código" : " códigos");
    return '<a class="tarjeta" href="#/p/' + p.id + '">' +
      '<div class="tarjeta__foto"><img src="' + esc(p.foto.mini) + '" alt="" loading="lazy" decoding="async"></div>' +
      '<div class="tarjeta__cuerpo"><span class="tarjeta__ref">' + esc(p.mod) + " · " + esc(p.art) + "</span>" +
      "<" + h + ' class="tarjeta__nombre">' + esc(p.nombre) + "</" + h + ">" +
      (p.destacado ? '<span class="etiqueta">' + esc(p.destacado) + "</span>" : "") +
      '<span class="tarjeta__meta">' + meta + "</span>" +
      (p.nMarcas ? '<span class="tarjeta__compat">Equivale a ' + p.nMarcas + (p.nMarcas === 1 ? " marca" : " marcas") + "</span>" : "") + "</div></a>";
  }
  function panelFamilia(fid) {
    var pn = D.paneles[fid];
    if (!pn) return "";
    if (pn.colores) {
      return '<div class="panel panel--solo"><div class="panel__txt"><h3>' + esc(pn.titulo) + '</h3><div class="ral">' +
        pn.colores.map(function (c) { return '<div><i style="background:' + esc(c[2]) + '"></i><span><b>' + esc(c[0]) + "</b>" + esc(c[1]) + "</span></div>"; }).join("") +
        '</div><p class="plano-pie">Colores orientativos en pantalla. Página ' + pn.pag + ' del <a href="' + pdfPag(pn.pag) + '" target="_blank" rel="noopener">catálogo PDF</a>.</p></div></div>';
    }
    return '<div class="panel">' +
      (pn.imagen ? '<div class="panel__img"><img src="' + esc(pn.imagen.src) + '" alt="Esquema de los sistemas de amaestramiento KD, KA, MK y GMK" loading="lazy"></div>' : "") +
      '<div class="panel__txt"><h3>' + esc(pn.titulo) + "</h3><dl>" +
      pn.items.map(function (it) { return "<dt>" + esc(it[0]) + "</dt><dd>" + esc(it[1]) + "</dd>"; }).join("") +
      '</dl><p class="plano-pie">Páginas 34 y 35 del <a href="' + pdfPag(pn.pag) + '" target="_blank" rel="noopener">catálogo PDF</a>. Los maletines C5MK, C6MK y S10MK permiten igualar y amaestrar en taller.</p></div></div>';
  }
  function seccionFamilia(f, conEnlace) {
    var ps = D.productos.filter(function (p) { return p.fam === f.id; });
    return '<section class="familia" aria-labelledby="fam-' + f.id + '"><div class="envoltura">' +
      '<div class="familia__cabeza"><div><h2 id="fam-' + f.id + '">' + esc(f.nombre) + "</h2><p>" + esc(f.texto) + '</p>' +
      '<p class="familia__meta">' + ps.length + " modelos · " + num(f.nCodigos) + " códigos</p></div>" +
      (conEnlace ? '<a href="#/f/' + f.id + '">Ver solo ' + esc(f.nombre.toLowerCase()) + "</a>" : "") + "</div>" +
      '<div class="rejilla">' + ps.map(function (p) { return tarjeta(p); }).join("") + "</div>" +
      (conEnlace ? "" : panelFamilia(f.id)) +
      "</div></section>";
  }

  // ------------------------------------------------------------------ buscador de cilindros
  var GAMAS = D.productos.filter(function (p) { return p.variantes.some(esCil); });
  var calc = { pid: GAMAS[0].id, vid: null, leva: null, medida: "" };
  function opciones(lista, actual) {
    return lista.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (o[0] === actual ? " selected" : "") + ">" + esc(o[1]) + "</option>";
    }).join("");
  }
  function calculadoraHTML() {
    var p = PROD[calc.pid] || GAMAS[0];
    var vars = p.variantes.filter(esCil);
    var v = vars.find(function (x) { return x.id === calc.vid; }) || vars[0];
    var levas = uniq(v.filas.map(function (f) { return f[0]; }));
    var leva = levas.indexOf(calc.leva) >= 0 ? calc.leva : levas[0];
    calc.pid = p.id; calc.vid = v.id; calc.leva = leva;
    var filas = [];
    v.filas.forEach(function (f, i) { if (f[0] === leva) filas.push(i); });
    filas.sort(function (a, b) { var fa = v.filas[a], fb = v.filas[b]; return (+fa[1] - +fb[1]) || (+fa[2] - +fb[2]); });
    var medidas = filas.map(function (i) { var f = v.filas[i]; return [f[2] + "/" + f[3], f[2] + " / " + f[3] + "  (L " + f[1] + " mm)", i]; });
    var sel = medidas.find(function (m) { return m[0] === calc.medida; });
    var res;
    if (sel) {
      var i = sel[2], f = v.filas[i];
      var rev = v.revisar && v.revisar[i];
      res = '<div class="resultado" aria-live="polite">' +
        [[4, "Latón"], [5, "Níquel"]].map(function (c) {
          var cod = f[c[0]];
          return '<div class="resultado__fila"><span class="resultado__acabado">' + c[1] + '</span><span class="resultado__codigo mono">' + esc(cod) + "</span>" +
            '<button class="icono-boton" type="button" data-copiar="' + esc(cod) + '" aria-label="Copiar código ' + esc(cod) + '">' + ICO.copiar + "</button>" +
            '<button class="icono-boton icono-boton--mas" type="button" data-anadir="' + p.id + "|" + v.id + "|" + i + "|" + c[0] + '" aria-label="Añadir ' + esc(cod) + ' a la lista">' + ICO.mas + "</button></div>";
        }).join("") +
        (rev ? '<div class="nota" style="margin:0;border-radius:0">' + ICO.aviso + "<span>" + esc(rev) + "</span></div>" : "") +
        '<div class="resultado__pie"><span>' + esc(p.mod + " " + (v.art || p.art)) + " · L " + esc(f[1]) + " mm · " + f[6] + "/" + f[7] + ' ud.</span><a href="#/p/' + p.id + "/" + v.id + "?ref=" + encodeURIComponent(f[4]) + '">Ver en la ficha</a></div></div>';
    } else {
      res = '<div class="resultado"><p class="resultado__vacio">Elige la medida A / B para ver los códigos en latón y en níquel.</p></div>';
    }
    return '<div class="calculadora" id="calc"><h2>Busca el código de un cilindro</h2>' +
      "<p>Elige gama, tipo, leva y medida A / B, como en las tablas del catálogo.</p>" +
      '<div class="calculadora__campos">' +
      '<div class="campo"><label for="c-gama">Gama</label><select id="c-gama" data-calc="pid">' +
      opciones(GAMAS.map(function (g) { return [g.id, g.mod + " " + g.art]; }), p.id) + "</select></div>" +
      '<div class="campo"><label for="c-tipo">Tipo</label><select id="c-tipo" data-calc="vid">' +
      opciones(vars.map(function (x) { return [x.id, x.nombre]; }), v.id) + "</select></div>" +
      '<div class="campo"><label for="c-leva">Leva</label><select id="c-leva" data-calc="leva">' +
      opciones(levas.map(function (l) { return [l, l]; }), leva) + "</select></div>" +
      '<div class="campo"><label for="c-medida">Medida A / B</label><select id="c-medida" data-calc="medida"><option value="">Elige medida</option>' +
      opciones(medidas.map(function (m) { return [m[0], m[1]]; }), calc.medida) + "</select></div>" +
      "</div>" + res + "</div>";
  }
  app.addEventListener("change", function (ev) {
    var k = ev.target.getAttribute("data-calc");
    if (!k) return;
    calc[k] = ev.target.value;
    if (k === "pid") { calc.vid = null; calc.leva = null; }
    var id = ev.target.id;
    var cont = document.getElementById("calc");
    var tmp = document.createElement("div");
    tmp.innerHTML = calculadoraHTML();
    cont.replaceWith(tmp.firstChild);
    var el = document.getElementById(id); if (el) el.focus();
  });

  // ------------------------------------------------------------------ vistas
  function vistaInicio() {
    marcarNav(null);
    document.title = "Catálogo ICSA España 2026 · SBC Grupo Sebalcab";
    app.innerHTML =
      '<section class="portada"><div class="envoltura portada__rejilla"><div>' +
      "<h1>Catálogo ICSA <span>España 2026</span></h1>" +
      '<p class="portada__texto">Cilindros, cerraduras, cierrapuertas, antipánicos y candados con su foto real, sus medidas y su código. Escribe en el buscador lo que necesitas como lo pedirías, por ejemplo «hs6 30x40 níquel» o «102 inox 25», o entra por familia.</p>' +
      '<ul class="cifras"><li><strong>' + D.productos.length + "</strong><span>modelos</span></li><li><strong>" + num(IDX.length) +
      "</strong><span>códigos</span></li><li><strong>" + N_EQUIV + '</strong><span><a href="#/compatibilidades">equivalencias con ' + CMP.marcas.length + " marcas</a></span></li></ul>" +
      "</div>" + calculadoraHTML() + "</div></section>" +
      D.familias.map(function (f) { return seccionFamilia(f, true); }).join("");
  }

  function vistaFamilia(fid) {
    marcarNav(fid);
    var f = FAM[fid];
    document.title = f.nombre + " · Catálogo ICSA España 2026";
    var html = seccionFamilia(f, false).replace('<h2 id="fam-' + fid + '">' + esc(f.nombre) + "</h2>", '<h1 id="fam-' + fid + '" class="familia__h1">' + esc(f.nombre) + "</h1>");
    if (fid === "cilindros") html = html.replace('<div class="rejilla">', '<div class="familia__calc">' + calculadoraHTML() + '</div><div class="rejilla">');
    app.innerHTML = '<div class="envoltura"><nav class="migas" aria-label="Ruta"><a href="#/">Catálogo</a> › ' + esc(f.nombre) + "</nav></div>" + html;
  }

  // ---- ficha de producto
  var est = null; // estado de la ficha abierta
  function imagenesDe(p, v) {
    var imgs = [{ tipo: "Foto", src: p.foto.src, mini: p.foto.mini }];
    if (v.foto) imgs.unshift({ tipo: "Foto " + v.nombre, src: v.foto.src, mini: v.foto.mini, corto: "Versión" });
    (p.fotos || []).forEach(function (f) { imgs.push({ tipo: "Foto", src: f.src, mini: f.mini }); });
    if (v.plano) imgs.push({ tipo: "Plano técnico", src: v.plano.src, mini: v.plano.src, corto: "Plano" });
    return imgs;
  }
  function galeriaHTML() {
    var imgs = imagenesDe(est.p, est.v);
    var sel = Math.min(est.img, imgs.length - 1);
    var im = imgs[sel];
    return '<div class="galeria__principal"><span class="galeria__tipo">' + esc(im.corto === "Plano" ? "Plano técnico" : "Foto real") + "</span>" +
      '<img class="entra" src="' + esc(im.src) + '" alt="' + esc(est.p.nombre + (im.corto === "Plano" ? ", plano técnico de " + est.v.nombre : "")) + '"></div>' +
      (imgs.length > 1 ? '<div class="miniaturas" role="group" aria-label="Imágenes del producto">' + imgs.map(function (x, n) {
        return '<button class="mini" type="button" data-img="' + n + '" aria-pressed="' + (n === sel) + '"><img src="' + esc(x.mini) + '" alt="">' + esc(x.corto || "Foto") + "</button>";
      }).join("") + "</div>" : "");
  }
  function columnasFiltro(v) {
    var r = [];
    v.cols.forEach(function (c, k) {
      if (SIN_FILTRO[c]) return;
      var vals = uniq(v.filas.map(function (f) { return f[k]; }).filter(Boolean));
      if (vals.length >= 2 && vals.length <= 60) r.push({ c: c, k: k, vals: ordenValores(vals) });
    });
    return r;
  }
  function filasFiltradas() {
    var v = est.v, t = normCod(est.texto || "");
    var ci = idxCodigo(v);
    var r = [];
    v.filas.forEach(function (f, i) {
      for (var c in est.filtros) {
        var k = v.cols.indexOf(c);
        if (est.filtros[c] && f[k] !== est.filtros[c]) return;
      }
      if (t && !ci.some(function (k) { return normCod(f[k]).indexOf(t) >= 0; }) &&
          !f.some(function (x) { return normCod(x) === t; })) return;
      r.push(i);
    });
    return r;
  }
  function cuerpoTabla() {
    var v = est.v, ci = idxCodigo(v);
    var filas = filasFiltradas();
    est.visibles = filas.length;
    if (!filas.length) return '<tr><td colspan="' + v.cols.length + '"><p class="sin-resultados">Ninguna referencia cumple estos filtros.</p></td></tr>';
    return filas.map(function (i) {
      var f = v.filas[i];
      var rev = v.revisar && v.revisar[i];
      var marcado = est.ref && ci.some(function (k) { return f[k] === est.ref; });
      return "<tr data-fila=\"" + i + "\"" + (marcado ? ' class="marcada"' : "") + ">" + v.cols.map(function (c, k) {
        var val = f[k];
        if (ci.indexOf(k) >= 0 && val) {
          return '<td><span class="celda-codigo"><span class="mono">' + esc(val) + "</span>" +
            '<button class="icono-boton" type="button" data-copiar="' + esc(val) + '" aria-label="Copiar código ' + esc(val) + '">' + ICO.copiar + "</button>" +
            '<button class="icono-boton icono-boton--mas" type="button" data-anadir="' + est.p.id + "|" + v.id + "|" + i + "|" + k + '" aria-label="Añadir ' + esc(val) + ' a la lista">' + ICO.mas + "</button>" +
            (rev && k === ci[ci.length - 1] ? '<span class="revisar" title="' + esc(rev) + '" tabindex="0" aria-label="' + esc(rev) + '">' + ICO.aviso + "Revisar</span>" : "") +
            "</span></td>";
        }
        var cls = NUMERICAS[c] ? ' class="num"' : COLS_ANCHAS[c] ? ' class="ancho"' : "";
        return "<td" + cls + ">" + esc(val) + "</td>";
      }).join("") + "</tr>";
    }).join("");
  }
  function referenciasHTML() {
    var p = est.p, v = est.v;
    var fc = columnasFiltro(v);
    var hayFiltro = Object.keys(est.filtros).some(function (k) { return est.filtros[k]; }) || est.texto;
    var notas = [];
    if (v.nota) notas.push(v.nota);
    if (v.revisar) { var nr = Object.keys(v.revisar).length; notas.push(nr === 1 ? "Hay 1 fila marcada para revisar: el código impreso en el PDF no cuadra con sus medidas." : "Hay " + nr + " filas marcadas para revisar: los códigos impresos en el PDF no cuadran con sus medidas."); }
    return (p.variantes.length > 1 ? '<div class="pestanas" role="tablist" aria-label="Versiones">' + p.variantes.map(function (x) {
      return '<button class="pestana" type="button" role="tab" id="tab-' + x.id + '" aria-controls="panel-ref" aria-selected="' + (x.id === v.id) + '" data-var="' + x.id + '">' +
        esc(x.nombre) + "<small>" + x.filas.length + "</small></button>";
    }).join("") + "</div>" : "") +
      '<div id="panel-ref" role="' + (p.variantes.length > 1 ? "tabpanel" : "region") + '" aria-label="Referencias de ' + esc(v.nombre) + '">' +
      '<p class="plano-pie" style="margin:0 0 12px">' + (v.art ? "Art. <b class=\"mono\">" + esc(v.art) + "</b> · " : "") +
      '<a href="' + pdfPag(v.pag) + '" target="_blank" rel="noopener">página ' + v.pag + " del PDF</a></p>" +
      notas.map(function (n) { return '<div class="nota">' + ICO.aviso + "<span>" + esc(n) + "</span></div>"; }).join("") +
      '<div class="filtros">' + fc.map(function (x) {
        var id = "f-" + x.k;
        return '<div class="campo"><label for="' + id + '">' + esc(x.c) + '</label><select id="' + id + '" data-filtro="' + esc(x.c) + '"><option value="">Todas</option>' +
          x.vals.map(function (val) { return '<option value="' + esc(val) + '"' + (est.filtros[x.c] === val ? " selected" : "") + ">" + esc(val) + "</option>"; }).join("") + "</select></div>";
      }).join("") +
      (v.filas.length > 6 ? '<div class="campo campo--texto"><label for="f-texto">Código</label><input id="f-texto" type="search" autocomplete="off" placeholder="Escribe parte del código" value="' + esc(est.texto || "") + '"></div>' : "") +
      (hayFiltro ? '<button class="limpiar" type="button" data-limpiar>Quitar filtros</button>' : "") +
      '<span class="filtros__cuenta" id="cuenta" aria-live="polite"></span></div>' +
      '<div class="tabla-caja"><table class="tabla"><thead><tr>' + v.cols.map(function (c) {
        return "<th" + (NUMERICAS[c] ? ' class="num"' : "") + ' scope="col">' + esc(c) + "</th>";
      }).join("") + '</tr></thead><tbody id="tbody">' + cuerpoTabla() + "</tbody></table></div></div>";
  }
  function pintarCuenta() {
    var c = document.getElementById("cuenta");
    if (c) c.textContent = est.visibles === est.v.filas.length ? est.v.filas.length + " filas" : est.visibles + " de " + est.v.filas.length + " filas";
  }
  function repintarReferencias(foco) {
    var sec = document.getElementById("ref-cont");
    sec.innerHTML = referenciasHTML();
    pintarCuenta();
    if (foco) { var el = document.getElementById(foco); if (el) { el.focus(); if (el.setSelectionRange && el.type === "search") el.setSelectionRange(el.value.length, el.value.length); } }
  }
  function repintarGaleria() {
    document.getElementById("galeria").innerHTML = galeriaHTML();
  }

  function vistaProducto(p, vid, ref, irCompat) {
    marcarNav(p.fam);
    var v = p.variantes.find(function (x) { return x.id === vid; }) || p.variantes[0];
    if (ref && !idxCodigo(v).some(function (k) { return v.filas.some(function (f) { return f[k] === ref; }); })) {
      var hit = IDX.find(function (e) { return e.p === p && e.cod === ref; });
      if (hit) v = hit.v;
    }
    est = { p: p, v: v, filtros: {}, texto: "", img: 0, ref: ref || null, visibles: 0 };
    var f = FAM[p.fam];
    document.title = p.mod + " " + p.art + " · " + p.nombre + " · ICSA España";
    var largos = [];
    p.variantes.forEach(function (x) { var k = x.cols.indexOf("L"); if (k >= 0) x.filas.forEach(function (r) { if (+r[k]) largos.push(+r[k]); }); });
    var dato3 = largos.length
      ? "<div><dt>Largo L</dt><dd>" + Math.min.apply(null, largos) + " a " + Math.max.apply(null, largos) + " mm</dd></div>"
      : "<div><dt>Catálogo PDF</dt><dd>Página " + p.pag + "</dd></div>";
    var rel = D.productos.filter(function (x) { return x.fam === p.fam && x.id !== p.id; });
    var cfP = compatDe(p), marcasP = marcasDe(cfP);
    app.innerHTML = '<div class="envoltura">' +
      '<nav class="migas" aria-label="Ruta"><a href="#/">Catálogo</a> › <a href="#/f/' + f.id + '">' + esc(f.nombre) + "</a></nav>" +
      '<section class="ficha"><div class="galeria" id="galeria">' + galeriaHTML() + "</div>" +
      '<div class="ficha__info"><p class="ficha__ref">MOD <b>' + esc(p.mod) + "</b> · ART. <b>" + esc(p.art) + "</b></p>" +
      "<h1>" + esc(p.nombre) + "</h1>" + '<p class="ficha__sub">' + esc(p.sub) + "</p>" +
      '<dl class="datos-rapidos"><div><dt>Versiones</dt><dd>' + p.variantes.length + "</dd></div><div><dt>Códigos</dt><dd>" + num(p.nCodigos) + "</dd></div>" + dato3 + "</dl>" +
      (p.variantes.length > 1 ? '<div class="versiones"><p class="versiones__t">Versiones</p><div>' + p.variantes.map(function (x) {
        return '<a href="#/p/' + p.id + "/" + x.id + '" data-ver-var="' + x.id + '">' + esc(x.nombre) + "</a>";
      }).join("") + "</div></div>" : "") +
      (cfP.length ? '<div class="compat-tira"><p class="versiones__t">Sustituye a referencias de</p><a class="compat-tira__logos" href="#compatibilidades" data-ir="compatibilidades" aria-label="Ver compatibilidades con ' + esc(marcasP.join(", ")) + '">' +
        marcasP.map(function (m) { return logoMarca(m, "logo-mini"); }).join("") + "</a></div>" : "") +
      '<div class="ficha__acciones"><a class="boton" href="#referencias" data-ir-ref>' + ICO.tabla + "Ver referencias</a>" +
      '<a class="boton boton--sec" href="' + pdfPag(p.pag) + '" target="_blank" rel="noopener">' + ICO.externo + "Página " + p.pag + " del PDF</a></div>" +
      "</div></section>" +
      (p.ficha.length ? '<section class="tecnica" aria-labelledby="tit-tec"><h2 id="tit-tec">Ficha técnica</h2><div class="tecnica__rejilla">' +
        p.ficha.map(function (b) { return '<div class="bloque-tec"><h3>' + esc(b.t) + "</h3><ul>" + b.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>"; }).join("") +
        "</div></section>" : "") +
      compatProductoHTML(p) +
      '<section class="referencias" id="referencias" aria-labelledby="tit-ref"><h2 id="tit-ref">Referencias</h2><div id="ref-cont">' + referenciasHTML() + "</div></section>" +
      (rel.length ? '<section class="relacionados" aria-labelledby="tit-rel"><h2 id="tit-rel">Más en ' + esc(f.nombre.toLowerCase()) + '</h2><div class="rejilla rejilla--mini">' +
        rel.slice(0, 6).map(function (x) { return tarjeta(x, "h3"); }).join("") + "</div></section>" : "") +
      "</div>";
    pintarCuenta();
    if (irCompat && document.getElementById("compatibilidades")) {
      requestAnimationFrame(function () { document.getElementById("compatibilidades").scrollIntoView({ block: "start" }); });
      return true;
    }
    if (ref) {
      var tr = app.querySelector("tr.marcada");
      if (tr) {
        requestAnimationFrame(function () {
          tr.scrollIntoView({ block: "center" });
          var caja = tr.closest(".tabla-caja");
          if (caja) { var r = tr.getBoundingClientRect(), c = caja.getBoundingClientRect(); caja.scrollTop += (r.top - c.top) - c.height / 2; }
          document.getElementById("referencias").scrollIntoView({ block: "start" });
          setTimeout(function () { tr.classList.remove("marcada"); }, 4000);
        });
        return true;
      }
    }
    return false;
  }

  app.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-copiar],[data-anadir],[data-var],[data-img],[data-limpiar],[data-ir-ref],[data-ver-var],[data-ir]");
    if (!b) return;
    if (b.hasAttribute("data-copiar")) { copiar(b.getAttribute("data-copiar")); return; }
    if (b.hasAttribute("data-anadir")) {
      var a = b.getAttribute("data-anadir").split("|");
      var e = entradaPor(a[0], a[1], a[2], a[3]);
      if (e) { anadir(e); b.classList.add("hecho"); b.innerHTML = ICO.hecho; setTimeout(function () { b.classList.remove("hecho"); b.innerHTML = ICO.mas; }, 1200); }
      return;
    }
    if (b.hasAttribute("data-ir")) {
      ev.preventDefault();
      var dst = document.getElementById(b.getAttribute("data-ir"));
      if (dst) dst.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    if (b.hasAttribute("data-ir-ref")) {
      ev.preventDefault();
      document.getElementById("referencias").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    if (!est) return;
    if (b.hasAttribute("data-ver-var")) {
      ev.preventDefault();
      var tab = document.querySelector('[data-var="' + b.getAttribute("data-ver-var") + '"]');
      if (tab) { tab.click(); document.getElementById("referencias").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
      return;
    }
    if (b.hasAttribute("data-var")) {
      var nv = est.p.variantes.find(function (x) { return x.id === b.getAttribute("data-var"); });
      est.v = nv; est.filtros = {}; est.texto = ""; est.ref = null; est.img = 0;
      history.replaceState(null, "", "#/p/" + est.p.id + "/" + nv.id);
      repintarReferencias("tab-" + nv.id);
      repintarGaleria();
      return;
    }
    if (b.hasAttribute("data-img")) { est.img = +b.getAttribute("data-img"); repintarGaleria(); var m = document.querySelector('[data-img="' + est.img + '"]'); if (m) m.focus(); return; }
    if (b.hasAttribute("data-limpiar")) { est.filtros = {}; est.texto = ""; repintarReferencias(); return; }
  });
  app.addEventListener("change", function (ev) {
    var c = ev.target.getAttribute("data-filtro");
    if (c == null || !est) return;
    est.filtros[c] = ev.target.value;
    est.ref = null;
    repintarReferencias(ev.target.id);
  });
  var tTexto;
  app.addEventListener("input", function (ev) {
    if (ev.target.id !== "f-texto" || !est) return;
    clearTimeout(tTexto);
    var val = ev.target.value;
    tTexto = setTimeout(function () {
      est.texto = val; est.ref = null;
      document.getElementById("tbody").innerHTML = cuerpoTabla();
      pintarCuenta();
      var hay = Object.keys(est.filtros).some(function (k) { return est.filtros[k]; }) || est.texto;
      var lim = app.querySelector("[data-limpiar]");
      if (hay && !lim) { var bt = document.createElement("button"); bt.className = "limpiar"; bt.type = "button"; bt.setAttribute("data-limpiar", ""); bt.textContent = "Quitar filtros"; document.getElementById("cuenta").before(bt); }
      if (!hay && lim) lim.remove();
    }, 120);
  });
  app.addEventListener("keydown", function (ev) {
    var tab = ev.target.closest && ev.target.closest('[role="tab"]');
    if (!tab || (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft")) return;
    var tabs = Array.prototype.slice.call(app.querySelectorAll('[role="tab"]'));
    var i = tabs.indexOf(tab) + (ev.key === "ArrowRight" ? 1 : -1);
    tabs[(i + tabs.length) % tabs.length].click();
  });

  // ---- búsqueda (motor en assets/buscador.js)
  var MOTOR = window.crearBuscador(D);
  function buscar(texto) { return texto && texto.trim().length >= 2 ? MOTOR.buscar(texto) : null; }
  function resaltar(cod, toks) {
    var limpio = normCod(cod), nc = "";
    (toks || []).forEach(function (t) {
      var n = t.tipo === "num" ? t.v : t.tipo === "mix" ? t.n : "";
      if (n && n.length >= 3 && limpio.indexOf(n) >= 0 && n.length > nc.length) nc = n;
    });
    if (!nc) return esc(cod);
    var pos = limpio.indexOf(nc);
    var mapa = []; for (var i = 0; i < cod.length; i++) if (/[A-Za-z0-9§]/.test(cod[i])) mapa.push(i);
    var ini = mapa[pos], fin = mapa[pos + nc.length - 1] + 1;
    return esc(cod.slice(0, ini)) + "<mark>" + esc(cod.slice(ini, fin)) + "</mark>" + esc(cod.slice(fin));
  }
  function hrefRef(e) { return "#/p/" + e.p.id + "/" + e.v.id + "?ref=" + encodeURIComponent(e.cod); }
  function detalleRef(e) {
    var r = resumenFila(e.v, e.v.filas[e.i], e.k);
    return tituloProducto(e.p) + " · " + e.v.nombre + (r ? " · " + r : "");
  }
  function botonesRef(e, foco) {
    var ti = foco ? "" : ' tabindex="-1"';
    return '<button class="icono-boton" type="button"' + ti + ' data-copiar="' + esc(e.cod) + '" aria-label="Copiar código ' + esc(e.cod) + '">' + ICO.copiar + "</button>" +
      '<button class="icono-boton icono-boton--mas" type="button"' + ti + ' data-anadir="' + e.p.id + "|" + e.v.id + "|" + e.i + "|" + e.k + '" aria-label="Añadir ' + esc(e.cod) + ' a la lista">' + ICO.mas + "</button>";
  }
  function entendidoHTML(r) {
    if (!r.entendido || r.entendido.length < 2) return "";
    return '<p class="entendido">Buscando ' + r.entendido.map(function (x) { return "<b>" + esc(x) + "</b>"; }).join(" + ") + "</p>";
  }
  function avisoSin(r) {
    return r.sinPalabra ? '<p class="aviso-busqueda">' + ICO.aviso + "<span>Ningún producto tiene todas las palabras. Se muestran los resultados sin «" + esc(r.sinPalabra) + "».</span></p>" : "";
  }

  var q = document.getElementById("q"), sug = document.getElementById("sugerencias");
  var sugSel = -1, ultimo = null;
  function cerrarSug() { sug.hidden = true; q.setAttribute("aria-expanded", "false"); q.removeAttribute("aria-activedescendant"); sugSel = -1; }
  function pintarSug() {
    var r = buscar(q.value);
    ultimo = r;
    if (!r) { cerrarSug(); return; }
    var n = 0;
    var bloqueCod = "", bloqueMod = "";
    if (r.refs.length) {
      bloqueCod = '<div class="sugerencias__grupo">' + (r.refs.length === 1 ? "1 código" : num(r.refs.length) + " códigos") + "</div>" +
        r.refs.slice(0, r.porCodigo ? 7 : 4).map(function (e) {
          var href = hrefRef(e);
          return '<div class="sug" role="option" id="sug-' + (n++) + '" data-href="' + href + '">' +
            '<a class="sug__enlace" href="' + href + '" tabindex="-1"><img src="' + esc((e.v.foto || e.p.foto).mini) + '" alt="">' +
            '<span class="sug__txt"><span class="sug__t mono">' + resaltar(e.cod, r.toks) + '</span><span class="sug__d">' + esc(detalleRef(e)) + "</span></span></a>" +
            botonesRef(e, false) + "</div>";
        }).join("");
    }
    if (r.prods.length) {
      bloqueMod = '<div class="sugerencias__grupo">Modelos</div>' + r.prods.slice(0, r.porCodigo ? 2 : 5).map(function (p) {
        var href = "#/p/" + p.id;
        return '<div class="sug" role="option" id="sug-' + (n++) + '" data-href="' + href + '"><a class="sug__enlace" href="' + href + '" tabindex="-1"><img src="' + esc(p.foto.mini) + '" alt="">' +
          '<span class="sug__txt"><span class="sug__t">' + esc(p.nombre) + '</span><span class="sug__d">' + esc(p.mod + " · " + p.art + " · " + FAM[p.fam].nombre) + "</span></span></a></div>";
      }).join("");
    }
    var comp = MOTOR.buscarCompat(q.value);
    var bloqueEq = "";
    if (comp.length) {
      bloqueEq = '<div class="sugerencias__grupo">Equivalencias con otras marcas</div>' + comp.slice(0, 4).map(function (x) {
        var f = x.fila, m = x.marcas[0], pr = f.pid && PROD[f.pid], href = hrefCompat(f);
        return '<div class="sug" role="option" id="sug-' + (n++) + '" data-href="' + href + '"><a class="sug__enlace" href="' + href + '" tabindex="-1">' +
          '<span class="sug__logo">' + logoMarca(m, "logo-sug") + "</span>" +
          '<span class="sug__txt"><span class="sug__t">' + esc(m + " " + f.refs[m]) + " = ICSA " + esc(f.art) + '</span><span class="sug__d">' +
          (pr ? esc(tituloProducto(pr) + " · " + pr.nombre) : "No está en el catálogo España 2026") + "</span></span></a></div>";
      }).join("") + (comp.length > 4 ? '<a class="sugerencias__todo" href="#/compatibilidades?q=' + encodeURIComponent(q.value.trim()) + '">Ver las ' + comp.length + " equivalencias</a>" : "");
      if (r.sinPalabra) { bloqueCod = ""; bloqueMod = ""; r = { refs: [], prods: [], entendido: [] }; }
    }
    var h = bloqueEq + (comp.length ? "" : entendidoHTML(r) + avisoSin(r)) + (r.porCodigo ? bloqueCod + bloqueMod : bloqueMod + bloqueCod);
    var total = r.prods.length + r.refs.length + comp.length;
    if (!total) h = '<p class="sugerencias__vacio">Sin resultados para «' + esc(q.value.trim()) + '». Escribe como lo pedirías: «hs6 30x40 níquel», «102 inox 25» o parte del código.</p>';
    else if (r.prods.length + r.refs.length > n - Math.min(comp.length, 4)) h += '<a class="sugerencias__todo" id="sug-todo" href="#/buscar/' + encodeURIComponent(q.value.trim()) + '">Ver los ' + num(total) + " resultados y afinar</a>";
    sug.innerHTML = h;
    sug.hidden = false; q.setAttribute("aria-expanded", "true");
    sugSel = -1;
  }
  var tSug;
  q.addEventListener("input", function () { clearTimeout(tSug); tSug = setTimeout(pintarSug, 80); });
  q.addEventListener("focus", function () { if (q.value.trim().length >= 2) pintarSug(); });
  q.addEventListener("keydown", function (ev) {
    var items = sug.hidden ? [] : sug.querySelectorAll(".sug, .sugerencias__todo");
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      if (!items.length) return;
      ev.preventDefault();
      sugSel = (sugSel + (ev.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      Array.prototype.forEach.call(items, function (it, i) { it.setAttribute("aria-selected", i === sugSel); });
      if (items[sugSel].id) q.setAttribute("aria-activedescendant", items[sugSel].id);
      items[sugSel].scrollIntoView({ block: "nearest" });
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      var it = sugSel >= 0 ? items[sugSel] : null;
      var destino = it ? (it.getAttribute("data-href") || it.getAttribute("href")) : null;
      if (!destino) {
        var r = buscar(q.value);
        var cmpE = MOTOR.buscarCompat(q.value);
        if (cmpE.length === 1) destino = hrefCompat(cmpE[0].fila);
        else if (cmpE.length && (!r || r.sinPalabra || !r.refs.length)) destino = "#/compatibilidades?q=" + encodeURIComponent(q.value.trim());
        else if (r && r.refs.length === 1) destino = hrefRef(r.refs[0]);
        else if (r && !r.porCodigo && r.prods.length === 1) destino = "#/p/" + r.prods[0].id;
        else if (q.value.trim()) destino = "#/buscar/" + encodeURIComponent(q.value.trim());
      }
      if (destino) { cerrarSug(); q.blur(); location.hash = destino; }
    } else if (ev.key === "Escape") { cerrarSug(); }
  });
  sug.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-copiar],[data-anadir]");
    if (b) {
      ev.preventDefault(); ev.stopPropagation();
      if (b.hasAttribute("data-copiar")) copiar(b.getAttribute("data-copiar"));
      else {
        var a = b.getAttribute("data-anadir").split("|"), e = entradaPor(a[0], a[1], a[2], a[3]);
        if (e) { anadir(e); b.classList.add("hecho"); b.innerHTML = ICO.hecho; setTimeout(function () { b.classList.remove("hecho"); b.innerHTML = ICO.mas; }, 1200); }
      }
      q.focus();
      return;
    }
    var op = ev.target.closest(".sug");
    if (op && !ev.target.closest("a")) { cerrarSug(); location.hash = op.getAttribute("data-href"); }
  });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest("#buscador")) cerrarSug();
    else if (ev.target.closest(".sug__enlace, .sugerencias__todo")) { cerrarSug(); q.blur(); }
  });

  // ---- página de resultados con filtros
  var estB = null;
  function levaDe(e) { return esCil(e.v) ? e.v.filas[e.i][0] : ""; }
  var FACETAS = [
    { id: "modelo", t: "Modelo", val: function (e) { return e.p.id; }, txt: function (v) { var p = PROD[v]; return p.mod + " " + p.art; } },
    { id: "version", t: "Versión", val: function (e) { return e.v.nombre; }, txt: function (v) { return v; } },
    { id: "leva", t: "Leva", val: levaDe, txt: function (v) { return v; } },
    { id: "acabado", t: "Acabado", val: function (e) { return e.acabado; }, txt: function (v) { return v; } }
  ];
  function pasaFacetas(e, salvo) {
    return FACETAS.every(function (f) { return f.id === salvo || !estB.fac[f.id] || f.val(e) === estB.fac[f.id]; });
  }
  function facetasHTML() {
    return FACETAS.map(function (f) {
      var cuenta = {}, orden = [];
      estB.r.refs.forEach(function (e) {
        if (!pasaFacetas(e, f.id)) return;
        var v = f.val(e); if (!v) return;
        if (!cuenta[v]) { cuenta[v] = 0; orden.push(v); }
        cuenta[v]++;
      });
      if (orden.length < 2 && !estB.fac[f.id]) return "";
      return '<div class="faceta"><span class="faceta__t">' + f.t + "</span>" + orden.map(function (v) {
        var on = estB.fac[f.id] === v;
        return '<button class="chip" type="button" data-fac="' + f.id + '" data-val="' + esc(v) + '" aria-pressed="' + on + '">' + esc(f.txt(v)) + "<small>" + cuenta[v] + "</small></button>";
      }).join("") + "</div>";
    }).join("");
  }
  function tablaBusqueda() {
    var lim = 300;
    var refs = estB.r.refs.filter(function (e) { return pasaFacetas(e, null); });
    var hay = FACETAS.some(function (f) { return estB.fac[f.id]; });
    return '<div class="facetas">' + facetasHTML() + (hay ? '<button class="limpiar" type="button" data-fac-limpiar>Quitar filtros</button>' : "") + "</div>" +
      '<p class="plano-pie" aria-live="polite">' + (refs.length === 1 ? "1 código" : num(refs.length) + " códigos") + (refs.length > lim ? ". Se muestran los " + lim + " más relevantes" : "") + ".</p>" +
      '<div class="tabla-caja"><table class="tabla"><thead><tr><th scope="col">Código</th><th scope="col">Modelo</th><th scope="col">Versión</th><th scope="col">Detalle</th></tr></thead><tbody>' +
      refs.slice(0, lim).map(function (e) {
        return '<tr><td><span class="celda-codigo"><a class="mono" href="' + hrefRef(e) + '">' + resaltar(e.cod, estB.r.toks) + "</a>" + botonesRef(e, true) + "</span></td>" +
          "<td>" + esc(tituloProducto(e.p)) + "</td><td>" + esc(e.v.nombre) + '</td><td class="ancho">' + esc(resumenFila(e.v, e.v.filas[e.i], e.k)) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  function vistaBusqueda(texto) {
    marcarNav("__ninguna");
    q.value = texto;
    var r = buscar(texto) || { prods: [], refs: [], toks: [], entendido: [] };
    estB = { r: r, fac: {} };
    document.title = "Buscar «" + texto + "» · Catálogo ICSA España";
    var modelos = r.prods.length ? '<h2>Modelos</h2><div class="rejilla">' + r.prods.map(function (p) { return tarjeta(p); }).join("") + "</div>" : "";
    var codigos = r.refs.length ? '<h2>Códigos</h2><div id="res-codigos">' + tablaBusqueda() + "</div>" : "";
    var comp = MOTOR.buscarCompat(texto);
    if (comp.length && r.sinPalabra) { r = { prods: [], refs: [], toks: [], entendido: [] }; estB.r = r; modelos = ""; codigos = ""; }
    var equiv = comp.length ? "<h2>Equivalencias con otras marcas</h2>" + tablaEquivalencias(comp.map(function (x) { return { f: x.fila, marcas: x.marcas }; })) : "";
    app.innerHTML = '<div class="envoltura pagina"><h1>Resultados para «' + esc(texto) + "»</h1>" +
      '<p class="pagina__sub">' + num(r.refs.length) + (r.refs.length === 1 ? " código" : " códigos") + ", " + r.prods.length + (r.prods.length === 1 ? " modelo" : " modelos") +
      (comp.length ? " y " + comp.length + (comp.length === 1 ? " equivalencia" : " equivalencias") + " con otras marcas" : "") + ".</p>" +
      (comp.length ? "" : entendidoHTML(r) + avisoSin(r)) + equiv +
      (r.porCodigo ? codigos + modelos : modelos + codigos) +
      (!r.prods.length && !r.refs.length && !comp.length ? "<p>No hay resultados. Escribe como lo pedirías: «hs6 30x40 níquel», «102 inox 25», «a402 blanco» o parte del código.</p>" : "") +
      "</div>";
  }
  app.addEventListener("click", function (ev) {
    if (!estB) return;
    var b = ev.target.closest("[data-fac],[data-fac-limpiar]");
    if (!b) return;
    if (b.hasAttribute("data-fac-limpiar")) estB.fac = {};
    else {
      var f = b.getAttribute("data-fac"), v = b.getAttribute("data-val");
      estB.fac[f] = estB.fac[f] === v ? null : v;
      if (f === "modelo") estB.fac.version = null;
    }
    document.getElementById("res-codigos").innerHTML = tablaBusqueda();
    var foco = b.hasAttribute("data-fac") && document.querySelector('[data-fac="' + b.getAttribute("data-fac") + '"][data-val="' + CSS.escape(b.getAttribute("data-val")) + '"]');
    if (foco) foco.focus();
  });

  // ---- apartado de compatibilidades
  function celdaProducto(f) {
    var pr = f.pid && PROD[f.pid];
    if (!pr) return '<span class="fuera">No está en el catálogo España 2026</span>';
    var v = f.vid && pr.variantes.find(function (x) { return x.id === f.vid; });
    return '<a class="compat-prod" href="' + hrefCompat(f) + '"><img src="' + esc(pr.foto.mini) + '" alt=""><span><b>' + esc(tituloProducto(pr)) + "</b>" +
      esc(pr.nombre + (v ? " · " + v.nombre : "")) + "</span></a>";
  }
  // tabla «marca y referencia → artículo ICSA» (una fila por equivalencia)
  function tablaEquivalencias(items, texto) {
    var nq = texto ? normCod(texto) : "";
    var filas = [];
    items.forEach(function (x) {
      x.marcas.forEach(function (m) { if (x.f.refs[m]) filas.push({ f: x.f, m: m }); });
    });
    return '<div class="tabla-caja"><table class="tabla tabla--compat"><thead><tr><th scope="col">Marca</th><th scope="col">Referencia</th><th scope="col">Artículo ICSA</th><th scope="col">En el catálogo</th></tr></thead><tbody>' +
      filas.map(function (r) {
        var ref = r.f.refs[r.m];
        var refHTML = nq && normCod(ref).indexOf(nq) >= 0 ? "<mark>" + esc(ref) + "</mark>" : esc(ref);
        return '<tr><td><span class="celda-marca">' + logoMarca(r.m, "logo-tabla") + "<span>" + esc(r.m) + "</span></span></td>" +
          '<td><span class="celda-codigo"><span class="mono">' + refHTML + "</span>" +
          '<button class="icono-boton" type="button" data-copiar="' + esc(ref) + '" aria-label="Copiar referencia ' + esc(r.m + " " + ref) + '">' + ICO.copiar + "</button></span></td>" +
          '<td class="mono">' + esc(r.f.art) + "</td><td>" + celdaProducto(r.f) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  var estC = null;
  function filasCompat() {
    var nq = normCod(estC.q || "");
    return CMP.filas.filter(function (f) {
      if (estC.m && !f.refs[estC.m]) return false;
      if (!nq) return true;
      if (normCod(f.art).indexOf(nq) >= 0) return true;
      var marcas = estC.m ? [estC.m] : Object.keys(f.refs);
      return marcas.some(function (m) { return normCod(f.refs[m]).indexOf(nq) >= 0 || normCod(m).indexOf(nq) === 0; });
    });
  }
  function compatResHTML() {
    var filas = filasCompat();
    if (!filas.length) return '<p class="sin-resultados">Ninguna equivalencia con «' + esc(estC.q) + '»' + (estC.m ? " en " + esc(estC.m) : "") + ". Prueba solo con los números de la referencia.</p>";
    var cuenta = '<p class="plano-pie" aria-live="polite">' + filas.length + (filas.length === 1 ? " artículo ICSA" : " artículos ICSA") + "</p>";
    if (estC.m || estC.q) {
      return cuenta + tablaEquivalencias(filas.map(function (f) {
        var nq = normCod(estC.q || "");
        var ms = estC.m ? [estC.m] : Object.keys(f.refs).filter(function (m) { return !nq || normCod(f.refs[m]).indexOf(nq) >= 0 || normCod(m).indexOf(nq) === 0; });
        if (!ms.length) ms = Object.keys(f.refs);
        return { f: f, marcas: CMP.marcas.filter(function (m) { return ms.indexOf(m) >= 0; }) };
      }), estC.q);
    }
    // vista general: matriz artículo ICSA × marca
    var marcas = CMP.marcas;
    return cuenta + '<div class="tabla-caja tabla-caja--matriz"><table class="tabla tabla--matriz"><thead><tr><th scope="col" class="fija">Artículo ICSA</th>' +
      marcas.map(function (m) { return '<th scope="col"><button class="cab-marca" type="button" data-marca="' + esc(m) + '" title="Ver solo ' + esc(m) + '">' + logoMarca(m, "logo-cab") + "<span>" + esc(m) + "</span></button></th>"; }).join("") +
      "</tr></thead><tbody>" + filas.map(function (f) {
        var pr = f.pid && PROD[f.pid];
        return '<tr><th scope="row" class="fija">' + (pr ? '<a class="mono" href="' + hrefCompat(f) + '">' + esc(f.art) + '</a><small>' + esc(tituloProducto(pr)) + "</small>"
          : '<span class="mono">' + esc(f.art) + '</span><small class="fuera">Fuera del catálogo</small>') + "</th>" +
          marcas.map(function (m) { return '<td class="mono">' + esc(f.refs[m] || "") + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }
  function chipsMarcas() {
    return '<button class="chip chip--marca" type="button" data-marca="" aria-pressed="' + !estC.m + '">Todas</button>' +
      CMP.marcas.map(function (m) {
        var n = CMP.filas.filter(function (f) { return f.refs[m]; }).length;
        return '<button class="chip chip--marca" type="button" data-marca="' + esc(m) + '" aria-pressed="' + (estC.m === m) + '">' + logoMarca(m, "logo-chip") +
          '<span class="oculto">' + esc(m) + "</span><small>" + n + "</small></button>";
      }).join("");
  }
  function vistaCompat(q0, m0) {
    marcarNav("compat");
    estC = { q: q0 || "", m: CMP.marcas.indexOf(m0) >= 0 ? m0 : "" };
    document.title = "Compatibilidades con otras marcas · Catálogo ICSA España";
    app.innerHTML = '<div class="envoltura pagina">' +
      "<h1>Compatibilidades con otras marcas</h1>" +
      '<p class="pagina__sub">Encuentra el artículo ICSA que sustituye a una cerradura de otra marca: ' + N_EQUIV + " equivalencias de " + CMP.filas.length +
      " artículos ICSA con " + CMP.marcas.length + " marcas, según la tabla de compatibilidades ICSA de junio de 2026.</p>" +
      '<div class="compat-busca"><div class="campo campo--texto"><label for="c-q">Referencia de otra marca o artículo ICSA</label>' +
      '<input id="c-q" type="search" autocomplete="off" placeholder="Ej.: 2210, 741-7411 o 1134" value="' + esc(estC.q) + '"></div></div>' +
      '<div class="marcas-chips" role="group" aria-label="Filtrar por marca" id="chips-marca">' + chipsMarcas() + "</div>" +
      '<div id="compat-res">' + compatResHTML() + "</div>" +
      '<p class="plano-pie">' + (CMP.marcas_vacias && CMP.marcas_vacias.length ? esc(CMP.marcas_vacias.join(", ")) + " aparece en la tabla sin equivalencias. " : "") +
      "Los artículos fuera del catálogo España 2026 se pueden pedir a Sebalcab; confirma disponibilidad.</p></div>";
  }
  function repintarCompat() {
    document.getElementById("compat-res").innerHTML = compatResHTML();
    document.getElementById("chips-marca").innerHTML = chipsMarcas();
    var qs = new URLSearchParams();
    if (estC.q) qs.set("q", estC.q);
    if (estC.m) qs.set("m", estC.m);
    history.replaceState(null, "", "#/compatibilidades" + (qs.toString() ? "?" + qs.toString() : ""));
  }
  var tComp;
  app.addEventListener("input", function (ev) {
    if (ev.target.id !== "c-q" || !estC) return;
    clearTimeout(tComp);
    var val = ev.target.value;
    tComp = setTimeout(function () { estC.q = val.trim(); repintarCompat(); }, 120);
  });
  app.addEventListener("click", function (ev) {
    if (!estC) return;
    var b = ev.target.closest("[data-marca]");
    if (!b) return;
    var m = b.getAttribute("data-marca");
    estC.m = estC.m === m ? "" : m;
    repintarCompat();
    var foco = document.querySelector('#chips-marca [data-marca="' + CSS.escape(estC.m) + '"]');
    if (foco) foco.focus();
  });

  // ------------------------------------------------------------------ enrutado
  function enrutar() {
    var h = location.hash.replace(/^#/, "") || "/";
    var partes = h.split("?"), ruta = partes[0], params = new URLSearchParams(partes[1] || "");
    var seg = ruta.split("/").filter(Boolean).map(function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } });
    var mantener = false;
    if (seg[0] === "f" && FAM[seg[1]]) vistaFamilia(seg[1]);
    else if (seg[0] === "p" && PROD[seg[1]]) mantener = vistaProducto(PROD[seg[1]], seg[2], params.get("ref"), params.get("compat"));
    else if (seg[0] === "compatibilidades") vistaCompat(params.get("q"), params.get("m"));
    else if (seg[0] === "buscar" && seg[1]) vistaBusqueda(seg.slice(1).join("/"));
    else { est = null; vistaInicio(); }
    if (seg[0] !== "p") est = null;
    if (seg[0] !== "buscar") estB = null;
    if (seg[0] !== "compatibilidades") estC = null;
    if (!mantener) window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", enrutar);
  enrutar();
})();
