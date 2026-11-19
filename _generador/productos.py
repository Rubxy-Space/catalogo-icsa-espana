# -*- coding: utf-8 -*-
"""Definición del catálogo ICSA España 2026 (fuente: _fuente/CATALOGO_IC_w011.pdf).

Cada producto apunta a sus páginas del PDF. Las fotos se toman de las imágenes
originales incrustadas en el PDF (fotos reales, sin retoque); las tablas de
referencias se leen del texto del PDF con construir_catalogo.py.

Especificación de foto: ("x", página, xref, recorte, instancia)
  recorte = (izq, arriba, der, abajo) en fracciones de la imagen visible, o None.
  ("r", página, (x0, y0, x1, y1)) renderiza esa zona de la página.
"""

CIL = ["L", "A", "B", "Latón", "Níquel", "Caja", "Embalaje"]
CAJA2 = ["Caja", "Embalaje"]

FAMILIAS = [
    {"id": "cilindros", "nombre": "Cilindros", "pag": 3,
     "texto": "Perfil europeo y ovalado, de serreta a alta seguridad con certificación SKG***. Doble, doble embrague, con pomo y medio cilindro."},
    {"id": "metalica", "nombre": "Carpintería metálica", "pag": 36,
     "texto": "Cerraduras de embutir para perfil metálico, multipunto, cortafuego y multiuso, con sus cerraderos, rosetas y packs."},
    {"id": "madera", "nombre": "Carpintería de madera", "pag": 55,
     "texto": "Cerraduras de embutir para puerta de madera: tres puntos, canto cuadrado y redondo, solo pastilla y picaporte."},
    {"id": "sobreponer", "nombre": "Cerraduras de sobreponer", "pag": 62,
     "texto": "Cerraduras y cerrojos de sobreponer y solapar, de alta seguridad y para persianas."},
    {"id": "garaje", "nombre": "Cerraduras eléctricas y garaje", "pag": 71,
     "texto": "Cerraduras eléctricas de sobreponer con entrada ajustable de 50 a 80 mm, para puertas de garaje y cancelas."},
    {"id": "cierrapuertas", "nombre": "Cierrapuertas", "pag": 76,
     "texto": "Cierrapuertas aéreos de brazo y de guía deslizante, con y sin retención, en plata, negro y blanco."},
    {"id": "antipanicos", "nombre": "Antipánicos", "pag": 84,
     "texto": "Dispositivos antipánico de embutir y sobreponer conformes a EN 1125:2008, de uno a tres puntos de cierre, y sus barras."},
    {"id": "candados", "nombre": "Candados", "pag": 101,
     "texto": "Candados de latón de arco corto y largo, y candado blindado para persiana."},
]

# --------------------------------------------------------------------------
# Fichas técnicas (texto del PDF, corregidas solo las erratas evidentes)
# --------------------------------------------------------------------------
F_HS10 = [
    ("Características técnicas", [
        "Resistente al bumping y al picking",
        "Sistema de cifrado de 10 pernos (6 activos y 4 pasivos)",
        "Cuerpo de latón con dos láminas en toda la longitud del cilindro",
        "Rotores de latón",
        "Leva de fricción en acero sinterizado autolubricante",
        "Pernos de acero cementado en primera y tercera posición",
        "Pernos de latón niquelado",
        "Contrapernos de acero cementado en primera y tercera posición",
        "Contrapernos de latón niquelado y contrapernos especiales antibumping",
        "Muelles de acero inoxidable",
        "Leva DIN o leva corta desplazada de acero sinterizado",
    ]),
    ("Resistencia a la perforación", [
        "Perno de acero templado en ambos lados del cuerpo del cilindro",
        "Contraperno de acero templado en primera posición",
        "Contrapernos de forma especial",
    ]),
    ("Llaves planas reversibles", [
        "De aleación especial de latón, niqueladas",
        "Con numeración de código en la cabeza de la llave",
    ]),
    ("Normas", [
        "Conforme a la norma EN 1303:05",
        "Resistencia al ataque: grado 1",
        "Seguridad de llave: grado 6",
        "Durabilidad: grado 6",
        "1.600.000 combinaciones",
    ]),
    ("Dotación", ["5 llaves y 5 cabezas de plástico", "Tarjeta de código", "Tornillo de fijación 5M x 50"]),
    ("Acabados", ["Latón", "Níquel satinado"]),
]

F_HS6PRO = [
    ("Características técnicas", [
        "Cuerpo de latón con rotura controlada",
        "6 pernos en total, dos de ellos de acero inoxidable antitaladro",
        "4 contrapernos de latón y 2 de acero inoxidable: 2 antipicking y 2 antibumping",
        "Pernos de acero templado antitaladro en el cuerpo",
        "Rotores de latón",
        "Muelles de acero inoxidable",
        "Leva larga DIN 30° de acero sinterizado autolubricante",
    ]),
    ("Llaves planas reversibles", [
        "Específicas, de latón niquelado",
        "Llave larga compatible con escudo",
        "Con numeración de código en la cabeza de la llave",
    ]),
    ("Normas", ["Conforme a la norma EN 1303:2005", "Durabilidad: grado 5", "30.000 cifrados"]),
    ("Dotación", [
        "5 llaves en bolsa de nailon negra termosellada",
        "Tornillo 5M x 72 mm",
        "Tarjeta de propiedad en bolsa de nailon negra termosellada",
    ]),
    ("Opcional", ["5 cabezas de plástico negro para las llaves"]),
    ("Acabados", ["Latón", "Latón niquelado satinado", "Acabados especiales bajo pedido"]),
]

F_HS6 = [
    ("Características técnicas", [
        "Cuerpo de latón",
        "Rotores de latón",
        "Leva DIN sobresaliente 30° de acero sinterizado autolubricante",
        "6 pernos de latón",
        "Contrapernos de latón",
        "Muelles de acero inoxidable",
    ]),
    ("Llaves planas reversibles", [
        "De latón niquelado",
        "Llave larga",
        "Cifrado de código asignado en la cabeza de la llave",
    ]),
    ("Normas", ["Conforme a la norma EN 1303:2005", "Durabilidad: grado 5", "30.000 cifrados"]),
    ("Dotación", ["5 llaves", "Tornillo de fijación 5M x 50 mm"]),
    ("Acabados", ["Latón", "Latón niquelado satinado", "Acabados especiales bajo pedido"]),
]

F_S3 = [
    ("Características técnicas", [
        "Cuerpo de latón",
        "Rotores de latón",
        "Leva DIN sobresaliente 30° de acero sinterizado autolubricante",
        "6 pernos de latón (2 pernos de acero inoxidable)",
        "4 contrapernos de latón y 2 de acero inoxidable: 2 antipicking y 2 antibumping",
        "Muelles de acero inoxidable",
        "Insertos de acero templado antitaladro en los rotores",
        "Pernos de acero templado antitaladro en el cuerpo",
    ]),
    ("Llaves", ["Específicas, de latón niquelado", "Con numeración de código en la cabeza de la llave"]),
    ("Normas", ["Certificado SKG***", "Conforme a la norma EN 1303:2005", "Durabilidad: grado 6", "100.000 cifrados"]),
    ("Dotación", ["3 llaves", "Tornillo de fijación 5M x 65", "Instrucciones"]),
    ("Acabados", ["Latón", "Latón niquelado satinado", "Acabados especiales bajo pedido"]),
    ("Certificación SKG", [
        "Garantiza que el cilindro cumple los requisitos de seguridad más altos frente a las técnicas de rotura más comunes.",
    ]),
]

