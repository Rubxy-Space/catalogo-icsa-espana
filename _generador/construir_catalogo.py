# -*- coding: utf-8 -*-
"""Genera data/catalogo.js e img/ a partir del PDF del catálogo ICSA España 2026.

Uso:  python3 _generador/construir_catalogo.py
Requiere PyMuPDF (fitz) y Pillow.
"""
import json, os, re, sys, datetime
import fitz
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
from productos import FAMILIAS, PRODUCTOS, PANELES, COMPAT_PDF, COMPAT_ENLACES  # noqa: E402
import compatibilidades  # noqa: E402

PDF = os.path.join(RAIZ, "_fuente", "CATALOGO_IC_w011.pdf")
OUT_IMG = os.path.join(RAIZ, "img")
OUT_DATA = os.path.join(RAIZ, "data", "catalogo.js")
fitz.TOOLS.mupdf_display_errors(False)
doc = fitz.open(PDF)
avisos = []

# ------------------------------------------------------------------ tablas
CODE = re.compile(r'^(?=.*\d)[A-Z0-9§\.\/]{4,}-$|^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{6,}$|^\d{6,}-?$|^T\d{4}/R$')
_cache = {}

def lineas(pn):
    ws = doc[pn - 1].get_text("words")
    filas = []
    for w in sorted(ws, key=lambda w: (w[1] + w[3]) / 2):
        yc = (w[1] + w[3]) / 2
        if filas and abs(filas[-1][0] - yc) < 2.6:
            filas[-1][1].append(w)
        else:
            filas.append([yc, [w]])
    return [(y, sorted(ws, key=lambda w: w[0])) for y, ws in filas]

def tablas_pagina(pn):
    if pn in _cache:
        return _cache[pn]
    ls = lineas(pn)
    datos = [(y, ws) for y, ws in ls if any(CODE.match(w[4]) for w in ws)]
    clusters = []
    for r in datos:
        if clusters and r[0] - clusters[-1][-1][0] <= 45:
            clusters[-1].append(r)
        else:
            clusters.append([r])
    res = []
    for i, cl in enumerate(clusters):
        y_ini = clusters[i - 1][-1][0] + 3 if i else 0
        etiquetas = [(y, " ".join(w[4] for w in ws if w[0] < 185)) for y, ws in ls
                     if y_ini <= y <= cl[-1][0] + 3 and any(w[0] < 185 for w in ws)]
        res.append({"filas": cl, "etiquetas": etiquetas})
    _cache[pn] = res
    return res

def norm_leva(txt):
    m = re.search(r'LEVA\s+(LARGA|CORTA|REDONDA)\s*([\d\.,]+)?\s*(mm)?', txt.upper())
    if not m:
        return None
    tipo = {"LARGA": "Larga", "CORTA": "Corta", "REDONDA": "Redonda"}[m.group(1)]
    num = (m.group(2) or "").strip(".").replace(".", ",")
    return f"{tipo} {num} mm" if num else tipo

_cil_cache = {}

