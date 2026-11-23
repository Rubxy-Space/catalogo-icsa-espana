// Empareja los artículos ICSA de FactuSOL (códigos 55/...) con los códigos del catálogo ICSA.
// Usa el código de barras cuando lleva dentro el código ICSA y, si no, el buscador del catálogo con la descripción.
// Uso: node _generador/emparejar_factusol.js . <listado FactuSOL .csv con CODIGO;DESCRIPCION;EAN> _factusol/emparejamiento_55.csv
// El resultado va a _factusol/, que no se sube a GitHub (son datos internos de Sebalcab).
const fs = require("fs");
global.window = {};
const raiz = require("path").resolve(process.argv[2]);
require(raiz + "/data/catalogo.js");
const crear = require(raiz + "/assets/buscador.js");
const D = window.ICSA;
const B = crear(D);

// índice de códigos del catálogo: alfanumérico sin guiones
const COD = new Map();
D.productos.forEach(p => p.variantes.forEach(v => {
  v.cols.forEach((c, k) => {
    if (!/Código|Latón|Níquel/.test(c)) return;
    v.filas.forEach((f, i) => {
      if (!f[k]) return;
      const n = f[k].replace(/[^0-9A-Za-z]/g, "").toUpperCase();
      if (n.length >= 6) COD.set(n, { cod: f[k], p, v, i, k });
    });
  });
}));

function porEAN(ean) {
  if (!ean) return null;
  const e = ean.replace(/\D/g, "");
  for (const cand of [e, "0" + e, "00" + e]) {
    for (const len of [10, 9, 8]) {
      const h = COD.get(cand.slice(0, len));
      if (h && cand.slice(0, len).length === len) return h;
    }
  }
  return null;
}

function consulta(cod, des) {
  let d = " " + des.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[.,()]/g, " ") + " ";
  const esCil = /cilindro|bombillo/.test(d);
  d = d.replace(/ cilindro icsa /g, " ").replace(/ icsa /g, " ");
  d = d.replace(/hs6pro|hs6 pro|s6p/g, "hs6 pro");
  if (esCil) d = d.replace(/ (\d{2})(\d{2}) /g, " $1x$2 ").replace(/ (\d{2})x(\d{2}) /g, " $1x$2 ");
  d = d.replace(/ (de|d\.e\.?) /g, " doble embrague ").replace(/ lc /g, " corta ").replace(/ leva /g, " ").replace(/ larga /g, " ");
  d = d.replace(/ entrada (\d+) /g, " $1 ").replace(/ e(\d{2}) /g, " $1 ");
  d = d.replace(/ cerr\.? /g, " cerradura ");
  // artículo al principio del código FactuSOL (55/102E35 -> 102)
  const art = (cod.split("/")[1] || "").match(/^(\d{3,4})/);
  return ((art && !esCil ? art[1] + " " : "") + d).replace(/\s+/g, " ").trim();
}

const filas = fs.readFileSync(process.argv[3], "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
const cab = filas.shift().split(";");
const iC = cab.indexOf("CODIGO"), iD = cab.indexOf("DESCRIPCION"), iE = cab.indexOf("EAN"), iG = cab.indexOf("CARPETA");
const out = [["CODIGO_FACTUSOL", "DESCRIPCION_FACTUSOL", "EAN", "GRUPO", "CODIGO_CATALOGO", "COMO", "MODELO_CATALOGO", "DETALLE_CATALOGO", "CANDIDATOS"]];
const cuenta = {};
for (const linea of filas) {
  const c = linea.split(";");
  const cod = c[iC], des = c[iD] || "", ean = c[iE] || "", grupo = (c[iG] || "").split("/")[1] || "";
  let como = "", hit = null, cands = "";
  const e = porEAN(ean);
  const q = consulta(cod, des);
  const r = B.buscar(q);
  let refs = r && r.porCodigo && !r.sinPalabra ? r.refs : [];
  // reglas de FactuSOL: sin «doble embrague», «pomo» ni «corta» se entiende cilindro normal de leva larga
  const dl = " " + des.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + " ";
  const quedan = (f) => { const x = refs.filter(f); if (x.length) refs = x; };
  if (!/doble embrague| de |d\.e\./.test(dl)) quedan(x => !/Doble embrague/.test(x.v.nombre));
  if (!/pomo/.test(dl) && !/P$/.test(cod)) quedan(x => !/pomo/i.test(x.v.nombre));
  const iLeva = (x) => x.v.cols.indexOf("Leva");
  if (/corta| lc /.test(dl) || /LC$|NC|LCI/.test(cod)) quedan(x => iLeva(x) < 0 || /Corta/.test(x.v.filas[x.i][iLeva(x)]));
  else quedan(x => iLeva(x) < 0 || !/Corta/.test(x.v.filas[x.i][iLeva(x)]));
  if (!/pro/.test(dl) && !/S6P/.test(cod)) quedan(x => !/PRO/.test(x.p.art));
  else quedan(x => /PRO/.test(x.p.art));
  if (/latón|laton/.test(dl)) quedan(x => x.v.cols[x.k] !== "Níquel");
  if (/niquel/.test(dl)) quedan(x => x.v.cols[x.k] !== "Latón");
  const unicos = [...new Set(refs.map(x => x.cod))];
  if (e && unicos.length === 1 && unicos[0] !== e.cod) { como = "revisar: el codigo de barras dice " + e.cod + " y la descripcion " + unicos[0]; cands = e.cod + " " + unicos[0]; }
  else if (e) { hit = e; como = "ean"; }
  else if (unicos.length === 1) { hit = refs[0]; como = "descripcion"; }
  else if (unicos.length > 1) { como = "varios"; cands = unicos.slice(0, 6).join(" ") + (unicos.length > 6 ? " +" + (unicos.length - 6) : ""); }
  else como = "sin pareja";
  if (!hit && /IGUALADO|IGUAMINTO/i.test(des)) como = "igualado (pedido especial)";
  const clave = como.startsWith("revisar") ? "revisar (codigo de barras y descripcion no coinciden)" : como;
  cuenta[clave] = (cuenta[clave] || 0) + 1;
  const g = cuenta["g:" + grupo] = cuenta["g:" + grupo] || { total: 0, ok: 0 };
  g.total++; if (hit) g.ok++;
  out.push([cod, des, ean, grupo, hit ? hit.cod : "", como, hit ? hit.p.mod + " " + hit.p.art : "", hit ? hit.v.nombre + " · " + hit.v.cols[hit.k] : "", cands]);
}
fs.writeFileSync(process.argv[4], "﻿" + out.map(r => r.map(x => /[;"\n]/.test(x) ? '"' + String(x).replace(/"/g, '""') + '"' : x).join(";")).join("\r\n"));
console.log("Total", filas.length);
for (const k of Object.keys(cuenta).filter(k => !k.startsWith("g:"))) console.log(" ", k, cuenta[k]);
console.log("Por grupo (emparejados / total):");
for (const k of Object.keys(cuenta).filter(k => k.startsWith("g:"))) console.log(" ", k.slice(2), cuenta[k].ok + "/" + cuenta[k].total);