F_C5 = [
    ("Características técnicas", [
        "Cuerpo de latón",
        "Rotores de latón",
        "Leva DIN sobresaliente 30° de acero sinterizado autolubricante",
        "Levas redondas de acero sinterizado autolubricante bajo pedido",
        "5 pernos de latón (27/27 y 27/33: 4 pernos)",
        "Contrapernos de latón",
        "Muelles de acero inoxidable",
    ]),
    ("Llaves", ["De latón niquelado"]),
    ("Normas", ["Conforme a la norma EN 1303:2005", "Durabilidad: grado 5", "30.000 cifrados"]),
    ("Dotación", ["3 llaves", "Tornillo de fijación 5M x 50"]),
    ("Acabados", ["Latón", "Latón niquelado satinado", "Latón níquel brillo", "Acabados especiales bajo pedido"]),
]

F_C4 = [
    ("Características técnicas", [
        "Cuerpo de latón",
        "Rotores de latón",
        "Leva redonda de acero sinterizado autolubricante",
        "Leva DIN sobresaliente 30° de acero sinterizado autolubricante bajo pedido",
        "5 pernos de latón",
        "Contrapernos de latón",
        "Muelles de acero inoxidable",
    ]),
    ("Llaves", ["De latón niquelado"]),
    ("Normas", ["Conforme a la norma EN 1303:2005", "Durabilidad: grado 5", "30.000 cifrados"]),
    ("Dotación", ["3 llaves", "Tornillo de fijación 5M x 50"]),
    ("Acabados", ["Latón", "Latón niquelado satinado", "Latón níquel brillo", "Acabados especiales bajo pedido"]),
]

F_L18 = [
    ("Características técnicas", [
        "Caja de acero galvanizado",
        "Palanca basculante niquelada",
        "Picaporte ajustable y reversible, niquelado",
        "Frente plano o en U",
        "3 palancas laterales basculantes",
        "Palanca basculante individual en el art. 118",
    ]),
    ("Dotación", ["Tornillos de fijación de la cerradura"]),
    ("Acabados", ["Acero inoxidable AISI 304", "Aluminio anodizado en U (art. 118)"]),
    ("Bajo pedido", ["Cerraderos específicos", "Bocallaves de nailon negro"]),
]

F_E70 = [
    ("Características técnicas", [
        "Caja, cerradero y placa protectora de acero pintado gris aluminio",
        "Entrada ajustable de 50, 60, 70 y 80 mm",
        "Apertura interior",
        "Picaporte de bloqueo automático",
        "Tensión 12 V CA, consumo 2,5 A",
        "Cilindro y botón interiores, cilindro exterior (art. 2770)",
        "Cilindro exterior e interior (art. 2170)",
        "Dispositivo de parada integrado (art. 2770)",
        "Botón de ABS",
        "Mano derecha o izquierda",
        "Intercambiable con la mayoría de las cerraduras existentes",
        "Cilindro exterior de 5 pernos, cuerpo y rotores de latón, muelles de bronce",
    ]),
    ("Normas", ["Conforme a la norma prEN 14846:08", "Grado 3 de seguridad (500 kg de empuje lateral y 200 kg de carga frontal)"]),
    ("Dotación", ["3 llaves de latón niquelado", "Tornillos de fijación", "Cerradero", "Placa protectora", "Bocallave", "Hoja de instrucciones"]),
]

F_E76 = [
    ("Características técnicas", [
        "Caja, cerradero, placa protectora y placa pequeña de acero pintado negro",
        "Palanca de 2 vueltas manuales",
        "Entrada ajustable de 50, 60, 70 y 80 mm",
        "Apertura interior",
        "Picaporte de bloqueo automático",
        "Tensión 12 V CA, consumo 2,5 A",
        "Cilindro y botón interiores, cilindro exterior (art. 2776)",
        "Cilindro exterior e interior (art. 2176)",
        "Botón y placa de cubierta del botón de ABS",
        "Mano derecha o izquierda",
        "Intercambiable con la mayoría de las cerraduras existentes",
        "Cilindro exterior de 5 pernos, cuerpo y rotores de latón, muelles de bronce",
    ]),
    ("Normas", ["Conforme a la norma prEN 14846:08 (3C200L302)", "Grado 3 de seguridad (500 kg de empuje lateral y 200 kg de carga frontal)"]),
    ("Dotación", ["3 llaves de latón niquelado", "Tornillos de fijación", "Cerradero", "Placa protectora", "Bocallave", "Placa de cubierta del botón de ABS", "Hoja de instrucciones"]),
]

F_DC6 = [
    ("Características técnicas", [
        "Cuerpo monobloque de zamak",
        "Brazo de acero",
        "Muelle de acero especial en baño de lubricante",
        "Válvulas de regulación independientes con dispositivo termostático",
        "Válvula de sobrecarga",
        "Puertas de hasta 65 kg y 900 mm",
        "Dispositivo de parada integrado en el cuerpo bajo pedido (art. 603)",
    ]),
    ("Accionamiento", [
        "Fuerza de cierre 2",
        "Velocidad de cierre de 180° a 15° regulable con su válvula",
        "Golpe final de 15° a 0° regulable con su válvula",
    ]),
    ("Normativas", ["Art. 600 con brazo saliente: 483113", "Art. 600 con brazo y travesaño paralelos: 383113"]),
    ("Dotación", ["Tornillos de fijación", "Tapa", "Instrucciones de montaje"]),
    ("Acabados", ["Plata", "Negro", "Blanco", "Acabados especiales bajo pedido"]),
]

ACAB_ANTI = ["Negro RAL 9005", "Gris RAL 7040", "Plata RAL 9006", "Blanco RAL 9010",
             "Pintura efecto acero inoxidable", "Cromo satinado", "Acabados especiales bajo pedido"]