def tablas_cil_pagina(pn):
    """Lee las tablas de cilindros columna a columna.

    En las páginas con pomo las filas están tan juntas que cada columna
    deriva unas décimas en vertical; agrupar por línea falla. Aquí se
    agrupan las palabras por columna (x) y se emparejan por orden.
    """
    if pn in _cil_cache:
        return _cil_cache[pn]
    page = doc[pn - 1]
    ws = [w for w in page.get_text("words")
          if w[0] >= 185 and 95 < w[1] < 800 and (re.match(r"^\d+$", w[4]) or CODE.match(w[4]))]
    cols = []
    for w in sorted(ws, key=lambda w: w[0]):
        if cols and w[0] - cols[-1][-1][0] <= 12:
            cols[-1].append(w)
        else:
            cols.append([w])
    cols = [sorted(c, key=lambda w: w[1]) for c in cols]
    # en columnas de código solo cuentan los códigos (fuera el «ART. 90» de cabecera)
    cols = [[w for w in c if CODE.match(w[4])] if sum(bool(CODE.match(w[4])) for w in c) > len(c) / 2 else c
            for c in cols]
    if len(cols) != 7:
        avisos.append(f"P{pn}: {len(cols)} columnas de cilindro (esperadas 7)")
    ref = len(cols[3])  # columna de códigos de latón
    for k, c in enumerate(cols):
        if len(c) != ref:
            valores = {w[4] for w in c}
            if len(valores) == 1:
                # columna de unidades con el mismo valor en todas las filas: se rellena
                base = c[0]
                cols[k] = [(base[0], cols[3][i][1], base[2], cols[3][i][3], base[4]) for i in range(ref)]
            else:
                avisos.append(f"P{pn}: la columna {k} tiene {len(c)} valores y la de códigos {ref}: {sorted(valores)}")
    filas = list(zip(*cols))
    # etiquetas de leva (columna izquierda)
    etiquetas = []
    for y, wl in lineas(pn):
        lv = norm_leva(" ".join(w[4] for w in wl if w[0] < 185))
        if lv:
            etiquetas.append((y, lv))
    tablas, actual, ultimo_y = [], [], None
    for f in filas:
        y = (f[3][1] + f[3][3]) / 2
        if ultimo_y is not None and y - ultimo_y > 45:
            tablas.append(actual)
            actual = []
        leva = etiquetas[0][1] if etiquetas else ""
        for ey, lv in etiquetas:
            if y >= ey - 8:
                leva = lv
        actual.append([leva] + [w[4] for w in f])
        ultimo_y = y
    if actual:
        tablas.append(actual)
    _cil_cache[pn] = tablas
    return tablas

def tabla_cil(pn, idx):
    tablas = tablas_cil_pagina(pn)
    if idx >= len(tablas):
        avisos.append(f"P{pn}.{idx}: tabla de cilindro inexistente ({len(tablas)} en la página)")
        return []
    return tablas[idx]

def centros(filas):
    xs = sorted(w[0] for _, ws in filas for w in ws)
    grupos = []
    for x in xs:
        if grupos and x - grupos[-1][-1] <= 10:
            grupos[-1].append(x)
        else:
            grupos.append([x])
    return [sum(g) / len(g) for g in grupos]

def tabla_generica(spec):
    pn, idx, cols, extra = spec["pag"], spec["t"], spec["cols"], spec["extra"]
    tb = tablas_pagina(pn)[idx]
    cx = centros(tb["filas"])
    if len(cx) != len(cols):
        avisos.append(f"P{pn}.{idx}: {len(cx)} columnas detectadas y {len(cols)} esperadas")
    nombres = []
    for c in cols:
        if c not in nombres and c != "-":
            nombres.append(c)
    filas = []
    for _, ws in tb["filas"]:
        celdas = {n: [] for n in nombres}
        for w in ws:
            k = min(range(len(cx)), key=lambda i: abs(cx[i] - w[0]))
            nombre = cols[min(k, len(cols) - 1)]
            if nombre != "-":
                celdas[nombre].append(w[4])
        filas.append([" ".join(celdas[n]) for n in nombres])
    ecols = list(extra.keys())
    return ecols + nombres, [list(extra.values()) + f for f in filas]

COLORES = {"PLATA", "NEGRO", "BLANCO", "ARGENT", "-"}

def tabla_dc(pn, idx):
    tb = tablas_pagina(pn)[idx]
    filas = []
    dc9 = False
    for _, ws in tb["filas"]:
        toks = [w[4] for w in ws]
        cod = toks[-1]
        art = toks[0]
        resto = toks[1:-1]
        color = []
        while resto and resto[-1].upper() in COLORES:
            color.insert(0, resto.pop())
        color = " ".join(c for c in color if c not in ("-", "ARGENT")).capitalize()
        if re.match(r'^\d+-\d+$', resto[0]) and not re.match(r'^\d+$', resto[1] if len(resto) > 1 else ""):
            dc9 = True
            filas.append([art, resto[0], " ".join(resto[1:]).capitalize(), color, cod])
        else:
            filas.append([art, resto[0], resto[1], " ".join(resto[2:]).capitalize().replace("reten", "retén").replace("Reten", "Retén"), color, cod])
    if dc9:
        for f in filas:
            f[2] = f[2].replace("reten", "retén").replace("Reten", "Retén")
        return ["Art.", "Fuerza", "Función", "Color", "Código"], filas
    return ["Art.", "Peso (kg)", "Ancho máx. (mm)", "Función", "Color", "Código"], filas

