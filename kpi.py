from datetime import datetime
from collections import Counter

# Datos en formato JSON
data_json = [
   
    {
        "ID_CONTRATO": "780",
        "Fecha": "2025-03-04 13:15:13",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden."
    },
    {
        "ID_CONTRATO": "780",
        "Fecha": "2025-03-04 13:16:16",
        "Estatus": "Turnado",
        "Comentario": "TURNE A UNA PERSONA INCORRECTA"
    },
    {
        "ID_CONTRATO": "780",
        "Fecha": "2025-03-04 15:01:58",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "781",
        "Fecha": "2025-03-04 13:18:31",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden."
    },
    {
        "ID_CONTRATO": "781",
        "Fecha": "2025-03-04 15:01:37",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "781",
        "Fecha": "2025-03-04 17:37:43",
        "Estatus": "RegistradoSAP",
        "Comentario": "se reviso y como cumplía todos los requisitos se captura en el SAP con numero 5100005185 e INTEGRA numero 179413  y se envía para su remesa."
    },
    {
        "ID_CONTRATO": "781",
        "Fecha": "2025-03-04 18:04:44",
        "Estatus": "RegistradoSAP",
        "Comentario": "devolución al analista, no procede su revisión (of. petición incompleto)"
    },
    {
        "ID_CONTRATO": "781",
        "Fecha": "2025-03-04 18:24:55",
        "Estatus": "Devuelto",
        "Comentario": "Se solicita la solventacion a la dependencia."
    },


    {
        "ID_CONTRATO": "782",
        "Fecha": "2025-03-04 13:25:46",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE"
    },
    {
        "ID_CONTRATO": "782",
        "Fecha": "2025-03-04 15:01:14",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "783",
        "Fecha": "2025-03-04 13:28:18",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "783",
        "Fecha": "2025-03-04 15:00:53",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "784",
        "Fecha": "2025-03-04 13:30:55",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "784",
        "Fecha": "2025-03-04 14:55:40",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "784",
        "Fecha": "2025-03-04 15:00:32",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "784",
        "Fecha": "2025-03-04 16:55:51",
        "Estatus": "Devuelto",
        "Comentario": "SE SOLICITÓ A LA DEPENDENCIA SOLVENTARA EL OFICIO DE PETICIÓN DE PAGO."
    },


    {
        "ID_CONTRATO": "785",
        "Fecha": "2025-03-04 13:33:37",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "785",
        "Fecha": "2025-03-04 14:35:32",
        "Estatus": "RegistradoSAP",
        "Comentario": "INTEGRA No. 179446 , SAP 5100005198"
    },
    {
        "ID_CONTRATO": "785",
        "Fecha": "2025-03-04 14:55:11",
        "Estatus": "RegistradoSAP",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "785",
        "Fecha": "2025-03-04 15:00:02",
        "Estatus": "RegistradoSAP",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "786",
        "Fecha": "2025-03-04 13:35:37",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "786",
        "Fecha": "2025-03-04 14:54:48",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "786",
        "Fecha": "2025-03-04 14:59:39",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "786",
        "Fecha": "2025-03-04 18:26:24",
        "Estatus": "Devuelto",
        "Comentario": "EN ESPERA DE SOLVENTACION"
    },


    {
        "ID_CONTRATO": "787",
        "Fecha": "2025-03-04 13:37:31",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "787",
        "Fecha": "2025-03-04 14:54:29",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "787",
        "Fecha": "2025-03-04 14:56:56",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "787",
        "Fecha": "2025-03-04 18:25:29",
        "Estatus": "Devuelto",
        "Comentario": "EL ANEXO QUE ADJUNTAN EN SU SOLICITUD DE REQUERIMIENTOS, NO CONCINCIDE CON SU NOTA DE REMISIÓN DE LOS CFDI'S"
    },


    {
        "ID_CONTRATO": "788",
        "Fecha": "2025-03-04 13:39:12",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "788",
        "Fecha": "2025-03-04 14:53:58",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "788",
        "Fecha": "2025-03-04 14:59:18",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "788",
        "Fecha": "2025-03-04 18:22:08",
        "Estatus": "Devuelto",
        "Comentario": "EN ESPERA DE SOLVENTACION"
    },


    {
        "ID_CONTRATO": "789",
        "Fecha": "2025-03-04 13:41:56",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "789",
        "Fecha": "2025-03-04 14:53:10",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "789",
        "Fecha": "2025-03-04 14:59:05",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "789",
        "Fecha": "2025-03-04 18:23:58",
        "Estatus": "Turnado",
        "Comentario": "el analista omite el siguiente paso (registrado en sap)  en el track \""
    },


    {
        "ID_CONTRATO": "790",
        "Fecha": "2025-03-04 13:44:00",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "790",
        "Fecha": "2025-03-04 14:52:51",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "790",
        "Fecha": "2025-03-04 14:58:46",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "790",
        "Fecha": "2025-03-04 18:27:02",
        "Estatus": "Turnado",
        "Comentario": "el analista omite el siguiente paso (registrado en sap)  en el track"
    },


    {
        "ID_CONTRATO": "791",
        "Fecha": "2025-03-04 13:46:45",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "791",
        "Fecha": "2025-03-04 14:52:31",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "791",
        "Fecha": "2025-03-04 14:58:26",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "792",
        "Fecha": "2025-03-04 13:48:45",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "792",
        "Fecha": "2025-03-04 14:52:08",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "792",
        "Fecha": "2025-03-04 14:58:12",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "793",
        "Fecha": "2025-03-04 13:51:35",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "793",
        "Fecha": "2025-03-04 14:51:36",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "793",
        "Fecha": "2025-03-04 14:53:55",
        "Estatus": "RegistradoSAP",
        "Comentario": "se revisa y se libera sin observaciones SAP 5100005224 INTEGRA 179490"
    },
    {
        "ID_CONTRATO": "793",
        "Fecha": "2025-03-04 14:57:57",
        "Estatus": "RegistradoSAP",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "793",
        "Fecha": "2025-03-04 18:35:11",
        "Estatus": "RegistradoSAP",
        "Comentario": "tiene 6 carpetas, las cuales ingresaron por oficio. "
    },


    {
        "ID_CONTRATO": "794",
        "Fecha": "2025-03-04 13:54:11",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "794",
        "Fecha": "2025-03-04 14:51:12",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "794",
        "Fecha": "2025-03-04 14:57:40",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "795",
        "Fecha": "2025-03-04 13:55:48",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden. PASIVOS DICIEMBRE "
    },
    {
        "ID_CONTRATO": "795",
        "Fecha": "2025-03-04 14:50:39",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },
    {
        "ID_CONTRATO": "795",
        "Fecha": "2025-03-04 14:57:20",
        "Estatus": "Turnado",
        "Comentario": "FECHA LIMITE "
    },


    {
        "ID_CONTRATO": "796",
        "Fecha": "2025-03-04 14:20:25",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden."
    },
    {
        "ID_CONTRATO": "796",
        "Fecha": "2025-03-04 17:23:25",
        "Estatus": "Turnado",
        "Comentario": "REMESA 1 "
    },
    {
        "ID_CONTRATO": "796",
        "Fecha": "2025-03-04 17:27:23",
        "Estatus": "RegistradoSAP",
        "Comentario": "SAP 5100000112, INTEGRA 180605"
    },
    {
        "ID_CONTRATO": "796",
        "Fecha": "2025-03-04 18:16:47",
        "Estatus": "RegistradoSAP",
        "Comentario": "\"Se actualiza estatus del registro.\""
    },
    {
        "ID_CONTRATO": "796",
        "Fecha": "2025-03-04 18:17:18",
        "Estatus": "RegistradoSAP",
        "Comentario": "\"Se actualiza estatus del registro.\""
    },


    {
        "ID_CONTRATO": "797",
        "Fecha": "2025-03-04 14:21:37",
        "Estatus": "Turnado",
        "Comentario": "Proceso de Revisión de la Orden."
    },
    {
        "ID_CONTRATO": "797",
        "Fecha": "2025-03-04 17:35:30",
        "Estatus": "RegistradoSAP",
        "Comentario": "DOC SAP: 5100000113, INTEGRA: 180606"
    },
    {
        "ID_CONTRATO": "797",
        "Fecha": "2025-03-04 17:40:36",
        "Estatus": "RegistradoSAP",
        "Comentario": "REMESA 2"
    },
    {
        "ID_CONTRATO": "797",
        "Fecha": "2025-03-04 18:07:30",
        "Estatus": "Remesa",
        "Comentario": "se pone en estatus devuelto por error de captura del analista "
    },
    {
        "ID_CONTRATO": "797",
        "Fecha": "2025-03-04 18:09:11",
        "Estatus": "RegistradoSAP",
        "Comentario": "DOC SAP: 5100000114, INTEGRA: 180606 SE CORRIGE POR ERROR DE CAPTURA "
    },
    {
        "ID_CONTRATO": "797",
        "Fecha": "2025-03-04 18:10:28",
        "Estatus": "RegistradoSAP",
        "Comentario": "REMESA 2 "
    }

]