F_A1 = [
    ("Características técnicas", ["Reversible", "Picaporte de acero", "Capuchones de acero pintado"]),
    ("Normativas", ["Conforme a la norma EN 1125:2008", "377B1421AA", "Apto para puertas cortafuego"]),
    ("Acabados", ACAB_ANTI),
    ("Importante", ["Utilice solo contactos y cerraduras originales. Otras combinaciones comprometen el funcionamiento y anulan la certificación CE."]),
]
F_A4 = [
    ("Características técnicas", [
        "Reversible", "Componible", "Intercambiable con otros tipos de montante",
        "Picaporte de acero", "Capuchones de acero pintado", "12 V CA/CC, 1 A en el art. A401/TEL",
    ]),
    ("Normativas", ["Conforme a la norma EN 1125:2008", "377B1422AA", "Art. A401/TEL: 377O1422AA"]),
    ("Dotación", ["Cerradero A490/5", "Tornillos", "Hoja de instrucciones"]),
    ("Acabados", ACAB_ANTI),
]
F_A5 = [
    ("Características técnicas", [
        "Reversible", "Componible", "Intercambiable con otros tipos de montante",
        "Picaporte de acero", "Capuchones de acero pintado",
    ]),
    ("Normativas", ["Conforme a la norma EN 1125:2008", "377B1422AA"]),
    ("Dotación", ["Cerradero A490/5", "Tornillos", "Hoja de instrucciones"]),
    ("Acabados", ACAB_ANTI),
]
F_A6 = [
    ("Características técnicas", [
        "Reversible", "Componible", "Picaporte de acero", "Capuchones de acero pintado",
        "Cárter y barra de aluminio", "12 V CA/CC, 1 A en el art. A601/TEL",
        "2 a 20 V CA 1 A, 12 a 30 V CC en el art. A603/MOT",
    ]),
    ("Normativas", ["Conforme a la norma EN 1125:2008", "377B1422BA", "Art. A601/EL y A601/MOT: 37701422BA"]),
    ("Dotación", ["Cerradero A490/5", "Tornillos", "Hoja de instrucciones"]),
    ("Acabados", [
        "Negro y rojo RAL 9005/3020", "Negro y verde RAL 9005/6029", "Negro RAL 9005",
        "Gris RAL 7040", "Plata RAL 9006", "Blanco RAL 9010", "Negro y aluminio anodizado",
        "Pintura efecto acero inoxidable", "Cromo satinado", "Acabados especiales bajo pedido",
    ]),
]

# --------------------------------------------------------------------------
# Productos
# --------------------------------------------------------------------------
def cil(nombre, pag, tablas, art, foto=None):
    return {"nombre": nombre, "pag": pag, "art": art, "tipo": "cil", "tablas": tablas, "foto": foto, "plano": "auto"}

def t(pag, idx, cols, extra=None):
    return {"pag": pag, "t": idx, "cols": cols, "extra": extra or {}}

D6 = ["D", "E", "F", "Código", "Caja", "Embalaje"]