ANTI_SUF = {
    "A401": "/T", "A402": "/T", "A403": "/T", "A501": "", "A502": "", "A503": "",
}
ANTI_COL = [("", "Negro"), ("/G", "Gris RAL 7040"), ("/G6", "Gris RAL 9006"), ("/B", "Blanco"),
            ("/A", "Efecto acero"), ("/X", "Efecto cromado")]

def tabla_anti(pref):
    filas = []
    for suf, col in ANTI_COL:
        art = pref + (ANTI_SUF[pref] if suf == "" else suf)
        filas.append([art, col, "1"])
    return ["Art.", "Color", "Caja"], filas

def revisar_cil(nombre, filas):
    """Marca filas de cilindro cuyo código no cuadra con sus medidas (erratas del PDF)."""
    marcas = {}
    medio = "Medio" in nombre
    for i, f in enumerate(filas):
        _, L, A, B, lat, niq = f[:6]
        ab = A + B
        msgs = []
        if lat[4:4 + len(ab)] != ab:
            msgs.append(f"el código de latón no corresponde a {A}/{B}")
        if niq[4:4 + len(ab)] != ab:
            msgs.append(f"el código de níquel no corresponde a {A}/{B}")
        if lat[:-3] != niq[:-3] and not msgs:
            msgs.append("los códigos de latón y níquel no son de la misma medida")
        if not medio and L.isdigit() and A.isdigit() and B.isdigit() and int(L) != int(A) + int(B):
            msgs.append(f"L={L} no es la suma de A y B ({int(A) + int(B)})")
        if msgs:
            marcas[i] = "Posible errata del PDF: " + "; ".join(msgs) + "."
    return marcas

def post(cols, filas):
    """Une Derecha/Izquierda en Mano y convierte marcas X."""
    if "Derecha" in cols or "Izquierda" in cols:
        iD = cols.index("Derecha") if "Derecha" in cols else None
        iI = cols.index("Izquierda") if "Izquierda" in cols else None
        nuevas = []
        for f in filas:
            d = iD is not None and f[iD].strip().upper() == "X"
            i = iI is not None and f[iI].strip().upper() == "X"
            mano = "Derecha e izquierda" if d and i else "Derecha" if d else "Izquierda" if i else ""
            g = [v for k, v in enumerate(f) if k not in (iD, iI)]
            pos = min(x for x in (iD, iI) if x is not None)
            g.insert(pos, mano)
            nuevas.append(g)
        c = [v for k, v in enumerate(cols) if k not in (iD, iI)]
        c.insert(min(x for x in (iD, iI) if x is not None), "Mano")
        cols, filas = c, nuevas
    for k, c in enumerate(cols):
        if c in ("DCF", "DCS", "Barras", "Pernio"):
            for f in filas:
                f[k] = "Sí" if f[k].strip().upper() == "X" or f[k] == "✓" else ""
    # quita columnas totalmente vacías
    keep = [k for k in range(len(cols)) if any(f[k].strip() for f in filas)]
    return [cols[k] for k in keep], [[f[k] for k in keep] for f in filas]

# ------------------------------------------------------------------ imágenes
def _vis_info(pn, xref, inst=0):
    page = doc[pn - 1]
    infos = [i for i in page.get_image_info(xrefs=True) if i["xref"] == xref]
    if not infos:
        raise ValueError(f"xref {xref} no está en la página {pn}")
    return page, infos[min(inst, len(infos) - 1)]

