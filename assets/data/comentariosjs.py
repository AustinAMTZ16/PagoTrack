import json
import mysql.connector

# Configuración de conexión a MySQL
db_config = {
    "host": "24.144.89.231",
    "user": "engranetmx",
    "password": "huaweiP20!",
    "database": "system_recepcion_pagos_dependencias"
}

# Conectar a la base de datos
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor(dictionary=True)  # Activar modo diccionario

# Consulta SQL
query = """
    SELECT Comentarios 
    FROM ConsentradoGeneralTramites 
    WHERE DATE(FechaRecepcion) >= '2025-03-01';
"""
cursor.execute(query)

# Extraer registros
registros = cursor.fetchall()

# Lista para almacenar todos los comentarios en una sola estructura JSON
comentarios_consolidados = []

# Recorrer cada fila, convertir el JSON almacenado y agregarlo a la lista
for registro in registros:
    try:
        comentarios_json = json.loads(registro["Comentarios"])  # Convertir a JSON
        comentarios_consolidados.extend(comentarios_json)  # Agregar al JSON consolidado
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON en un registro: {e}")

# Cerrar conexión a la base de datos
cursor.close()
conn.close()

# Guardar los datos en un archivo JSON
with open("pagotrack_data.json", "w", encoding="utf-8") as file:
    json.dump(comentarios_consolidados, file, indent=4, ensure_ascii=False)

print("✅ Archivo JSON generado: pagotrack_data.json")
