+-------------------+
|      Creado       |  ← Operador registra el expediente en Pagotrack.
+-------------------+
          |
          v
+-------------------+
|     Turnado       |  ← Operador turna expediente a un analista.---------------------------+
+-------------------+                                                                       |
          |                                                                                 |
          |  +-------------------+                                                          |
          |  |   Procesando      |  ← Analista revisa y procesa el expediente.--------+     |
          |  +-------------------+                                                    |     |
          |                                                                           |     |
          v                                                                           |     |
+-------------------+                                                                 |     |
|     Devuelto      |  ← Expediente se devuelve para corrección.                      |     |
+-------------------+                                                                 |     |
          |                                                                           |     |
          |-------------------[Error detectado]---------------------------------------|     |
          v                                                                           |     |
+-------------------+                                                                 |     |
| JuntasAuxiliares  |  ← Analista concluye y cambia de estado.                        |     |
+-------------------+                                                                 |     |
          |                                                                           |     |
          v                                                                           |     |
+-------------------+                                                                 |     |
|   Inspectoria     |  ← Analista concluye y cambia de estado.                        |     |
+-------------------+                                                                 |     |
          |                                                                           |     |
          v                                                                           |     |
+-------------------+                                                                 |     |
|  RegistradoSAP    |  ← Analista concluye y cambia de estado.                        |     |
+-------------------+                                                                 |     |
          |                                                                           |     |
          v                                                                           |     |
+-------------------+                                                                 |     |
|      Remesa       |  ← Operador crea remesa con expedientes en SAP.                 |     |
+-------------------+                                                                 |     |
          |                                                                           |     |
          |  +-------------------+                                                    |     |
          |  |   Procesando      |  ← DG revisa y procesa el expediente.              |     |
          |  +-------------------+                                                    |     |
          |                                                                           |     |
          |------------------[Error detectado]----------------------------------------+     |    
          v                                                                                 |
+-------------------+                                                                       |
|       VoBo        |  ← DG aprueba el expediente.                                          |
+-------------------+                                                                       | 
          |                                                                                 | 
          |                                                                                 | 
          |  +-------------------+                                                          | 
          |  |   Procesando      |  ← Ordenes Pago revisa y procesa el expediente.          | 
          |  +-------------------+                                                          |   
          |                                                                                 |
          v                                                                                 | 
+-------------------+                                                                       | 
|DevueltoOrdenesPago|  ← Ordenes de Pago lo devuelven a Glosa.                              |
+-------------------+                                                                       |
          |                                                                                 |
          |                                                                                 |
          |------------------[Error detectado]----------------------------------------------+
          v
          |
+-------------------+
|Pagado Transferencia| ← Estado si se paga vía transferencia.
+-------------------+
          |
          v
+-------------------+
|  Pagado Cheque    |  ← Estado si se paga con cheque.
+-------------------+
          |
          |
          v   
+-------------------+
|    Terminado      |  ← DG concluye el proceso.
+-------------------+                                           
          |                                                        
          |
          v                                                     
+-------------------+                                              
|    Rechazado      |  ← Tesorería rechaza el expediente.          
+-------------------+   
          |
          v
+-------------------+
|    Cancelado      |  ← Operador cancela el expediente.
+-------------------+






CALL sp_FiltrarTramites(
    NULL,           -- p_Estado
    NULL,           -- p_Mes (nombre en inglés)
    NULL,           -- p_TipoTramite
    NULL,           -- p_Analista
    NULL,           -- p_Dependencia
    NULL,           -- p_Proveedor
    NULL,           -- p_Concepto
    NULL,           -- p_Importe
    NULL,           -- p_Remesa
    NULL,           -- p_IntegracionSAP
    NULL,           -- p_DocSAP
    NULL,           -- p_NumeroTramite
    'AAAA-MM-DD',   -- p_FechaRecepcion
    'AAAA-MM-DD'    -- p_FechaVencimiento
);

{
    "estado": "Creado",
    "mes": "Enero",
    "tipoTramite": "OC",
    "analista": "22",
    "dependencia": "Oficina de Presidencia",
    "proveedor": "er",
    "concepto": "re",
    "importe": 23,
    "remesa": "re",
    "integracionSAP": "t",
    "docSAP": "t",
    "numeroTramite": "tr",
    "fechaRecepcion": "2025-03-27",
    "fechaVencimiento": "2025-03-27"
}


'Creado','Turnado','Procesando','Observaciones','JuntasAuxiliares','Inspectoria','RegistradoSAP','Remesa','RevisionRemesa','RemesaAprobada','DevueltoOrdenesPago','Pagado','Terminado','Rechazado','Devuelto','Cancelado','Cheque'