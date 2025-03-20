# import json
# from datetime import datetime, timedelta

# # 📂 Cargar datos del archivo JSON
# with open("pagotrack_data.json", "r", encoding="utf-8") as file:
#     datos_tramites = json.load(file)

# # 📌 Función para calcular tiempo hábil entre estados (Lunes a Viernes, 9 AM - 7 PM)
# def calcular_tiempo_habil(fecha_inicio, fecha_fin):
#     formato = "%Y-%m-%d %H:%M:%S"
#     inicio = datetime.strptime(fecha_inicio, formato)
#     fin = datetime.strptime(fecha_fin, formato)

#     # Definir horario laboral (9 AM - 7 PM)
#     if inicio.hour >= 19:
#         inicio = inicio.replace(hour=9, minute=0, second=0) + timedelta(days=1)
#     elif inicio.hour < 9:
#         inicio = inicio.replace(hour=9, minute=0, second=0)

#     if fin.hour >= 19:
#         fin = fin.replace(hour=9, minute=0, second=0) + timedelta(days=1)
#     elif fin.hour < 9:
#         fin = fin.replace(hour=9, minute=0, second=0)

#     # Excluir sábados y domingos
#     while inicio.weekday() >= 5:
#         inicio += timedelta(days=1)
#     while fin.weekday() >= 5:
#         fin += timedelta(days=1)

#     # Calcular diferencia en horas hábiles
#     diferencia = (fin - inicio).total_seconds() / 3600
#     return max(diferencia, 0)  # No permitir valores negativos

# # 📌 Organizar datos por ID_CONTRATO
# contratos = {}
# for tramite in datos_tramites:
#     id_contrato = tramite["ID_CONTRATO"]
#     if id_contrato not in contratos:
#         contratos[id_contrato] = []
#     contratos[id_contrato].append(tramite)

# # 📊 Analizar cada contrato individualmente
# for id_contrato, tramites in contratos.items():
#     tiempos_por_estado = {}
#     motivos_devolucion = {}
#     contador_devuelto = 0
#     contador_rechazado = 0

#     # Ordenar los trámites por fecha
#     tramites.sort(key=lambda x: x["Fecha"])

#     # Analizar tiempos entre estados
#     for i in range(len(tramites) - 1):
#         estado_actual = tramites[i]["Estatus"]
#         estado_siguiente = tramites[i + 1]["Estatus"]
#         tiempo_transicion = calcular_tiempo_habil(tramites[i]["Fecha"], tramites[i + 1]["Fecha"])

#         # Guardar tiempo entre estados
#         clave = f"{estado_actual} -> {estado_siguiente}"
#         if clave not in tiempos_por_estado:
#             tiempos_por_estado[clave] = []
#         tiempos_por_estado[clave].append(tiempo_transicion)

#         # Contar trámites devueltos o rechazados
#         if estado_siguiente == "Devuelto":
#             contador_devuelto += 1
#             motivo = tramites[i + 1]["Comentario"].strip().upper()
#             motivos_devolucion[motivo] = motivos_devolucion.get(motivo, 0) + 1

#         if estado_siguiente == "Rechazado":
#             contador_rechazado += 1

#     # 📊 Mostrar resultados del contrato
#     print(f"\n📌 **Análisis del contrato {id_contrato}**")
#     print("\n📊 **Tiempos Promedio por Estado:**")
#     for clave, tiempos in tiempos_por_estado.items():
#         promedio = sum(tiempos) / len(tiempos) if tiempos else 0
#         print(f" - {clave}: {promedio:.2f} horas en promedio")

#     print("\n📌 **Cantidad de trámites devueltos:**", contador_devuelto)
#     print("📌 **Cantidad de trámites rechazados:**", contador_rechazado)

#     print("\n📋 **Motivos de Devolución más Frecuentes:**")
#     for motivo, cantidad in sorted(motivos_devolucion.items(), key=lambda x: x[1], reverse=True):
#         print(f" - {motivo}: {cantidad} veces")

#     print("\n" + "=" * 50)  # Separador visual entre contratos






























