PRODUCTOS = [
    # ------------------------------------------------------------- CILINDROS
    {"id": "s10-hs10", "fam": "cilindros", "mod": "S10", "art": "HS10", "pag": 5,
     "nombre": "Cilindro de alta seguridad S10",
     "sub": "Perfil europeo, 10 pernos, antibumping y antipicking",
     "foto": ("x", 5, 2492, None), "ficha": F_HS10, "destacado": "EN 1303 · grado 6",
     "variantes": [
         cil("Doble cilindro", 6, [6.0], "HS10"),
         cil("Doble embrague", 7, [7.0], "HS10/F"),
         cil("Con pomo de zamak", 8, [8.0], "HS10 168Z"),
     ]},
    {"id": "s6-hs6pro", "fam": "cilindros", "mod": "S6", "art": "HS6 PRO", "pag": 9,
     "nombre": "Cilindro de alta seguridad HS6 PRO",
     "sub": "Perfil europeo con rotura controlada y pernos antitaladro",
     "foto": ("x", 9, 4441, None), "ficha": F_HS6PRO, "destacado": "Rotura controlada",
     "variantes": [
         cil("Doble cilindro", 10, [10.0], "HS6 PRO"),
         cil("Doble embrague", 11, [11.0, 11.1], "HS6 PRO/F"),
         cil("Con pomo de zamak", 12, [12.0], "HS6 PRO 168Z"),
         cil("Medio cilindro", 14, [14.0, 14.1], "HS6 PRO medio"),
     ]},
    {"id": "s6-hs6", "fam": "cilindros", "mod": "S6", "art": "HS6", "pag": 13,
     "nombre": "Cilindro de seguridad HS6",
     "sub": "Perfil europeo, 6 pernos, llave plana reversible",
     "foto": ("x", 13, 6255, None), "ficha": F_HS6, "destacado": "Llave reversible",
     "variantes": [
         cil("Doble cilindro", 15, [15.0], "HS6"),
         cil("Doble embrague", 16, [16.0, 16.1], "HS6/F"),
         cil("Con pomo de zamak", 17, [17.0], "HS6 168Z"),
         cil("Medio cilindro", 18, [18.0, 18.1], "HS6 medio"),
     ]},
    {"id": "s3-skg", "fam": "cilindros", "mod": "S3", "art": "149", "pag": 19,
     "nombre": "Cilindro de serreta certificado SKG***",
     "sub": "Perfil europeo con insertos antitaladro y certificación SKG de tres estrellas",
     "foto": ("x", 19, 8384, None), "ficha": F_S3, "destacado": "SKG***",
     "variantes": [
         cil("Doble cilindro", 20, [20.0], "149"),
         cil("Doble embrague", 21, [21.0], "149/F D.E."),
         cil("Con pomo de latón", 22, [22.0], "164 pomo"),
         cil("Medio cilindro", 23, [23.0], "78 medio cilindro"),
     ]},
    {"id": "c5-serreta", "fam": "cilindros", "mod": "C5", "art": "150", "pag": 24,
     "nombre": "Cilindro de serreta C5",
     "sub": "Perfil europeo de 5 pernos, la gama de uso general",
     "foto": ("x", 24, 9505, None), "ficha": F_C5, "destacado": "5 pernos",
     "variantes": [
         cil("Doble cilindro serreta eco", 25, [25.0], "150"),
         cil("Doble embrague", 26, [26.0, 26.1], "150/F"),
         cil("Con pomo de zamak", 27, [27.0, 27.1], "168/Z"),
         cil("Medio cilindro", 28, [28.0, 28.1], "75"),
     ]},
    {"id": "c4-ovalado", "fam": "cilindros", "mod": "C4", "art": "180", "pag": 29,
     "nombre": "Cilindro ovalado C4",
     "sub": "Perfil ovalado con leva redonda",
     "foto": ("f", "../ICSA/CILINDROS/C4/27X27/LATON/C42727L.jpg", (0.04, 0.03, 0.84, 0.8)), "ficha": F_C4, "destacado": "Leva redonda",
     "variantes": [
         cil("Doble cilindro ovalado", 30, [30.0], "180"),
         dict(cil("Medio cilindro ovalado", 30, [30.1], "90"), plano=("x", 30, 11123, None)),
     ]},
    {"id": "maletines-mk", "fam": "cilindros", "mod": "MK/GMK", "art": "C5MK · C6MK · S10MK", "pag": 31,
     "nombre": "Maletines de igualamiento y amaestramiento",
     "sub": "Piezas para igualar y amaestrar cilindros en taller",
     "foto": ("x", 31, 11310, (0, 0, 1, 0.31)),
     "variantes": [{"nombre": "Maletines", "pag": 31, "tipo": "manual",
                    "cols": ["Art.", "Descripción", "Adaptable para"],
                    "filas": [["C5MK", "Maletín de piezas para igualamiento y amaestramiento", "C5"],
                              ["C6MK", "Maletín de piezas para igualamiento y amaestramiento", "C6, S2, S3, S5, S6, S7, S8"],
                              ["S10MK", "Maletín de piezas para igualamiento y amaestramiento", "S10"]]}]},
    {"id": "llaves", "fam": "cilindros", "mod": "Llaves", "art": "200 a 860", "pag": 32,
     "nombre": "Llaves en bruto y cubrellaves",
     "sub": "Llaves para copia y cubrellaves por modelo de cilindro y cerradura",
     "foto": ("r", 32, (20, 160, 190, 236)),
     "variantes": [{"nombre": "Llaves y cubrellaves", "pag": 32, "tipo": "manual",
                    "cols": ["Art.", "Adaptable para", "Pág."],
                    "filas": [["200", "C5 (4 pernos)", "32"], ["201", "C5, C6", "32"], ["202", "C4", "32"],
                              ["217", "S2, S3", "32"], ["218", "Art. 260/263", "32"], ["219", "Art. 260/263", "32"],
                              ["206", "S32, S33", "32"], ["0625", "S6, S10", "33"], ["0627", "Art. HS6/I", "33"],
                              ["207", "S6, S10", "33"], ["205", "DM320", "33"], ["860", "Art. 704, 710, 705", "33"]]}]},

    # ------------------------------------------------------------- METÁLICA
    {"id": "l18-1118", "fam": "metalica", "mod": "L18", "art": "1118 / 118", "pag": 37,
     "nombre": "Cerradura multipunto para carpintería metálica",
     "sub": "Tres palancas basculantes, frente plano o en U de acero inoxidable",
     "foto": ("x", 37, 11870, None), "ficha": F_L18, "destacado": "Multipunto",
     "variantes": [
         {"nombre": "Frente plano inox", "pag": 38, "art": "1118", "tablas": [t(38, 0, ["D", "E", "Código", "Caja", "Embalaje"])]},
         {"nombre": "Frente en U inox", "pag": 38, "art": "1118", "tablas": [t(38, 1, ["D", "E", "Código", "Caja", "Embalaje"])],
          "nota": "El PDF imprime estos códigos con el carácter «§». Confirmar el código correcto con Sebalcab."},
     ]},
    {"id": "l1-102", "fam": "metalica", "mod": "L1", "art": "102", "pag": 39,
     "nombre": "Cerradura carpintería metálica 85 mm",
     "sub": "Leva larga, frente cromado o de acero inoxidable",
     "foto": ("x", 39, 12228, (0.25, 0, 1, 1)),
     "variantes": [{"nombre": "Frente cromado y inox", "pag": 39, "art": "102", "tablas": [
         t(39, 0, D6, {"Frente": "Cromado"}), t(39, 1, D6, {"Frente": "Acero inox"})]}]},
    {"id": "l1-103", "fam": "metalica", "mod": "L1", "art": "103", "pag": 40,
     "nombre": "Cerradura carpintería metálica 85 mm, leva corta",
     "sub": "Funciona con leva corta, frente cromado o de acero inoxidable",
     "foto": ("x", 40, 12360, (0.64, 0, 0.92, 1)),
     "variantes": [{"nombre": "Frente cromado y inox", "pag": 40, "art": "103", "tablas": [
         t(40, 0, D6, {"Frente": "Cromado"}), t(40, 1, D6, {"Frente": "Acero inox"})]}]},
    {"id": "l4-101", "fam": "metalica", "mod": "L4", "art": "101", "pag": 41,
     "nombre": "Cerradura carpintería metálica 85 mm de gancho",
     "sub": "Gancho basculante, funciona con leva corta, frente cromado",
     "foto": ("x", 41, 12503, (0.66, 0, 0.93, 1)),
     "variantes": [{"nombre": "Frente cromado", "pag": 41, "art": "101", "tablas": [t(41, 0, D6, {"Frente": "Cromado"})]}]},
    {"id": "l3-107r", "fam": "metalica", "mod": "L3", "art": "107/R", "pag": 42,
     "nombre": "Cerradura carpintería metálica 85 mm, leva larga",
     "sub": "Funciona con leva larga, frente cromado o de acero inoxidable",
     "foto": ("x", 42, 12612, (0.72, 0, 0.93, 1)),
     "variantes": [{"nombre": "Frente cromo y inox", "pag": 42, "art": "107/R", "tablas": [
         t(42, 0, D6, {"Frente": "Cromo"}), t(42, 1, D6, {"Frente": "Acero inox"})]}]},
    {"id": "l1-104-124", "fam": "metalica", "mod": "L1", "art": "104 / 124", "pag": 43,
     "nombre": "Cerradura metálica solo picaporte y solo pastilla",
     "sub": "Frente de acero inoxidable, 85 mm",
     "foto": ("x", 43, 12734, (0.78, 0, 1, 1)),
     "variantes": [
         {"nombre": "104 solo picaporte", "pag": 43, "art": "104", "tablas": [t(43, 0, D6, {"Frente": "Acero inox"})]},
         {"nombre": "124 solo pastilla", "pag": 43, "art": "124", "foto": ("x", 43, 12736, (0.68, 0, 1, 1)),
          "tablas": [t(43, 1, ["E", "F", "Código", "Caja", "Embalaje"], {"Frente": "Acero inox"})]},
     ]},
    {"id": "l5-112", "fam": "metalica", "mod": "L5", "art": "112", "pag": 44,
     "nombre": "Cerradura carpintería metálica 72 mm de gancho",
     "sub": "Para puertas correderas, acabado cromado",
     "foto": ("x", 44, 12878, None),
     "variantes": [{"nombre": "Cromada", "pag": 44, "art": "112", "tablas": [t(44, 0, D6)]}]},
    {"id": "l6-402", "fam": "metalica", "mod": "L6", "art": "402", "pag": 45,
     "nombre": "Cerradura carpintería metálica 67 mm",
     "sub": "Caja estrecha para perfil metálico",
     "foto": ("x", 45, 13024, None),
     "variantes": [{"nombre": "402", "pag": 45, "art": "402", "tipo": "manual",
                    "cols": ["D", "E", "F", "Código", "Caja", "Embalaje"],
                    "filas": [["67", "70", "16", "0402T70...N-", "1", "20"], ["67", "70", "20", "0402N70...N-", "1", "20"],
                              ["67", "80", "16", "0402T80...N-", "1", "20"], ["67", "80", "20", "0402N80...N-", "1", "20"]],
                    "nota": "Los puntos del código se completan según acabado. Consultar con Sebalcab."}]},
    {"id": "l7-404", "fam": "metalica", "mod": "L7", "art": "404", "pag": 45,
     "nombre": "Cerradura carpintería metálica 404",
     "sub": "Cerradura de embutir para perfil estrecho",
     "foto": ("r", 45, (30, 430, 120, 790)),
     "variantes": [{"nombre": "404", "pag": 45, "art": "404", "tablas": [t(45, 1, ["E", "F", "Código", "Caja", "Embalaje"])]}]},
    {"id": "l6-406", "fam": "metalica", "mod": "L6", "art": "406", "pag": 46,
     "nombre": "Cerradura carpintería metálica 65 mm",
     "sub": "Embalaje en caja individual",
     "foto": ("x", 46, 13189, None),
     "variantes": [{"nombre": "406", "pag": 46, "art": "406", "tablas": [t(46, 0, D6)]}]},
    {"id": "l16-cortafuego", "fam": "metalica", "mod": "L16", "art": "116 / 126", "pag": 47,
     "nombre": "Cerradura cortafuego 72 mm",
     "sub": "Frente de acero inoxidable, certificada al fuego",
     "foto": ("x", 47, 13312, (0.74, 0, 1, 1)), "destacado": "Certificada al fuego",
     "variantes": [
         {"nombre": "116 canto cuadrado", "pag": 47, "art": "116", "tablas": [t(47, 0, D6)]},
         {"nombre": "126 canto redondo", "pag": 47, "art": "126", "foto": ("x", 47, 13406, (0.72, 0, 1, 1)), "tablas": [t(47, 1, D6)]},
     ]},
    {"id": "l8-multiuso", "fam": "metalica", "mod": "L8", "art": "1738 / 1739", "pag": 48,
     "nombre": "Cerradura multiuso",
     "sub": "Cerradura de embutir de 72 mm para usos múltiples",
     "foto": ("x", 48, 13496, None),
     "variantes": [
         {"nombre": "1738", "pag": 48, "art": "1738", "tablas": [t(48, 0, D6)]},
         {"nombre": "1739", "pag": 48, "art": "1739", "foto": ("x", 48, 13503, None), "tablas": [t(48, 1, D6)]},
     ]},
    {"id": "l8-manilleria", "fam": "metalica", "mod": "L8", "art": "919 / 920", "pag": 49,
     "nombre": "Manillería cortafuego con resorte",
     "sub": "Conjunto de manillas negras con placa para cerradura cortafuego",
     "foto": ("x", 49, 13629, None),
     "variantes": [
         {"nombre": "919 manilla y manilla", "pag": 49, "art": "919", "tablas": [t(49, 0, ["Código", "Caja", "Embalaje"])]},
         {"nombre": "920 pomo y manilla", "pag": 49, "art": "920", "foto": ("x", 49, 13566, None), "tablas": [t(49, 1, ["Código", "Caja", "Embalaje"])]},
     ]},
    {"id": "pack-metalica", "fam": "metalica", "mod": "Accesorios", "art": "Pack", "pag": 50,
     "nombre": "Pack para cerraduras metálicas",
     "sub": "Cerradero de acero inoxidable, bocallaves de nailon y cilindro de níquel o latón",
     "foto": ("x", 50, 13685, (0, 0.27, 1, 1)),
     "variantes": [
         {"nombre": "Para 102, 103, 104, 107, 118, 1118 y otras", "pag": 50, "tablas": [t(50, 0, ["Código", "Cilindro", "Caja"])],
          "nota": "Adaptable para 102, 102R, 103, 103R, 104, 105, 107, 96, 106, 111, 99, 97, 118, 1118, 1119, 122, 1222 y 1223."},
         {"nombre": "Para 402, 124 y 405", "pag": 50, "tablas": [t(50, 1, ["Código", "Cilindro", "Caja"])]},
         {"nombre": "Para 101", "pag": 51, "tablas": [t(51, 0, ["Código", "Cilindro", "Caja"])]},
     ]},
    {"id": "cerraderos-metalica", "fam": "metalica", "mod": "Accesorios", "art": "Cerraderos", "pag": 52,
     "nombre": "Cerraderos para puertas metálicas",
     "sub": "De acero inoxidable y de plástico negro, por modelo de cerradura",
     "foto": ("x", 50, 13693, None),
     "variantes": [{"nombre": "Cerraderos", "pag": 52, "tipo": "manual",
                    "cols": ["Código", "F", "Material", "Adaptable para", "Caja"],
                    "filas": [["37", "22", "Acero inox", "102, 102R, 103, 103R, 104, 105, 107, 96", "200"],
                              ["37", "24", "Acero inox", "102, 102R, 103, 103R, 104, 105, 107, 96", "200"],
                              ["44", "24", "Acero inox", "101", "200"],
                              ["53", "22", "Acero inox", "102 a 1223 (ver nota)", "200"],
                              ["53/A", "", "Plástico negro", "102 a 1223 (ver nota)", "1000"],
                              ["196", "20", "Acero inox", "118", "35"],
                              ["197", "20", "Acero inox", "L18", "35"]],
                    "nota": "102 a 1223: 102, 102R, 103, 103R, 104, 105, 107, 96, 106, 111, 99, 97, 118, 1118, 1119, 122, 1222 y 1223."}]},
    {"id": "rosetas-metalica", "fam": "metalica", "mod": "Accesorios", "art": "Rosetas", "pag": 54,
     "nombre": "Rosetas para puertas metálicas",
     "sub": "Rosetas de plástico negro para picaporte y cilindro",
     "foto": ("x", 54, 14438, (0, 0, 0.36, 1)),
     "variantes": [{"nombre": "Rosetas", "pag": 54, "tipo": "manual",
                    "cols": ["Código", "Material", "Adaptable para", "Caja"],
                    "filas": [["46", "Plástico negro", "402, 401, 410, 404, 403, 407", "1000"],
                              ["47", "Plástico negro", "102, 102R, 103, 103R, 104, 105, 107, 96, 106, 111, 99, 97, 118, 1118, 1119, 122, 1222, 1223, 121", "1000"]]}]},

    # ------------------------------------------------------------- MADERA
    {"id": "l11-1134", "fam": "madera", "mod": "L11", "art": "1134", "pag": 56,
     "nombre": "Cerradura de tres puntos para madera",
     "sub": "Cerradura multipunto de embutir, en latón o níquel",
     "foto": ("x", 56, 14705, None), "destacado": "Tres puntos",
     "variantes": [{"nombre": "Latón y níquel", "pag": 56, "art": "1134", "tablas": [
         t(56, 0, D6, {"Acabado": "Latón"}), t(56, 1, D6, {"Acabado": "Níquel"})]}]},
    {"id": "l3-134", "fam": "madera", "mod": "L3", "art": "134", "pag": 57,
     "nombre": "Cerradura madera 85 mm canto cuadrado",
     "sub": "Cerradura de embutir en latón o níquel",
     "foto": ("x", 57, 14842, (0.66, 0, 1, 1)),
     "variantes": [{"nombre": "Latón y níquel", "pag": 57, "art": "134", "tablas": [
         t(57, 0, D6, {"Acabado": "Latón"}), t(57, 1, D6, {"Acabado": "Níquel"})]}]},
    {"id": "l15-127", "fam": "madera", "mod": "L15", "art": "127", "pag": 58,
     "nombre": "Cerradura madera 47 mm canto cuadrado",
     "sub": "Latón brillo",
     "foto": ("x", 58, 14942, (0.74, 0, 1, 1)),
     "variantes": [{"nombre": "Latón brillo", "pag": 58, "art": "127", "tablas": [t(58, 0, D6, {"Acabado": "Latón brillo"})]}]},
    {"id": "l15-129", "fam": "madera", "mod": "L15", "art": "129", "pag": 59,
     "nombre": "Cerradura madera 47 mm canto redondo",
     "sub": "Latón brillo",
     "foto": ("x", 59, 15016, (0.2, 0, 1, 1)),
     "variantes": [{"nombre": "Latón brillo", "pag": 59, "art": "129", "tablas": [t(59, 0, D6, {"Acabado": "Latón brillo"})]}]},
    {"id": "l10-130", "fam": "madera", "mod": "L10", "art": "130", "pag": 60,
     "nombre": "Cerradura solo pastilla, frente cuadrado",
     "sub": "Latón satinado",
     "foto": ("x", 60, 15153, (0.7, 0, 1, 1)),
     "variantes": [{"nombre": "Latón satinado", "pag": 60, "art": "130", "tablas": [
         t(60, 0, ["E", "F", "Código", "Caja", "Embalaje"], {"Acabado": "Latón satinado"})]}]},
    {"id": "l10-158", "fam": "madera", "mod": "L10", "art": "158", "pag": 61,
     "nombre": "Picaporte unificado 47 mm canto cuadrado",
     "sub": "Latón satinado o níquel satinado",
     "foto": ("x", 61, 15239, (0.66, 0, 1, 1)),
     "variantes": [{"nombre": "Latón y níquel satinado", "pag": 61, "art": "158", "tablas": [
         t(61, 0, ["-", "-", "D", "E", "Código", "Caja", "Embalaje"], {"Acabado": "Latón satinado"}),
         t(61, 1, ["-", "-", "D", "E", "Código", "Caja", "Embalaje"], {"Acabado": "Níquel satinado"})]}]},

    # ------------------------------------------------------------- SOBREPONER
    {"id": "s21-280", "fam": "sobreponer", "mod": "S21", "art": "280 / 281", "pag": 63,
     "nombre": "Cerradura de sobreponer",
     "sub": "Mano derecha (280) o izquierda (281)",
     "foto": ("x", 63, 15391, (0.52, 0.2, 0.95, 0.9)),
     "variantes": [{"nombre": "280 y 281", "pag": 63, "art": "280-281", "tablas": [
         t(63, 0, ["Derecha", "Izquierda", "E", "DCF", "DCS", "Código", "Caja", "Embalaje"])]}]},
    {"id": "s21-1494", "fam": "sobreponer", "mod": "S21", "art": "1494 / 1495", "pag": 63,
     "nombre": "Cerradura de solapar",
     "sub": "Mano derecha (1494) o izquierda (1495)",
     "foto": ("x", 63, 15393, (0.56, 0, 1, 1)),
     "variantes": [{"nombre": "1494 y 1495", "pag": 63, "art": "1494-1495", "tablas": [
         t(63, 1, ["Derecha", "Izquierda", "E", "DCF", "Código", "Caja", "Embalaje"])]}]},
    {"id": "s4101", "fam": "sobreponer", "mod": "S4101", "art": "Z4101", "pag": 64,
     "nombre": "Cerrojo de solapar",
     "sub": "Cerrojo con pomo interior y cilindro exterior",
     "foto": ("x", 64, 15607, None), "fotos": [("x", 64, 15609, None)],
     "variantes": [{"nombre": "Z4101", "pag": 64, "art": "Z4101", "tablas": [t(64, 0, D6)]}]},
    {"id": "s56", "fam": "sobreponer", "mod": "S56", "art": "56/A · 56/B", "pag": 65,
     "nombre": "Cerradura de solapar S56",
     "sub": "Caja marrón, mano derecha o izquierda, entradas de 60 y 70 mm",
     "foto": ("x", 65, 15782, None),
     "variantes": [
         {"nombre": "56/A", "pag": 65, "art": "56/A", "tablas": [t(65, 0, ["Art.", "Derecha", "Izquierda", "E", "Código", "Caja", "Embalaje"])]},
         {"nombre": "56/B", "pag": 65, "art": "56/B", "foto": ("x", 65, 15716, None),
          "tablas": [t(65, 1, ["Art.", "Derecha", "Izquierda", "E", "Código", "Caja", "Embalaje"])]},
     ]},
    {"id": "s26", "fam": "sobreponer", "mod": "S26", "art": "260 / 263", "pag": 66,
     "nombre": "Cerradura de solapar S26",
     "sub": "Cerrojo de sobreponer con cilindro de 50 o 70 mm",
     "foto": ("x", 66, 15929, (0.5, 0, 1, 1)),
     "variantes": [
         {"nombre": "260", "pag": 66, "art": "260", "tablas": [t(66, 0, ["Cilindro", "Código", "Caja", "Embalaje"])]},
         {"nombre": "263", "pag": 66, "art": "263", "foto": ("x", 66, 15931, (0.5, 0, 1, 1)),
          "tablas": [t(66, 1, ["Cilindro", "Código", "Caja", "Embalaje"])]},
     ]},
    {"id": "s70-alta", "fam": "sobreponer", "mod": "S70", "art": "704 / 710", "pag": 67,
     "nombre": "Cerradura de alta seguridad de sobreponer",
     "sub": "Caja de acero con varios pasadores de cierre",
     "foto": ("x", 67, 16017, (0.72, 0, 1, 1)), "destacado": "Alta seguridad",
     "variantes": [
         {"nombre": "704", "pag": 67, "art": "704", "tablas": [t(67, 0, ["Derecha", "Código", "Caja", "Embalaje"])]},
         {"nombre": "710", "pag": 67, "art": "710", "foto": ("x", 67, 16019, (0.72, 0, 1, 1)),
          "tablas": [t(67, 1, ["Derecha", "Código", "Caja", "Embalaje"])]},
     ]},
    {"id": "s70-705", "fam": "sobreponer", "mod": "S70", "art": "705", "pag": 68,
     "nombre": "Cerradura de solapar con barras",
     "sub": "Disponible con o sin barras",
     "foto": ("x", 68, 16173, (0.66, 0, 1, 1)),
     "variantes": [{"nombre": "705", "pag": 68, "art": "705", "tablas": [t(68, 0, ["Derecha", "Barras", "Código", "Caja", "Embalaje"])]}]},
    {"id": "s32-persiana", "fam": "sobreponer", "mod": "S32", "art": "320 · DM3320 · Z320", "pag": 69,
     "nombre": "Cerraduras para persiana",
     "sub": "Cerraduras de persiana solapada y enrollable",
     "foto": ("x", 69, 16230, (0.62, 0, 1, 1)),
     "variantes": [
         {"nombre": "320 persiana solapada", "pag": 69, "art": "320", "tablas": [
             t(69, 0, ["Art.", "Pernio", "Código", "Caja", "Embalaje"]), t(69, 1, ["Art.", "Pernio", "Código", "Caja", "Embalaje"])],
          "nota": "Disponible también en versión KA (misma llave)."},
         {"nombre": "DM3320 persiana enrollable", "pag": 69, "art": "DM3320", "foto": ("x", 69, 16232, (0.62, 0, 1, 1)),
          "tablas": [t(69, 3, ["Art.", "Pernio", "Código", "Caja", "Embalaje"])]},
         {"nombre": "Z320 persiana enrollable", "pag": 70, "art": "Z320", "foto": ("x", 70, 16461, None), "tipo": "manual",
          "cols": ["Art.", "Pernio", "Código", "Caja", "Embalaje"], "filas": [["Z320", "✓", "Z3200000200-", "1", "10"]]},
     ]},

    # ------------------------------------------------------------- GARAJE
    {"id": "e70", "fam": "garaje", "mod": "E70", "art": "2770 / 2170", "pag": 72,
     "nombre": "Cerradura eléctrica de cilindro ajustable",
     "sub": "Entrada regulable de 50 a 80 mm, 12 V, apertura interior",
     "foto": ("x", 72, 16520, None), "ficha": F_E70, "destacado": "Grado 3",
     "variantes": [
         {"nombre": "2770 cilindro y botón", "pag": 73, "art": "2770", "foto": ("x", 73, 16705, (0.55, 0.15, 1, 1)),
          "tablas": [t(73, 0, ["Derecha", "Izquierda", "DCF", "Código", "Caja", "Embalaje"])],
          "nota": "Doble cilindro regulable."},
         {"nombre": "2170 doble cilindro", "pag": 73, "art": "2170", "foto": ("x", 73, 16707, (0.58, 0, 1, 1)),
          "tablas": [t(73, 1, ["Derecha", "Izquierda", "E", "Código", "Caja", "Embalaje"])]},
     ]},
    {"id": "e76-evo", "fam": "garaje", "mod": "E76 EVO", "art": "2881", "pag": 74,
     "nombre": "Cerradura eléctrica con palanca",
     "sub": "Palanca de dos vueltas, entrada regulable de 50 a 80 mm",
     "foto": ("x", 74, 16837, None), "ficha": F_E76,
     "variantes": [
         {"nombre": "2881", "pag": 75, "art": "2881", "tablas": [t(75, 0, ["Derecha", "Izquierda", "E", "Código", "Caja", "Embalaje"])]},
         {"nombre": "Kit de prolongación E70 y E76", "pag": 75, "art": "173", "foto": ("x", 75, 16998, None), "tipo": "manual",
          "cols": ["Código", "Descripción", "Embalaje"], "filas": [["173", "Kit de prolongación para E70 y E76", "20"]]},
     ]},

    # ------------------------------------------------------------- CIERRAPUERTAS
    {"id": "dc6", "fam": "cierrapuertas", "mod": "DC6", "art": "600 a 621", "pag": 77,
     "nombre": "Cierrapuertas DC6",
     "sub": "Cuerpo de zamak, válvulas independientes, de 40 a 120 kg",
     "foto": ("x", 77, 17138, None), "ficha": F_DC6,
     "variantes": [
         {"nombre": "600 sin retención", "pag": 78, "art": "600", "tipo": "dc", "tablas": [(78, 0)]},
         {"nombre": "603 con retención", "pag": 78, "art": "603", "tipo": "dc", "tablas": [(78, 1)]},
         {"nombre": "610 sin retención", "pag": 79, "art": "610", "tipo": "dc", "tablas": [(79, 0)]},
         {"nombre": "611 con retención", "pag": 79, "art": "611", "tipo": "dc", "tablas": [(79, 1)]},
         {"nombre": "620 sin retención", "pag": 80, "art": "620", "tipo": "dc", "tablas": [(80, 0)], "foto": ("x", 80, 17620, (0.72, 0, 1, 1))},
         {"nombre": "621 retención en el brazo", "pag": 80, "art": "621", "tipo": "dc", "tablas": [(80, 1)], "foto": ("x", 80, 17620, (0.72, 0, 1, 1))},
     ]},
    {"id": "dc8", "fam": "cierrapuertas", "mod": "DC8", "art": "608 · B608 · B609", "pag": 81,
     "nombre": "Cierrapuertas DC8 y brazos",
     "sub": "Hasta 85 kg y 1.100 mm, brazo estándar o con retención",
     "foto": ("x", 81, 17777, (0.61, 0, 1, 1)),
     "variantes": [
         {"nombre": "608 cierrapuertas", "pag": 81, "art": "608", "tipo": "dc", "tablas": [(81, 0)]},
         {"nombre": "B608 brazo estándar", "pag": 81, "art": "B608", "tipo": "dc", "tablas": [(81, 1)], "foto": ("x", 81, 17782, None)},
         {"nombre": "B609 brazo con retención", "pag": 82, "art": "B609", "tipo": "dc", "tablas": [(82, 0)], "foto": ("x", 82, 17980, None)},
     ]},
    {"id": "dc9", "fam": "cierrapuertas", "mod": "DC9", "art": "660 / 661", "pag": 83,
     "nombre": "Cierrapuertas DC9",
     "sub": "Brazo articulado (660) o guía deslizante con retención (661)",
     "foto": ("x", 83, 18069, None),
     "variantes": [
         {"nombre": "660 brazo articulado", "pag": 83, "art": "660", "tipo": "dc", "tablas": [(83, 0)]},
         {"nombre": "661 guía con retención", "pag": 83, "art": "661", "tipo": "dc", "tablas": [(83, 1)], "foto": ("x", 83, 18074, None),
          "nota": "El PDF repite el código 0660B0000 en el art. 661. Confirmar con Sebalcab."},
     ]},

    # ------------------------------------------------------------- ANTIPÁNICOS
    {"id": "a1-a111", "fam": "antipanicos", "mod": "A1", "art": "A111", "pag": 90,
     "nombre": "Antipánico para puertas cortafuego",
     "sub": "Reversible, con placa estrecha o placa grande",
     "foto": ("x", 90, 19119, None), "ficha": F_A1, "destacado": "Fire rated",
     "variantes": [
         {"nombre": "A111", "pag": 91, "art": "A111", "tipo": "manual", "cols": ["Art.", "Color", "Caja"],
          "filas": [["A111", "Negro RAL 9005", "1"], ["A111/G", "Gris RAL 7040", "1"], ["A111/G6", "Gris RAL 9006", "1"],
                    ["A111/B", "Blanco RAL 9010", "1"], ["A111/A", "Pintura efecto acero", "1"], ["A111/X", "Cromo satinado", "1"]]},
         {"nombre": "A111P placa grande", "pag": 91, "art": "A111P", "tipo": "manual", "cols": ["Art.", "Color", "Caja"],
          "filas": [["A111P", "Negro RAL 9005", "1"], ["A111P/G", "Gris RAL 7040", "1"], ["A111P/G6", "Gris RAL 9006", "1"],
                    ["A111P/B", "Blanco RAL 9010", "1"], ["A111P/A", "Pintura efecto acero", "1"], ["A111P/X", "Cromo satinado", "1"]]},
     ]},
    {"id": "a4", "fam": "antipanicos", "mod": "A4", "art": "A401 · A402 · A403", "pag": 92,
     "nombre": "Antipánico de embutir A4",
     "sub": "Reversible y componible, de uno a tres puntos de cierre",
     "foto": ("x", 92, 19471, None), "ficha": F_A4, "destacado": "EN 1125",
     "variantes": [
         {"nombre": "A401 un punto", "pag": 93, "art": "A401", "foto": ("x", 93, 19616, (0.7, 0, 1, 1)), "tipo": "anti", "pref": "A401"},
         {"nombre": "A402 dos puntos", "pag": 93, "art": "A402", "foto": ("x", 93, 19618, (0.66, 0, 1, 1)), "tipo": "anti", "pref": "A402"},
         {"nombre": "A403 tres puntos modular", "pag": 94, "art": "A403", "foto": ("x", 94, 19763, (0.62, 0, 1, 1)), "tipo": "anti", "pref": "A403",
          "nota": "Disponible con mecanismo de retención."},
     ]},
    {"id": "a5", "fam": "antipanicos", "mod": "A5", "art": "A501 · A502 · A503", "pag": 95,
     "nombre": "Antipánico de embutir A5",
     "sub": "Reversible y componible, compatible con montantes de otras marcas",
     "foto": ("x", 95, 19850, (0, 0, 1, 0.58)), "ficha": F_A5,
     "variantes": [
         {"nombre": "A501 un punto", "pag": 96, "art": "A501", "foto": ("x", 96, 19943, None), "tipo": "anti", "pref": "A501"},
         {"nombre": "A502 dos puntos", "pag": 96, "art": "A502", "foto": ("x", 96, 19947, None), "tipo": "anti", "pref": "A502"},
         {"nombre": "A503 tres puntos modular", "pag": 97, "art": "A503", "tipo": "anti", "pref": "A503",
          "nota": "Disponible con mecanismo de retención."},
     ]},
    {"id": "a6", "fam": "antipanicos", "mod": "A6", "art": "A601", "pag": 98,
     "nombre": "Antipánico de sobreponer A6",
     "sub": "Barra horizontal de aluminio, un punto de cierre",
     "foto": ("x", 98, 20207, None), "ficha": F_A6,
     "variantes": [
         {"nombre": "A601 un punto", "pag": 99, "art": "A601", "tipo": "manual", "cols": ["Art.", "Color", "Largo (mm)", "Caja"],
          "filas": [["A601/1.NR", "Negro y rojo", "840", "1"], ["A601/2.NR", "Negro y rojo", "1170", "1"], ["A601/3.NR", "Negro y rojo", "1300", "1"]],
          "nota": "En el PDF: art. A601/.NR negro y rojo, con largos A601/1.. (840), A601/2.. (1170) y A601/3.. (1300)."},
     ]},
    {"id": "barras-a1100", "fam": "antipanicos", "mod": "Accesorios", "art": "A1100", "pag": 100,
     "nombre": "Barras para antipánico",
     "sub": "Tubo pintado rojo RAL 3020, adaptable a A4, A5, A1 y A10",
     "foto": ("x", 100, 20509, None),
     "variantes": [{"nombre": "Barras", "pag": 100, "tipo": "manual", "cols": ["Código", "L (mm)", "Color", "Caja"],
                    "filas": [["A1100/1/R", "950", "Rojo RAL 3020", "1"], ["A1100/2/R", "1150", "Rojo RAL 3020", "1"],
                              ["A1100/3/R", "1300", "Rojo RAL 3020", "1"]]}]},

    # ------------------------------------------------------------- CANDADOS
    {"id": "candado-4997r", "fam": "candados", "mod": "4997/R", "art": "T4497/R", "pag": 102,
     "nombre": "Candado blindado para persiana",
     "sub": "Cuerpo de acero cromado con arco de acero",
     "foto": ("x", 102, 20887, None),
     "variantes": [{"nombre": "4997/R", "pag": 102, "tipo": "manual",
                    "cols": ["A", "B", "C", "D", "E", "H", "S", "L", "Código", "Caja", "Embalaje"],
                    "filas": [["84", "20", "36", "12", "36", "24", "25", "70", "T4497/R", "1", "20"]]}]},
    {"id": "apollo", "fam": "candados", "mod": "Apollo", "art": "901 / 902", "pag": 103,
     "nombre": "Candado de latón Apollo",
     "sub": "Arco corto de 20 a 70 mm y arco largo de 30 a 60 mm",
     "foto": ("x", 103, 21016, None),
     "variantes": [
         {"nombre": "Arco corto", "pag": 103, "art": "901",
          "tablas": [t(103, 0, ["A", "B", "E", "C", "F", "ØD", "Peso (kg)", "Código", "Caja", "Embalaje"])]},
         {"nombre": "Arco largo", "pag": 103, "art": "902", "foto": ("x", 103, 21013, (0, 0.04, 1, 1)),
          "tablas": [t(103, 1, ["A", "B", "E", "C", "F", "ØD", "Código", "Caja", "Embalaje"])]},
     ]},
]

