# -*- coding: utf-8 -*-
"""Lee la tabla de compatibilidades ICSA (PDF exportado de Excel) y devuelve
{marcas: [...], filas: [{art, refs: {marca: referencia}}]} en el orden del PDF."""
import fitz

# erratas evidentes en las cabeceras del PDF
MARCAS_CORREGIDAS = {"EZQURRA": "EZCURRA"}


def leer(ruta):
    fitz.TOOLS.mupdf_display_errors(False)
    doc = fitz.open(ruta)
    tabla, orden, marcas_tot, avisos = {}, [], [], []
    logos = {}  # marca -> (página, xref) del logo de la cabecera
    for pn in range(doc.page_count):
        ws = doc[pn].get_text("words")
        cab = [w for w in ws if w[1] < 170 and w[4].isupper() and w[4] not in ("TABLA", "COMPATIBILDADES", "JUNIO")]
        ycab = min(w[1] for w in cab if w[4] == "ICSA")
        cab = sorted([w for w in cab if abs(w[1] - ycab) < 4], key=lambda w: w[0])
        centros = [((w[0] + w[2]) / 2, MARCAS_CORREGIDAS.get(w[4], w[4])) for w in cab]
        marcas = [m for _, m in centros]
        limites = [(centros[i][0] + centros[i + 1][0]) / 2 for i in range(len(centros) - 1)]
        cuerpo = [w for w in ws if ycab + 40 < (w[1] + w[3]) / 2 < 790]

        def col(w):
            return marcas[sum(1 for l in limites if w[0] + 1 > l)]

        for info in doc[pn].get_image_info(xrefs=True):
            x0, y0, x1, y1 = info["bbox"]
            if ycab - 2 < y0 < ycab + 30 and y1 < ycab + 60:
                cx = (x0 + x1) / 2
                m = marcas[sum(1 for l in limites if cx > l)]
                if m != "ICSA" and m not in logos:
                    logos[m] = (pn + 1, info["xref"])

        # filas: una por cada artículo de la columna ICSA
        icsa = sorted([w for w in cuerpo if col(w) == "ICSA"], key=lambda w: (w[1], w[0]))
        filas = []
        for w in icsa:
            yc = (w[1] + w[3]) / 2
            if filas and abs(filas[-1][0] - yc) < 3:
                filas[-1][1].append(w[4])
            else:
                filas.append([yc, [w[4]]])
        celdas = [dict() for _ in filas]
        for w in cuerpo:
            m = col(w)
            if m == "ICSA":
                continue
            yc = (w[1] + w[3]) / 2
            k = min(range(len(filas)), key=lambda i: abs(filas[i][0] - yc))
            if abs(filas[k][0] - yc) > 7:
                avisos.append(f"P{pn + 1}: «{w[4]}» ({m}) sin fila cercana")
                continue
            celdas[k].setdefault(m, []).append(w[4])
        for (yc, palabras), c in zip(filas, celdas):
            art = " ".join(palabras)
            if art not in tabla:
                tabla[art] = {}
                orden.append(art)
            for m, v in c.items():
                tabla[art][m] = " ".join(v)
        marcas_tot += [m for m in marcas if m != "ICSA" and m not in marcas_tot]
    for m in marcas_tot:
        if m not in logos:
            avisos.append(f"sin logo para {m}")
    return {"marcas": marcas_tot, "filas": [{"art": a, "refs": tabla[a]} for a in orden], "_logos": logos}, avisos


if __name__ == "__main__":
    import os, sys
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    datos, avisos = leer(os.path.join(raiz, "_fuente", "COMPATIBILIDADES_ICSA_JUNIO_2026.pdf"))
    print(len(datos["filas"]), "artículos,", len(datos["marcas"]), "marcas:", ", ".join(datos["marcas"]))
    print(sum(len(f["refs"]) for f in datos["filas"]), "equivalencias")
    for f in datos["filas"]:
        print(f"{f['art']:12}", f["refs"])
    for a in avisos:
        print("AVISO", a)
