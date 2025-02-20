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