# Convertimos las fechas de texto a objetos datetime
for entry in data_json:
    entry["Fecha"] = datetime.strptime(entry["Fecha"], "%Y-%m-%d %H:%M:%S")

# Calcular tiempos promedio entre cambios de estatus
def calculate_time_diff(start, end):
    """Calcula la diferencia de tiempo en segundos entre dos fechas."""
    return (end - start).total_seconds()

# Inicializamos las variables para los cálculos de tiempo
analista_times = []  # Para el tiempo de análisis del analista
operador_creacion_times = []  # Para el tiempo que tarda el operador en crear el trámite
operador_turno_times = []  # Para el tiempo que tarda el operador en turnar el trámite
operador_registro_sap_times = []  # Para el tiempo que tarda el operador en registrar el trámite en SAP
devuelto_count = 0  # Para contar las devoluciones

# Mantenemos el seguimiento de los estatus de los trámites
estatus_last = []  # Lista para guardar los estatus en orden cronológico

# Procesamos los cambios de estatus
for entry in data_json:
    if entry["Estatus"] == "Creado":
        estatus_last.append({"Estatus": "Creado", "Fecha": entry["Fecha"]})
    elif entry["Estatus"] == "Turnado":
        estatus_last.append({"Estatus": "Turnado", "Fecha": entry["Fecha"]})
    elif entry["Estatus"] == "Devuelto":
        estatus_last.append({"Estatus": "Devuelto", "Fecha": entry["Fecha"]})
        devuelto_count += 1
    elif entry["Estatus"] == "RegistradoSAP":
        estatus_last.append({"Estatus": "RegistradoSAP", "Fecha": entry["Fecha"]})