def pil_desde_xref(xref):
    pix = fitz.Pixmap(doc, xref)
    if pix.alpha:
        pix = fitz.Pixmap(pix, 0)
    if pix.n not in (3,):
        pix = fitz.Pixmap(fitz.csRGB, pix)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    smask = doc.extract_image(xref).get("smask") or 0
    if smask:
        m = fitz.Pixmap(doc, smask)
        if m.n != 1:
            m = fitz.Pixmap(fitz.csGRAY, m)
        mask = Image.frombytes("L", (m.width, m.height), m.samples).resize(img.size)
        fondo = Image.new("RGB", img.size, "white")
        fondo.paste(img, (0, 0), mask)
        img = fondo
    return img

def recortar_blanco(img, pad=0.04, umbral=238):
    g = img.convert("L").point(lambda v: 255 if v < umbral else 0)
    bb = g.getbbox()
    if bb:
        img = img.crop(bb)
    w, h = img.size
    p = int(max(w, h) * pad)
    lienzo = Image.new("RGB", (w + 2 * p, h + 2 * p), "white")
    lienzo.paste(img, (p, p))
    return lienzo

def imagen(spec):
    if spec[0] == "f":
        # foto real que ya existe en la biblioteca de imágenes (ruta relativa a la raíz del proyecto)
        _, ruta, crop = spec
        img = Image.open(os.path.normpath(os.path.join(RAIZ, ruta))).convert("RGB")
        if crop:
            W, H = img.size
            img = img.crop((int(crop[0] * W), int(crop[1] * H), int(crop[2] * W), int(crop[3] * H)))
        return recortar_blanco(img)
    if spec[0] == "r":
        _, pn, rect = spec
        pix = doc[pn - 1].get_pixmap(matrix=fitz.Matrix(4, 4), clip=fitz.Rect(rect), alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        return recortar_blanco(img)
    _, pn, xref, crop = spec[:4]
    inst = spec[4] if len(spec) > 4 else 0
    page, info = _vis_info(pn, xref, inst)
    a, b, c, d = info["transform"][:4]
    img = pil_desde_xref(xref)
    if abs(b) > 1e-3 or abs(c) > 1e-3 or a < 0 or d < 0:
        # imagen girada: se renderiza la zona visible de la página
        r = fitz.Rect(info["bbox"]) & page.rect
        pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=r, alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        fl, ft, fr, fb = 0, 0, 1, 1
    else:
        bb = fitz.Rect(info["bbox"])
        vis = bb & page.rect
        fl, ft = (vis.x0 - bb.x0) / bb.width, (vis.y0 - bb.y0) / bb.height
        fr, fb = (vis.x1 - bb.x0) / bb.width, (vis.y1 - bb.y0) / bb.height
    if crop:
        cl, ct, cr, cb = crop
        fl, fr = fl + cl * (fr - fl), fl + cr * (fr - fl)
        ft, fb = ft + ct * (fb - ft), ft + cb * (fb - ft)
    W, H = img.size
    img = img.crop((int(fl * W), int(ft * H), int(fr * W), int(fb * H)))
    return recortar_blanco(img)

def guardar(img, ruta_rel, maxlado):
    ruta = os.path.join(RAIZ, ruta_rel)
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    im = img.copy()
    im.thumbnail((maxlado, maxlado), Image.LANCZOS)
    im.save(ruta, "JPEG", quality=86, optimize=True, progressive=True)
    return ruta_rel, im.size

def foto(spec, nombre):
    img = imagen(spec)
    grande, tam = guardar(img, f"img/productos/{nombre}.jpg", 1100)
    mini, _ = guardar(img, f"img/productos/mini/{nombre}.jpg", 520)
    return {"src": grande, "mini": mini, "w": tam[0], "h": tam[1], "orig": list(img.size)}

def plano_auto(pn):
    page = doc[pn - 1]
    cands = [i for i in page.get_image_info(xrefs=True)
             if i["width"] >= 150 and i["height"] >= 150 and i["bbox"][0] < 200 and i["bbox"][1] > 120]
    if not cands:
        return None
    cands.sort(key=lambda i: i["bbox"][1])
    return ("x", pn, cands[0]["xref"], None)

# ------------------------------------------------------------------ construir
def construir():
    productos = []
    for p in PRODUCTOS:
        pid = p["id"]
        out = {k: p[k] for k in ("id", "fam", "mod", "art", "nombre", "sub", "pag") if k in p}
        if p.get("destacado"):
            out["destacado"] = p["destacado"]
        out["foto"] = foto(p["foto"], pid)
        out["fotos"] = [foto(s, f"{pid}--extra{i+1}") for i, s in enumerate(p.get("fotos", []))]
        out["ficha"] = [{"t": t, "items": items} for t, items in p.get("ficha", [])]
        variantes = []
        for vi, v in enumerate(p["variantes"]):
            vid = f"v{vi+1}"
            tipo = v.get("tipo", "gen")
            if tipo == "cil":
                filas = []
                for tf in v["tablas"]:
                    pn, idx = int(tf), int(round((tf - int(tf)) * 10))
                    filas += tabla_cil(pn, idx)
                cols = ["Leva"] + list(__import__("productos").CIL)
            elif tipo == "manual":
                cols, filas = list(v["cols"]), [list(f) for f in v["filas"]]
            elif tipo == "dc":
                cols, filas = None, []
                for pn, idx in v["tablas"]:
                    c, f = tabla_dc(pn, idx)
                    cols = c
                    filas += f
            elif tipo == "anti":
                cols, filas = tabla_anti(v["pref"])
            else:
                cols, filas = None, []
                for spec in v["tablas"]:
                    c, f = tabla_generica(spec)
                    if cols and c != cols:
                        # misma estructura con columnas extra distintas
                        avisos.append(f"{pid}/{vid}: columnas distintas {c} vs {cols}")
                    cols = cols or c
                    filas += f
            cols, filas = post(cols, filas)
            if not filas:
                avisos.append(f"{pid}/{vid} sin filas")
            vo = {"id": vid, "nombre": v["nombre"], "pag": v.get("pag", p["pag"]), "cols": cols, "filas": filas}
            if tipo == "cil":
                marcas = revisar_cil(v["nombre"], filas)
                if marcas:
                    vo["revisar"] = {str(k): m for k, m in marcas.items()}
                    for k, m in marcas.items():
                        avisos.append(f"{pid}/{v['nombre']} fila {filas[k][:6]}: {m}")
            if v.get("art"):
                vo["art"] = v["art"]
            if v.get("nota"):
                vo["nota"] = v["nota"]
            if v.get("foto"):
                vo["foto"] = foto(v["foto"], f"{pid}--{vid}")
            pl = plano_auto(vo["pag"]) if v.get("plano") == "auto" else v.get("plano")
            if pl:
                img = imagen(pl)
                src, tam = guardar(img, f"img/planos/{pid}--{vid}.jpg", 900)
                vo["plano"] = {"src": src, "w": tam[0], "h": tam[1]}
            variantes.append(vo)
        out["variantes"] = variantes
        productos.append(out)

    paneles = {}
    for fam, pnl in PANELES.items():
        q = dict(pnl)
        if "imagen" in q:
            img = imagen(q["imagen"])
            src, tam = guardar(img, f"img/planos/panel-{fam}.jpg", 1000)
            q["imagen"] = {"src": src, "w": tam[0], "h": tam[1]}
        paneles[fam] = q

    fams = []
    for f in FAMILIAS:
        ps = [p for p in productos if p["fam"] == f["id"]]
        q = dict(f)
        q["modelos"] = len(ps)
        q["refs"] = sum(len(v["filas"]) for p in ps for v in p["variantes"])
        q["portada"] = ps[0]["foto"]["mini"] if ps else None
        fams.append(q)

    # compatibilidades con otras marcas
    comp, av = compatibilidades.leer(os.path.join(RAIZ, "_fuente", COMPAT_PDF))
    avisos.extend(av)
    ids = {p["id"]: p for p in productos}
    for f in comp["filas"]:
        enlace = COMPAT_ENLACES.get(f["art"])
        if enlace:
            pid, vid = enlace
            if pid not in ids:
                avisos.append(f"compatibilidad {f['art']}: producto {pid} inexistente")
                continue
            f["pid"] = pid
            if vid:
                if not any(v["id"] == vid for v in ids[pid]["variantes"]):
                    avisos.append(f"compatibilidad {f['art']}: versión {vid} inexistente en {pid}")
                f["vid"] = vid
    for art in COMPAT_ENLACES:
        if not any(f["art"] == art for f in comp["filas"]):
            avisos.append(f"compatibilidad: el artículo {art} ya no está en la tabla")
    # logos de las marcas, tal y como aparecen en la tabla de compatibilidades
    dc = fitz.open(os.path.join(RAIZ, "_fuente", COMPAT_PDF))
    comp["logos"] = {}
    for m, (pn, xref) in comp.pop("_logos").items():
        pix = fitz.Pixmap(dc, xref)
        if pix.alpha:
            pix = fitz.Pixmap(pix, 0)
        if pix.n != 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        smask = dc.extract_image(xref).get("smask") or 0
        if smask:
            mk = fitz.Pixmap(dc, smask)
            if mk.n != 1:
                mk = fitz.Pixmap(fitz.csGRAY, mk)
            mask = Image.frombytes("L", (mk.width, mk.height), mk.samples).resize(img.size)
            fondo = Image.new("RGB", img.size, "white"); fondo.paste(img, (0, 0), mask); img = fondo
        img = recortar_blanco(img, pad=0.03, umbral=245)
        img.thumbnail((360, 120), Image.LANCZOS)
        nombre = re.sub(r"[^a-z0-9]+", "-", m.lower()).strip("-")
        ruta = f"img/marcas/{nombre}.png"
        os.makedirs(os.path.join(RAIZ, "img", "marcas"), exist_ok=True)
        img.save(os.path.join(RAIZ, ruta), optimize=True)
        comp["logos"][m] = {"src": ruta, "w": img.size[0], "h": img.size[1]}
    vacias = [m for m in comp["marcas"] if not any(m in f["refs"] for f in comp["filas"])]
    comp["marcas"] = [m for m in comp["marcas"] if m not in vacias]
    comp["marcas_vacias"] = vacias
    comp["titulo"] = "Tabla de compatibilidades ICSA, junio 2026"

    datos = {
        "generado": datetime.date.today().isoformat(),
        "fuente": {"titulo": "Catálogo general ICSA España 2026", "pdf": "https://icsacerraduras.es/img/catalogo/CATALOGO_IC_w011.pdf",
                   "paginas": doc.page_count},
        "familias": fams,
        "productos": productos,
        "paneles": paneles,
        "compat": comp,
    }
    os.makedirs(os.path.dirname(OUT_DATA), exist_ok=True)
    with open(OUT_DATA, "w", encoding="utf-8") as fh:
        fh.write("/* Generado por _generador/construir_catalogo.py. No editar a mano. */\n")
        fh.write("window.ICSA = ")
        json.dump(datos, fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")
    total = sum(f["refs"] for f in fams)
    enl = sum(1 for f in comp["filas"] if f.get("pid"))
    print(f"Compatibilidades: {len(comp['filas'])} artículos ({enl} enlazados al catálogo), "
          f"{sum(len(f['refs']) for f in comp['filas'])} equivalencias, {len(comp['marcas'])} marcas"
          + (f"; sin datos: {', '.join(vacias)}" if vacias else ""))
    print(f"{len(productos)} productos, {sum(len(p['variantes']) for p in productos)} variantes, {total} referencias")
    for f in fams:
        print(f"  {f['nombre']}: {f['modelos']} modelos, {f['refs']} refs")
    if avisos:
        print("AVISOS:")
        for a in avisos:
            print("  -", a)

if __name__ == "__main__":
    construir()
