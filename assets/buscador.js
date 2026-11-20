/* Catálogo ICSA España 2026 · motor de búsqueda
 *
 * Busca en cada referencia (cada código) a la vez por modelo, artículo, versión,
 * medidas, leva, acabado, mano, color y código. Todas las palabras de la consulta
 * tienen que encajar en la misma referencia; después se ordena por relevancia.
 *
 * Ejemplos: «hs6 30x40 níquel», «hs6 pro embrague corta 35/45», «102 inox 25»,
 * «600 negro», «candado 40», «a402 blanco», «l 80 s10 pomo», «1150303013».
 */
(function (raiz) {
  "use strict";

  var COLS_CODIGO = ["Código", "Latón", "Níquel"];
  var NO_BUSCAR = { "Caja": 1, "Embalaje": 1, "Pág.": 1, "Peso (kg)": 1 };
  var LETRAS_MEDIDA = { l: "L", a: "A", b: "B", c: "C", d: "D", e: "E", f: "F", h: "H", s: "S" };
  var VACIAS = {
    de: 1, del: 1, la: 1, el: 1, los: 1, las: 1, para: 1, y: 1, en: 1, un: 1, una: 1, mm: 1,
    art: 1, ref: 1, mod: 1, modelo: 1, codigo: 1, cod: 1, referencia: 1, medida: 1, medidas: 1,
    quiero: 1, busco: 1, necesito: 1, icsa: 1
  };
  var GENERICAS = { cilindro: 1, de: 1, con: 1, y: 1, e: 1, para: 1, la: 1, el: 1, el_: 1 };
  var SINONIMOS = {
    bombin: ["cilindro"], bombines: ["cilindro"], bombillo: ["cilindro"], bombillos: ["cilindro"], cilindros: ["cilindro"],
    niquel: ["niquel"], niquelado: ["niquel"], nikel: ["niquel"], niquelada: ["niquel"],
    laton: ["laton"], latonado: ["laton"], dorado: ["laton"],
    cromo: ["cromo", "cromado"], cromado: ["cromado", "cromo"], cromada: ["cromado", "cromo"],
    inox: ["inox", "inoxidable"], inoxidable: ["inox", "inoxidable"], acero: ["acero", "inox"],
    dcha: ["derecha"], der: ["derecha"], derecha: ["derecha"],
    izda: ["izquierda"], izq: ["izquierda"], izqda: ["izquierda"], izquierda: ["izquierda"],
    reten: ["reten", "retencion"], retencion: ["reten", "retencion"], retenedor: ["reten", "retencion"],
    negra: ["negro"], negro: ["negro"], blanca: ["blanco"], blanco: ["blanco"], roja: ["rojo"], rojo: ["rojo"],
    plateado: ["plata"], plateada: ["plata"], plata: ["plata"], gris: ["gris", "plata"],
    muelle: ["cierrapuertas"], cierrapuerta: ["cierrapuertas"], cierra: ["cierrapuertas"],
    antipanicos: ["antipanico"], barras: ["barra"],
    garaje: ["garaje", "electrica"], electrica: ["electrica"], electricas: ["electrica"],
    copia: ["llave"], llaves: ["llave"], amaestrar: ["amaestramiento", "maletin"], amaestramiento: ["amaestramiento", "maletin"],
    cortafuegos: ["cortafuego"], multipunto: ["multipunto", "tres"], aluminio: ["metalica", "aluminio"],
    yale: ["azbe", "yale"], azbe: ["azbe"], ezquerra: ["ezcurra"], ezqurra: ["ezcurra"],
    persianas: ["persiana"], candados: ["candado"], pomos: ["pomo"], embragues: ["embrague"]
  };

  function plano(s) { return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function normCod(s) { return String(s).toUpperCase().replace(/[^A-Z0-9§]/g, ""); }
  function palabras(s, sinNumeros) {
    return plano(s).split(/[^a-z0-9ñ§]+/).filter(function (w) { return w && (!sinNumeros || !/^\d+$/.test(w)); });
  }
  // además de las palabras sueltas, añade las piezas con barra o punto unidas (HS10/F -> hs10f, 56/A/D -> 56ad)
  function palabrasUnidas(s) {
    var r = palabras(s);
    plano(s).split(/\s+/).forEach(function (pz) {
      if (/[\/.\-]/.test(pz)) { var u = pz.replace(/[^a-z0-9ñ§]/g, ""); if (u.length > 1) r.push(u); }
    });
    return r;
  }
  var NUM_PAL = { "1": "un", "2": "dos", "3": "tres" };
  function numNorm(s) { return plano(s).replace(",", ".").replace(/\s+/g, ""); }
  function raizPal(w) { return w.length > 4 && /s$/.test(w) ? w.slice(0, -1) : w; }

  function crear(D) {
    var FAM = {}; D.familias.forEach(function (f) { FAM[f.id] = f; });
    var ENTRADAS = [], PRODUCTOS = [];
    var COMPAT = (D.compat && D.compat.filas) || [];
    // palabras de compatibilidad (marca y referencia) por producto y versión
    var XW = {};
    COMPAT.forEach(function (f) {
      if (!f.pid) return;
      var clave = f.pid + "|" + (f.vid || "*");
      var dic = XW[clave] || (XW[clave] = {});
      for (var m in f.refs) {
        palabrasUnidas(m + " " + f.refs[m]).forEach(function (w) { dic[w] = 1; });
      }
    });
    function compatDe(pid, vid) {
      var r = {}, a = XW[pid + "|*"] || {}, b = XW[pid + "|" + vid] || {}, w;
      for (w in a) r[w] = 1;
      for (w in b) r[w] = 1;
      return r;
    }

    // nombre de versión con su alias de búsqueda («doble cilindro» se busca aunque se muestre «Cilindro»)
    function nombreV(v) { return v.nombre + " " + (v.alias || "") + " " + (v.art || ""); }

    D.productos.forEach(function (p, pi) {
      var base = palabrasUnidas([p.nombre, p.mod, p.art, FAM[p.fam].nombre].join(" "))
        .concat(palabras(p.sub, true));
      var artPal = palabras(p.art);
      var docP = { p: p, pi: pi, pw: {}, artPal: artPal };
      base.forEach(function (w) { docP.pw[w] = 1; });
      for (var clave in XW) if (clave.indexOf(p.id + "|") === 0) for (var xw in XW[clave]) docP.pw[xw] = 1;
      // palabras de los nombres de versión de todo el modelo: lo que distingue unas versiones de otras
      var nw = {}; // palabras del nombre del modelo y su familia: valen para todas las versiones
      palabrasUnidas([p.nombre, p.mod, FAM[p.fam].nombre].join(" ")).forEach(function (w) { nw[w] = 1; });
      var pvw = {};
      if (p.variantes.length > 1) p.variantes.forEach(function (v) {
        palabrasUnidas(nombreV(v)).forEach(function (w) { pvw[w] = 1; });
      });
      p.variantes.forEach(function (v, vi) {
        palabrasUnidas(nombreV(v)).forEach(function (w) { docP.pw[w] = 1; });
        var vPal = palabras(v.nombre + " " + (v.alias || "")).filter(function (w) { return !GENERICAS[w]; });
        var vw = {};
        var xwV = compatDe(p.id, v.id);
        palabrasUnidas(nombreV(v)).forEach(function (w) { vw[w] = 1; });
        var ci = [];
        v.cols.forEach(function (c, k) { if (COLS_CODIGO.indexOf(c) >= 0) ci.push(k); });
        if (!ci.length && v.cols.indexOf("Art.") >= 0) ci.push(v.cols.indexOf("Art."));
        var cil = v.cols[0] === "Leva";
        var vcw = {}; // palabras de celda de toda la versión: lo que distingue unas filas de otras
        v.filas.forEach(function (f, i) {
          var celdas = {}, valores = [], cw = {};
          v.cols.forEach(function (c, k) {
            if (ci.indexOf(k) >= 0 || NO_BUSCAR[c] || !f[k]) return;
            celdas[c] = numNorm(f[k]);
            valores.push(numNorm(f[k]));
            palabrasUnidas(f[k]).forEach(function (w) { cw[w] = 1; vcw[w] = 1; });
          });
          ci.forEach(function (k) {
            if (!f[k]) return;
            var e = {
              p: p, v: v, i: i, k: k, cod: f[k], n: normCod(f[k]), pi: pi, vi: vi, cil: cil,
              pw: {}, cw: {}, vcw: vcw, vw: vw, pvw: pvw, nw: nw, xw: xwV, celdas: celdas, valores: valores, vPal: vPal, artPal: artPal,
              acabado: v.cols[k] === "Latón" || v.cols[k] === "Níquel" ? v.cols[k]
                : (f[v.cols.indexOf("Acabado")] || f[v.cols.indexOf("Frente")] || f[v.cols.indexOf("Color")] || "")
            };
            base.forEach(function (w) { e.pw[w] = 1; });
            for (var x in xwV) e.pw[x] = 1;
            palabrasUnidas(nombreV(v)).forEach(function (w) { e.pw[w] = 1; });
            for (var w in cw) e.cw[w] = 1;
            if (v.cols[k] === "Latón") { e.cw.laton = 1; vcw.laton = 1; }
            if (v.cols[k] === "Níquel") { e.cw.niquel = 1; e.cw.niquelado = 1; vcw.niquel = 1; }
            // artículos usados como código (A401/T): sin cifras sueltas cortas para no confundir «3» con «/3»
            palabrasUnidas(f[k]).forEach(function (w) { if (!/^\d{1,2}$/.test(w)) e.cw[w] = 1; });
            ENTRADAS.push(e);
          });
        });
      });
      PRODUCTOS.push(docP);
    });

    // ------------------------------------------------------------ consulta
    function analizar(q) {
      var t = plano(q).replace(/(\d),(\d)/g, "$1.$2");
      t = t.replace(/(\d{1,3})\s*[x×*]\s*(\d{1,3})(?![\d])/g, " $1x$2 ");
      t = t.replace(/(^|\s)(\d{2,3})\s*\/\s*(\d{2,3})(?=\s|$)/g, "$1$2x$3");
      var crudos = t.split(/\s+/).map(function (s) { return s.replace(/^[.,;:()«»"']+|[.,;:()«»"']+$/g, ""); }).filter(Boolean);
      var toks = [];
      for (var i = 0; i < crudos.length; i++) {
        var s = crudos[i], sig = crudos[i + 1];
        var m;
        if ((m = s.match(/^(\d{1,3})x(\d{1,3})$/))) { toks.push({ tipo: "par", a: m[1], b: m[2], txt: m[1] + "/" + m[2] }); continue; }
        if (s.length === 1 && LETRAS_MEDIDA[s] && sig && /^\d+(\.\d+)?$/.test(sig)) {
          toks.push({ tipo: "mix", n: normCod(s + sig), w: s + sig, tag: { col: LETRAS_MEDIDA[s], val: sig }, txt: s.toUpperCase() + " " + sig });
          i++; continue;
        }
        if (s === "con" && sig && /^reten/.test(sig)) { toks.push({ tipo: "pal", alts: ["reten", "retencion"], excl: "sin", txt: "con retén" }); i++; continue; }
        if (VACIAS[s] || s === "con" || s === "x") continue;
        if ((m = s.match(/^(\d+(?:\.\d+)?)(mm|kg)?$/))) { toks.push({ tipo: "num", v: m[1], txt: s }); continue; }
        if (/\d/.test(s) || /[\/§]/.test(s)) {
          var tk = { tipo: "mix", n: normCod(s), w: s.replace(/[^a-z0-9ñ§]/g, ""), txt: s };
          if ((m = s.match(/^([a-z])=?(\d+(?:\.\d+)?)$/)) && LETRAS_MEDIDA[m[1]]) tk.tag = { col: LETRAS_MEDIDA[m[1]], val: m[2] };
          if (tk.n) toks.push(tk);
          continue;
        }
        if (s.length === 1) continue;
        var alts = (SINONIMOS[s] || [s]).map(raizPal);
        if (alts.indexOf(raizPal(s)) < 0 && !SINONIMOS[s]) alts.push(raizPal(s));
        toks.push({ tipo: "pal", alts: alts, txt: s });
      }
      // dos números seguidos (30 40) se leen también como A / B
      for (var j = 0; j + 1 < toks.length; j++) {
        if (toks[j].tipo === "num" && toks[j + 1].tipo === "num" && /^\d{2,3}$/.test(toks[j].v) && /^\d{2,3}$/.test(toks[j + 1].v)) {
          toks[j].parCon = toks[j + 1].v;
        }
      }
      return toks;
    }

    function tienePrefijo(dic, pref) {
      if (dic[pref]) return 2;
      for (var w in dic) if (w.length > pref.length && w.indexOf(pref) === 0) return 1;
      return 0;
    }

    // ¿la palabra está en el modelo de forma válida para esta versión?
    // Si nombra otra versión del mismo modelo (A402 en «A401 · A402 · A403»), solo vale en su versión.
    function enModelo(e, w) {
      if (e.xw[w]) return true;
      if (!e.pw[w]) return false;
      return !!e.nw[w] || !e.pvw[w] || !!e.vw[w];
    }
    function prefijoModelo(e, a) {
      var rx = tienePrefijo(e.xw, a);
      if (rx) return rx;
      var r = tienePrefijo(e.pw, a);
      if (!r) return 0;
      if (!tienePrefijo(e.nw, a) && tienePrefijo(e.pvw, a)) return tienePrefijo(e.vw, a);
      return r;
    }

    // puntuación de un token sobre una entrada (código). -1 si no encaja
    function puntua(t, e) {
      var x;
      if (t.tipo === "par") {
        if (e.cil && e.celdas.A === t.a && e.celdas.B === t.b) return 40;
        for (x = 0; x < e.valores.length; x++) {
          var v = e.valores[x].replace(/[\/-]/g, "x");
          if (v === t.a + "x" + t.b) return 30;
        }
        return -1;
      }
      if (t.tipo === "num") {
        if (t.v.length >= 4 && e.n.indexOf(t.v) === 0) return e.n === t.v ? 100 : 35;
        if (e.celdas.A === t.v || e.celdas.L === t.v) return 17;
        for (x = 0; x < e.valores.length; x++) if (e.valores[x] === t.v) return 14;
        if (enModelo(e, t.v)) return 12;
        if (NUM_PAL[t.v] && (enModelo(e, NUM_PAL[t.v]) || e.cw[NUM_PAL[t.v]])) return 10;
        if (e.cw[t.v]) return 6;
        if (t.v.length >= 4 && e.n.indexOf(t.v) >= 0) return 10;
        return -1;
      }
      if (t.tipo === "mix") {
        if (e.n === t.n) return 100;
        if (t.n.length >= 3 && e.n.indexOf(t.n) === 0) return 40;
        if (enModelo(e, t.w)) return 20;
        if (e.cw[t.w]) return 16;
        if (t.tag && e.celdas[t.tag.col] === t.tag.val) return 18;
        if (t.n.length >= 4 && e.n.indexOf(t.n) >= 0) return 10;
        if (t.w.length >= 2 && (prefijoModelo(e, t.w) || tienePrefijo(e.cw, t.w))) return 6;
        return -1;
      }
      // palabra
      if (t.excl && (e.cw[t.excl] || e.pw[t.excl])) return -1;
      var mejor = -1;
      // si la palabra distingue unas filas de otras en esta versión (inox frente a cromado),
      // solo vale la fila que la tiene, aunque el nombre de la versión la mencione
      var deFila = t.alts.some(function (a) { return a.length >= 2 && tienePrefijo(e.vcw, a); });
      t.alts.forEach(function (a) {
        if (a.length < 2) return;
        var r = deFila ? tienePrefijo(e.cw, a) : Math.max(prefijoModelo(e, a), tienePrefijo(e.cw, a));
        if (r === 2) mejor = Math.max(mejor, 10);
        else if (r === 1) mejor = Math.max(mejor, 7);
      });
      return mejor;
    }

    function puntuaProducto(t, d) {
      if (t.tipo === "par") return -1;
      if (t.tipo === "num") return d.pw[t.v] ? 12 : (NUM_PAL[t.v] && d.pw[NUM_PAL[t.v]] ? 10 : -1);
      if (t.tipo === "mix") return d.pw[t.w] ? 20 : (t.w.length >= 2 && tienePrefijo(d.pw, t.w) ? 6 : -1);
      var mejor = -1;
      t.alts.forEach(function (a) {
        var r = tienePrefijo(d.pw, a);
        if (r === 2) mejor = Math.max(mejor, 10); else if (r === 1) mejor = Math.max(mejor, 7);
      });
      return mejor;
    }

    function cubre(toks, pal) {
      return toks.some(function (t) {
        if (t.tipo === "mix") return t.w === pal;
        if (t.tipo === "num") return t.v === pal;
        if (t.tipo === "pal") return t.alts.some(function (a) { return pal.indexOf(a) === 0; });
        return false;
      });
    }

    function ejecutar(toks) {
      var refs = [];
      ENTRADAS.forEach(function (e) {
        var total = 0;
        for (var i = 0; i < toks.length; i++) {
          var s = puntua(toks[i], e);
          if (s < 0) return;
          total += s;
          if (toks[i].parCon && e.cil && e.celdas.A === toks[i].v && e.celdas.B === toks[i].parCon) total += 15;
        }
        // el artículo escrito entero pesa más (hs6 frente a hs6 pro)
        if (e.artPal.length && e.artPal.every(function (w) { return cubre(toks, w); })) total += 12;
        // versión: premia las palabras de la versión escritas y penaliza las que no se han pedido
        var vb = 0;
        e.vPal.forEach(function (w) { vb += cubre(toks, w) ? 8 : -3; });
        total += vb;
        refs.push({ e: e, s: total });
      });
      refs.sort(function (a, b) {
        return b.s - a.s || a.e.pi - b.e.pi || a.e.vi - b.e.vi || a.e.i - b.e.i || a.e.k - b.e.k;
      });
      var prods = [];
      PRODUCTOS.forEach(function (d) {
        var total = 0;
        for (var i = 0; i < toks.length; i++) {
          var s = puntuaProducto(toks[i], d);
          if (s < 0) return;
          total += s;
        }
        if (d.artPal.length && d.artPal.every(function (w) { return cubre(toks, w); })) total += 12;
        prods.push({ p: d.p, s: total, pi: d.pi });
      });
      prods.sort(function (a, b) { return b.s - a.s || a.pi - b.pi; });
      return { refs: refs.map(function (r) { return r.e; }), prods: prods.map(function (r) { return r.p; }) };
    }

    function esModelo(w) { return PRODUCTOS.some(function (d) { return d.pw[w]; }); }

    function buscar(q) {
      var toks = analizar(q);
      if (!toks.length) return null;
      toks.forEach(function (t) { if (t.tag && esModelo(t.w)) delete t.tag; });
      var r = ejecutar(toks);
      r.toks = toks;
      r.sinPalabra = null;
      if (!r.refs.length && !r.prods.length && toks.length > 1) {
        // ninguna referencia tiene todas las palabras: se prueba quitando una
        var mejor = null;
        toks.forEach(function (t, i) {
          var resto = toks.slice(0, i).concat(toks.slice(i + 1));
          var rr = ejecutar(resto);
          var n = rr.refs.length + rr.prods.length;
          if (n && (!mejor || n < mejor.n)) mejor = { n: n, r: rr, t: t, resto: resto };
        });
        if (mejor) { r = mejor.r; r.toks = mejor.resto; r.sinPalabra = mejor.t.txt; }
      }
      // ¿la consulta pide referencias concretas (medidas, códigos, acabados) o solo modelos?
      r.porCodigo = r.refs.length > 0 && (r.prods.length === 0 || r.toks.some(function (t) {
        return t.tipo === "par" || t.tipo === "num" && !PRODUCTOS.some(function (d) { return d.pw[t.v]; }) ||
          t.tipo === "mix" && !PRODUCTOS.some(function (d) { return d.pw[t.w]; }) ||
          t.tipo === "pal" && !PRODUCTOS.some(function (d) { return puntuaProducto(t, d) >= 0; });
      }));
      r.entendido = r.toks.map(function (t) {
        if (t.tipo === "par") return "A " + t.a + " / B " + t.b;
        if (t.tag && t.tipo === "mix" && !PRODUCTOS.some(function (d) { return d.pw[t.w]; })) return t.tag.col + " " + t.tag.val;
        return t.txt;
      });
      return r;
    }

    // ------------------------------------------------------------ compatibilidades
    // Devuelve las filas de la tabla en las que encajan todas las palabras y qué marcas han coincidido.
    // Solo cuenta si alguna palabra encaja en una marca o referencia de otra marca.
    function buscarCompat(q) {
      var toks = analizar(q);
      if (!toks.length || toks.some(function (t) { return t.tipo === "par"; })) return [];
      var res = [];
      COMPAT.forEach(function (f) {
        var artW = {}; palabrasUnidas(f.art + " icsa").forEach(function (w) { artW[w] = 1; });
        var porMarca = {};
        for (var m in f.refs) { porMarca[m] = {}; palabrasUnidas(m + " " + f.refs[m]).forEach(function (w) { porMarca[m][w] = 1; }); }
        var marcasHit = {}, ajena = false;
        var ok = toks.every(function (t) {
          var claves = t.tipo === "num" ? [t.v] : t.tipo === "mix" ? [t.w] : t.alts;
          var encaja = false;
          claves.forEach(function (k) {
            var exacto = t.tipo !== "pal";
            for (var m in porMarca) {
              if (exacto ? porMarca[m][k] : tienePrefijo(porMarca[m], k)) { marcasHit[m] = 1; encaja = true; ajena = true; }
            }
            if (exacto ? artW[k] : tienePrefijo(artW, k)) encaja = true;
          });
          return encaja;
        });
        if (ok && ajena) {
          var marcas = Object.keys(marcasHit);
          // si se ha escrito una marca, se muestran solo las marcas escritas
          var escritas = marcas.filter(function (m) {
            return toks.some(function (t) { return t.tipo === "pal" && t.alts.some(function (a) { return plano(m).indexOf(a) === 0; }); });
          });
          res.push({ fila: f, marcas: escritas.length ? escritas : marcas });
        }
      });
      return res;
    }

    return { buscar: buscar, buscarCompat: buscarCompat, analizar: analizar, plano: plano, normCod: normCod };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = crear;
  else raiz.crearBuscador = crear;
})(this);
