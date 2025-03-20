import mysql.connector
from reportlab.pdfgen import canvas

# 1. Conectar a la base de datos
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="test"
)
cursor = conn.cursor()

# 2. Ejecutar la consulta con prevención de inyección SQL
tramite_id = 2 
cursor.execute("""
    SELECT 
        T.ID_Transaccion,
        T.Tipo_Documento,
        DATE_FORMAT(T.Fecha_Emision, '%d de %M de %Y') AS Fecha_Larga,
        T.Folio_Integra,
        T.Importe_Total,
        T.Importe_Letra,
        T.Concepto,
        T.Num_Acreedor,
        T.Clave_Presupuestal,
        T.Elemento_PEP,
        T.Doc_SAP,
        T.Cuenta_Pagadora,
        T.Deducciones,
        T.Reintegro,
        T.Banco,
        T.CLABE,
        B.Nombre AS Nombre_Beneficiario,
        B.RFC,
        B.Cargo AS Cargo_Beneficiario,
        T.Autorizacion_Titular,
        DV.ID_Transaccion_Destino AS ID_Documento_Vinculado,
        TV.Tipo_Documento AS Tipo_Documento_Vinculado
    FROM Transacciones T
    JOIN Beneficiarios B ON T.Beneficiario_ID = B.Beneficiario_ID
    LEFT JOIN Documentos_Vinculados DV ON T.ID_Transaccion = DV.ID_Transaccion_Origen
    LEFT JOIN Transacciones TV ON DV.ID_Transaccion_Destino = TV.ID_Transaccion
    WHERE T.ID_Transaccion = %s;
""", (tramite_id,))

# Obtener los datos
datos = cursor.fetchone()
columnas = [desc[0] for desc in cursor.description]  # Obtener nombres de columnas

# Verificar si hay datos
if datos:
    # 3. Crear el PDF
    pdf = canvas.Canvas(f"Tramite_{tramite_id}.pdf")

    # Posición inicial en el PDF
    x = 100  # Margen izquierdo
    y = 750  # Posición inicial desde arriba

    # Título del documento
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(x, y, f"Reporte del Trámite {tramite_id}")
    y -= 30  # Espacio después del título

    # Cambiar la fuente para los datos
    pdf.setFont("Helvetica", 10)

    # Recorrer todas las columnas y sus valores
    for i in range(len(columnas)):
        pdf.drawString(x, y, f"{columnas[i]}: {datos[i]}")  # Imprimir nombre y valor
        y -= 20  # Espaciado entre líneas

        # Si llegamos al final de la página, crear una nueva
        if y < 50:
            pdf.showPage()
            y = 750
            pdf.setFont("Helvetica", 10)

    # Guardar el PDF
    pdf.save()
    print(f"PDF generado correctamente: Tramite_{tramite_id}.pdf")
else:
    print("No se encontraron datos para el trámite.")

# Cerrar conexión
cursor.close()
conn.close()