# Paneles informativos por familia (contenido real del catálogo)
PANELES = {
    "cilindros": {
        "titulo": "Sistemas de amaestramiento",
        "pag": 34,
        "imagen": ("x", 34, 11743, None),
        "items": [
            ["KD", "Llaves diferentes: cada cilindro con su llave"],
            ["KA", "Misma llave: varios cilindros con una sola llave"],
            ["MK", "Llave maestra: cada cilindro con su llave y una maestra que abre todos"],
            ["GMK", "Gran maestra: grupos con maestra propia y una gran maestra general"],
            ["CK", "Cilindro central: llaves diferentes que abren también un acceso común"],
            ["GGMK", "Varios niveles de maestras sobre llaves diferentes"],
        ],
    },
    "antipanicos": {
        "titulo": "Acabados RAL",
        "pag": 89,
        "colores": [
            ["RAL 7040", "Gris ventana", "#9DA3A6"], ["RAL 9005", "Negro intenso", "#0E0E10"],
            ["RAL 9006", "Aluminio blanco", "#A5A8A6"], ["RAL 9016", "Blanco tráfico", "#F1F0EA"],
            ["RAL 3020", "Rojo tráfico", "#CC0605"], ["RAL 6029", "Verde menta", "#20603D"],
            ["Efecto acero", "Pintura efecto acero", "#B8BDC2"], ["Cromo satinado", "Cromo satinado", "#C9CCCE"],
        ],
    },
}