import json
import pandas as pd
from datetime import datetime, timedelta

# 📂 Cargar datos del archivo JSON
file_path = "./pagotrack_data.json"

with open(file_path, "r", encoding="utf-8") as file:
    datos_tramites = json.load(file)

# 📌 Función para calcular tiempo hábil entre estados (Lunes a Viernes, 9 AM - 7 PM)
def calcular_tiempo_habil(fecha_inicio, fecha_fin):
    formato = "%Y-%m-%d %H:%M:%S"
    inicio = datetime.strptime(fecha_inicio, formato)
    fin = datetime.strptime(fecha_fin, formato)

    # Definir horario laboral (9 AM - 7 PM)
    if inicio.hour >= 19:
        inicio = inicio.replace(hour=9, minute=0, second=0) + timedelta(days=1)
    elif inicio.hour < 9:
        inicio = inicio.replace(hour=9, minute=0, second=0)

    if fin.hour >= 19:
        fin = fin.replace(hour=9, minute=0, second=0) + timedelta(days=1)
    elif fin.hour < 9:
        fin = fin.replace(hour=9, minute=0, second=0)

    # Excluir sábados y domingos
    while inicio.weekday() >= 5:
        inicio += timedelta(days=1)
    while fin.weekday() >= 5:
        fin += timedelta(days=1)

    # Calcular diferencia en horas hábiles
    diferencia = (fin - inicio).total_seconds() / 3600
    return max(diferencia, 0)  # No permitir valores negativos

# 📌 Organizar datos por ID_CONTRATO
contratos = {}
for tramite in datos_tramites:
    id_contrato = tramite["ID_CONTRATO"]
    if id_contrato not in contratos:
        contratos[id_contrato] = []
    contratos[id_contrato].append(tramite)

# 📊 Crear estructura para DataFrame
data_list = []

# 📊 Analizar cada contrato individualmente
for id_contrato, tramites in contratos.items():
    tiempos_por_estado = {}
    motivos_devolucion = {}
    contador_devuelto = 0
    contador_rechazado = 0

    # Ordenar los trámites por fecha
    tramites.sort(key=lambda x: x["Fecha"])

    # Analizar tiempos entre estados
    for i in range(len(tramites) - 1):
        estado_actual = tramites[i]["Estatus"]
        estado_siguiente = tramites[i + 1]["Estatus"]
        tiempo_transicion = calcular_tiempo_habil(tramites[i]["Fecha"], tramites[i + 1]["Fecha"])

        # Guardar tiempo entre estados
        clave = f"{estado_actual} -> {estado_siguiente}"
        if clave not in tiempos_por_estado:
            tiempos_por_estado[clave] = []
        tiempos_por_estado[clave].append(tiempo_transicion)

        # Contar trámites devueltos o rechazados
        if estado_siguiente == "Devuelto":
            contador_devuelto += 1
            motivo = tramites[i + 1]["Comentario"].strip().upper()
            motivos_devolucion[motivo] = motivos_devolucion.get(motivo, 0) + 1

        if estado_siguiente == "Rechazado":
            contador_rechazado += 1

    # Agregar datos al DataFrame
    for clave, tiempos in tiempos_por_estado.items():
        promedio = sum(tiempos) / len(tiempos) if tiempos else 0
        data_list.append({
            "ID_CONTRATO": id_contrato,
            "Estado_Transicion": clave,
            "Tiempo_Promedio_Horas": round(promedio, 2),
            "Cantidad_Devueltos": contador_devuelto,
            "Cantidad_Rechazados": contador_rechazado,
            "Motivos_Devuelto": ", ".join([f"{motivo}: {cantidad} veces" for motivo, cantidad in motivos_devolucion.items()])
        })

# Crear DataFrame
df = pd.DataFrame(data_list)

# Guardar en Excel
excel_path = "./analisis_pagotrack.xlsx"
df.to_excel(excel_path, index=False)

# Mostrar archivo al usuario
import ace_tools as tools
tools.display_dataframe_to_user(name="Análisis de Pagotrack", dataframe=df)

# Devolver la ruta del archivo generado
excel_path
