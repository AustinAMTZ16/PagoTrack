

Actores : Analista A, Analista B, Analista OP

Analista A -> Se recibe y sellan trámites 
Analista A -> Se registra en el sistema:
    TB -> ConsentradoGeneralTramites
        ID_CONTRATO (PK, AutoIncrement),
        Mes (varchar40),
        FechaRecepcion(datetime),
        TipoTramite(OC, OP, SRF, CRF),
        Dependencia(varchar40),
        Proveedor(varchar40),
        Concepto(varchar40),
        Importe(decimal),
        AnalistaTurnado(varchar40),
        Estatus(varchar40),
        Comentarios(varchar40),
Analista B -> Encargado de analizar el trámite y asignar el estatus y comentarios.
    case Trámite Observaciones:
        Se llevara a cabo un volante de observaciones con un limete de 2 hábiles para que el proveedor corrija los errores.
        Se actualiza el estatus del trámite a "Observaciones"
        Se llena el campo Comentarios con las observaciones del volante de observaciones.
    case Trámite Correcto:
        Se registra en el sistema SAP generando un numero de documento de pago y folio consecutivo integra para su control.
        Se actualiza el estatus del trámite a "Correcto"
        Se actualiza el campo Comentarios con el numero de documento de pago y folio consecutivo integra.
        Se regristra en la tabla :
            TB -> Remesas
                ID_REMESA (PK, AutoIncrement),
                FechaRemesa(datetime),
                NumeroRemesa(varchar40),
                NumeroConsecutivo(varchar40),
                FolioIntegra(varchar40),
                OficioPeticion(varchar40),
                TipoTramite(varchar40),
                Beneficiario(varchar40),
                Concepto(varchar40),
                Importe(decimal),
                FechaPago(datetime),
                FuenteFinanciamiento(varchar40),
                Documento(varchar40),
                Estatus(varchar40),
                Comentarios(varchar40)
                FK_CONTRATO(int),
        Se revisa la remesa junto con los documentos de pago con el visto bueno y validacion de la jefatura y dirección.
        Se envia al área de órdenes de pago para su pago.
Analista OP -> Se revisa la remesa junto con los documentos de pago con el visto bueno y validacion de la jefatura y dirección. Para su disponibilidad financiera y contable.
    Transferencia -> Afectación Contable y Afectación Financiera.
    Cheque -> Diposponibilidad financiera, Afectacion contable y Emisión de cheque.
    Se revise oficios para su analisis y validacion de la jefatura y dirección.
    Se clasifica los oficios por tipo de pago.
    Se revisar los datos del oficio en el sistema SAP para su disponibilidad financiera y contable.
    Se genera la orden de pago en el sistema SAP.
Analista A -> Se actualiza el estatus del trámite a "Pagado"
    Se actualiza el campo Comentarios con el numero de documento de pago y folio consecutivo integra.




Lista de Metodos

URIQA: http://localhost/DigitalOcean/Egresos/PagoTrack_back/index.php?action=
URIPRO: http://www.PagoTrack_back.com/index.php?action=

POST
    - createTramite(data)
        - Mes
        - TipoTramite
        - Dependencia
        - Proveedor
        - Concepto
        - Importe
        - AnalistaTurnado
        - Estatus
        - Comentarios
        - Fondo
        - FechaLimite
    - createRemesa(data)
        - DepartamentoTurnado
        - NumeroRemesa
        - NumeroConsecutivo
        - FolioIntegra
        - OficioPeticion
        - Beneficiario
        - FechaPago
        - FuenteFinanciamiento
        - Documento
        - Estatus
        - Comentarios
        - FK_CONTRATO
    - loginUser(data)
        - CorreoUser
        - ClaveUser
    - registerUser(data)
        - NickUser
        - NombreUser
        - ApellidoUser
        - CorreoUser
        - ClaveUser
        - RolUser
        - DepartamentoUser

GET
    - getTramites()
    - getRemesas()
    - checkUserExistsUser(data)
        - CorreoUser

PATCH
    - updateTramite(data)
        - ID_CONTRATO
        - Estatus
        - Comentarios
        - AnalistaTurnado
    - updateRemesa(data)
        - ID_REMESA
        - Estatus
        - Comentarios
    - updateUser(data)
        - InicioSesionID
        - NickUser
        - NombreUser
        - ApellidoUser
        - CorreoUser
    - recoverPasswordUser(data)
        - CorreoUser
        - ClaveUser