# --------------------------------------------------------------------------
# Compatibilidades (fuente: _fuente/COMPATIBILIDADES_ICSA_JUNIO_2026.pdf)
# Artículo ICSA de la tabla -> (producto del catálogo, versión o None si vale para todo el modelo)
# Los artículos que no están aquí no aparecen en el catálogo España 2026: se muestran sin enlace.
# --------------------------------------------------------------------------
COMPAT_PDF = "COMPATIBILIDADES_ICSA_JUNIO_2026.pdf"
COMPAT_ENLACES = {
    "102-102E": ("l1-102", None),
    "104-104E": ("l1-104-124", "v1"),
    "124": ("l1-104-124", "v2"),
    "107-107R": ("l3-107r", None),
    "101-101E": ("l4-101", None),
    "118-118E": ("l18-1118", None),
    "1118-1118E": ("l18-1118", None),
    "402-60-/70": ("l6-402", None),
    "402-80": ("l6-402", None),
    "402-90": ("l6-402", None),
    "406": ("l6-406", None),
    "1134": ("l11-1134", None),
    "134": ("l3-134", None),
    "130": ("l10-130", None),
    "158": ("l10-158", None),
    "280": ("s21-280", None),
    "704": ("s70-alta", "v1"),
    "705": ("s70-705", None),
    "320": ("s32-persiana", "v1"),
    "2770": ("e70", "v1"),
    "2170": ("e70", "v2"),
}