# Ahora calculamos los tiempos promedio según las preguntas
for i in range(1, len(estatus_last)):

    # Tiempo que tarda el operador en crear el trámite (de "Creado" a "Turnado")
    if estatus_last[i-1]["Estatus"] == "Creado" and estatus_last[i]["Estatus"] == "Turnado":
        operador_creacion_times.append(calculate_time_diff(estatus_last[i-1]["Fecha"], estatus_last[i]["Fecha"]))

    # Tiempo que tarda el operador en turnar un trámite (de "Turnado" a "RegistradoSAP")
    if estatus_last[i-1]["Estatus"] == "Turnado" and estatus_last[i]["Estatus"] == "RegistradoSAP":
        operador_turno_times.append(calculate_time_diff(estatus_last[i-1]["Fecha"], estatus_last[i]["Fecha"]))

    # Tiempo que tarda el operador en registrar el trámite en SAP (de "Devuelto" a "RegistradoSAP")
    if estatus_last[i-1]["Estatus"] in ["Devuelto"] and estatus_last[i]["Estatus"] == "RegistradoSAP":
        operador_registro_sap_times.append(calculate_time_diff(estatus_last[i-1]["Fecha"], estatus_last[i]["Fecha"]))


# Cálculos finales
def average_time(times):
    return sum(times) / len(times) if times else 0

# Función para convertir de segundos a horas
def convert_seconds_to_hours(seconds):
    return seconds / 3600

# Resultados en horas

print("\n1. Tiempo promedio que se tarda un operador en crear un trámite (horas):")
operador_creacion_avg = average_time(operador_creacion_times)
print(convert_seconds_to_hours(operador_creacion_avg))

print("\n2. Tiempo que tarda el operador en turnar un trámite (de Turnado a RegistradoSAP) (horas):")
operador_turno_avg = average_time(operador_turno_times)
print(convert_seconds_to_hours(operador_turno_avg))

print("\n3. Tiempo que tarda el operador en registrar el trámite en SAP (de Devuelto a RegistradoSAP) (horas):")
operador_registro_sap_avg = average_time(operador_registro_sap_times)
print(convert_seconds_to_hours(operador_registro_sap_avg))

# Número promedio de devoluciones generadas por trámite
print("\n4. Número promedio de devoluciones generadas por trámite:")
print(devuelto_count / len(estatus_last) if len(estatus_last) > 0 else 0)

# Conteo por estatus
print("\nConteo por estatus:")
estatus_count = Counter(entry["Estatus"] for entry in data_json)
for estatus, count in estatus_count.items():
    print(f"{estatus}: {count}")

# Conteo por fecha
print("\nConteo por fecha:")
fecha_grouped = {}
for entry in data_json:
    fecha = entry["Fecha"].date()
    if fecha not in fecha_grouped:
        fecha_grouped[fecha] = 0
    fecha_grouped[fecha] += 1
for fecha, count in sorted(fecha_grouped.items()):
    print(f"{fecha}: {count} eventos")