DELETE
    - deleteTramite(data)   
        - ID_CONTRATO
    - deleteRemesa(data)
        - ID_REMESA



HU_TRANSACCION_ConsentradoTramites:
    Como [Analista A] 
    [quiero] llevar un control de los trámites de las ordenes de compromiso.
    [para] que se pueda llevar un control de los trámites de las ordenes de compromiso.
- createTramite(data)
- getTramites()
- updateTramite(data)
- deleteTramite(id)




OC Ordenes Compromiso
OP Órdenes de Pago
SRF Solicitud de Recurso Financieros
CRF Comprobación de Recurso Financieros

401000000	Coordinación de las Regidurias
402000000	Oficina de Presidencia
403000000	Sindicatura Municipal
404000000	Secretaría del Ayuntamiento
405000000	Tesorería Municipal
406000000	Contraloría Municipal
407000000	Secretaría General de Gobierno
408000000	Secretaría de Bienestar y Participación Ciudadana
409000000	Secretaría de Movilidad e Infraestructura
410000000	Secretaría de Gestión y Desarrollo Urbano 
411000000	Secretaría de Economía y Turismo
412000000	Secretaría de Administración y Tecnologías de la Información
413000000	Secretaría de Seguridad Ciudadana
414000000	Coordinación General de Transparencia y Municipio Abierto
416000000	Sistema Municipal DIF 
417000000	Organismo Operador del Servicio de Limpia del Municipio de Puebla
418000000	Instituto Municipal de Arte y Cultura de Puebla
419000000	Instituto Municipal de Planeación
420000000	Instituto Municipal del Deporte de Puebla
421000000	Instituto de la Juventud del Municipio de Puebla
422000000	Industrial de Abastos de Puebla
424000000	Coordinación General de Comunicación Social
426000000	Secretaria para la Igualdad Sustantiva de Género
428000000	Secretaría de Servicios Públicos
429000000	Secretaría de Medio Ambiente

Juan Carlos García Tagle 
Isabel Cortes Varillas
Ariadna Michel Sanchez Rodriguez
Michelle Cordova Torres
Daniel Rodríguez Cárdenas 
Antonio Castañon Ruiz
    
Creado
Procesando
Observaciones
Terminado




'Creado','Turnado','Procesando','Observaciones','Terminado'













•	SuficienciasID: Clave primaria que se autoincrementa automáticamente.
•	PersonaQuienSolicita: Nombre de la persona que solicita la suficiencia.
•	Dependencia: Dependencia que realiza la solicitud.
•	CentroGestor: Código del centro gestor.
•	AreaFuncional: Código del área funcional.
•	NoOficioSolicitud: Número de oficio de la solicitud.
•	FechaSolicitud: Fecha en que se realizó la solicitud.
•	FechaRecepcion: Fecha en que se recibió la solicitud.
•	NoOficioContestacion: Número de oficio de contestación.
•	Tipo: Tipo de suficiencia (en este caso, "ORIGEN", “MULTIANUAL”,”ACTUALIZACION”).
•	FechaContestacion: Fecha en que se contestó la solicitud.
•	SolpedCompromisoGasto: Número de SOLPED o compromiso de gasto.
•	ServicioSolicitado: Descripción del servicio solicitado.
•	FuenteFinanciamiento: Código de la fuente de financiamiento.
•	PosPrecog: Posición presupuestaria.
•	Requisito: Requisito. Según el PosPrecog
•	Concepto: Descripción del concepto de la suficiencia.
•	MontoSuficienciaPresupuestal2024: Monto de la suficiencia presupuestal.
•	Conac: Código CONAC.
•	Cuenta: Número de cuenta.
•	Folio: Número de folio.
•	Foja: Número de Hojas scaneadas del archivo fisico (puede ser nulo).
•	NoticiaAdministrativa: Noticia administrativa solo si afecta el presupuesto (true/false).
•	NoContabilizarConsecutivo: Consecutivo ligado a la noticia administrativa(puede ser nulo).
•	ConsecutivoMes: Consecutivo del mes (puede ser nulo).
•	Mes: Mes correspondiente.
•	Observaciones: Observaciones adicionales.




SELECT R.ID_CONTRATO, R.AnalistaID, I.NombreUser, I.ApellidoUser FROM ConsentradoGeneralTramites R 
INNER JOIN InicioSesion I
ON R.AnalistaID = I.InicioSesionID
WHERE R.ID_CONTRATO = 337





CREATE TABLE Suficiencias (
    SuficienciasID INT PRIMARY KEY AUTO_INCREMENT,
    PersonaQuienSolicita VARCHAR(255) NOT NULL,
    Dependencia VARCHAR(255) NOT NULL,  --CATALOGO
    CentroGestor VARCHAR(50) NOT NULL,  --CATALOGO
    AreaFuncional VARCHAR(50) NOT NULL, --CATALOGO
    NoOficioSolicitud VARCHAR(100) NOT NULL,
    FechaSolicitud DATE NOT NULL,
    FechaRecepcion DATE NOT NULL,
    NoOficioContestacion VARCHAR(100) NOT NULL,
    Tipo ENUM('ORIGEN', 'MULTIANUAL', 'ACTUALIZACION') NOT NULL,
    FechaContestacion DATE NOT NULL,
    SolpedCompromisoGasto VARCHAR(50) NOT NULL,
    ServicioSolicitado VARCHAR(255) NOT NULL,
    FuenteFinanciamiento VARCHAR(50) NOT NULL,  --CATALOGO
    PosPrecog VARCHAR(50) NOT NULL,  --CATALOGO 
    Requisito VARCHAR(100) NOT NULL,  --CATALOGO
    Concepto TEXT NOT NULL,
    MontoSuficienciaPresupuestal2024 DECIMAL(15, 2) NOT NULL,
    Conac INT NOT NULL,
    Cuenta INT NOT NULL,
    Folio INT NOT NULL,
    Foja INT,
    NoticiaAdministrativa BIT DEFAULT 0,
    NoContabilizarConsecutivo INT,
    ConsecutivoMes INT,
    Mes ENUM('ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE') NOT NULL,
    Observaciones TEXT
);


INSERT INTO Suficiencias (
    PersonaQuienSolicita, Dependencia, CentroGestor, AreaFuncional, NoOficioSolicitud, 
    FechaSolicitud, FechaRecepcion, NoOficioContestacion, Tipo, FechaContestacion, 
    SolpedCompromisoGasto, ServicioSolicitado, FuenteFinanciamiento, PosPrecog, Requisito, 
    Concepto, MontoSuficienciaPresupuestal2024, Conac, Cuenta, Folio, Foja, 
    NoticiaAdministrativa, NoContabilizarConsecutivo, ConsecutivoMes, Mes, Observaciones
) VALUES (
    'ALICIA SANCHEZ GONZALEZ', 
    'SECRETARÍA DE SERVICIOS PÚBLICOS',  -- Dependencia (CATALOGO)
    '428040000',  -- CentroGestor (CATALOGO)
    'E13013307070325B',  -- AreaFuncional (CATALOGO)
    'SECATI-DPVA-EA-SSP-008/2025',  -- NoOficioSolicitud
    '2025-01-13',  -- FechaSolicitud
    '2025-01-13',  -- FechaRecepcion
    'SP/0065',  -- NoOficioContestacion
    'ORIGEN',  -- Tipo (ENUM: ORIGEN, MULTIANUAL, ACTUALIZACION)
    '2025-01-13',  -- FechaContestacion
    '336227',  -- SolpedCompromisoGasto
    'SUFICIENCIA CON COMPROMISO DE GASTO',  -- ServicioSolicitado
    '10050',  -- FuenteFinanciamiento (CATALOGO)
    '31101',  -- PosPrecog (CATALOGO)
    'NO APLICA',  -- Requisito (CATALOGO)
    'REALIZAR EL PAGO MENSUAL CORRESPONDIENTE A LA FACTURA EMITIDA',  -- Concepto
    179753372.00,  -- MontoSuficienciaPresupuestal2024
    11,  -- Conac
    3069,  -- Cuenta
    57,  -- Folio
    NULL,  -- Foja (puede ser NULL)
    0,  -- NoticiaAdministrativa (BIT: 0 o 1)
    NULL,  -- NoContabilizarConsecutivo (puede ser NULL)
    NULL,  -- ConsecutivoMes (puede ser NULL)
    'ENERO',  -- Mes (ENUM: ENERO, FEBRERO, ..., DICIEMBRE)
    'SE SUSTITUYÓ SU SOLICITUD, PORQUE EL MONTO ESTABA MAL Y SU CONCEPTO'  -- Observaciones
);