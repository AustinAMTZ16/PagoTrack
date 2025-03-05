OC	CONTRATO DE SERVICIO
OC	CONTRATO ABIERTO (IMPORTE MÁXIMO Y MÍNIMOS)
OC	CONTRATO MULTIANUAL (2 O MÁS AÑOS)
OC	CONTRATO CONSOLIDADO (2 O MÁS DEPENDENCIAS)
OC	CONVENIO MODIFICATORIO
OP	MINISTRACIÓN DE ORGANISMOS DESCENTRALIZADOS
OP	SISTEMA MUNICIPAL DIF
OP	COSI
OP	INDUSTRIAL DE ABASTOS
OP	INSTITUTO MUNICIPAL DEL DEPORTE
OP	INSTITUTO MUNICIPAL DE PLANEACIÓN
OP	INSTITUTO MUNICIPAL DE ARTE Y CULTURA
OP	INSTITUTO MUNICIPAL DE MUJERES
OP	INSTITUTO DE LA JUVENTUD DEL MUNICIPIO DE PUEBLA
OP	ORDEN DE PAGO POR UN SERVICIO Y/O ADQUISICIÓN
OP	APOYOS
OP	ARRENDAMIENTO DE INMUEBLES
OP	REPOSICIÓN FONDO REVOLVENTE
OP	IMPUESTOS HONORARIOS, RESICO, ARRENDAMIENTO (NORMAL / VIRTUAL)
OP	IMPUESTOS INSS, SAR, INFORMATI (NORMAL / VIRTUAL)
OP	IMPUESTOS INSS, SAR, INFORMATI
OP	COMISIONES BANCARIAS
OP	APOYO A CADETES
OP	BECAS
OP	REINTEGROS
OP	PAGO DE HONORARIOS
OP	ARRENDAMIENTOS VARIOS
OP	MINISTRACIONES DE JUNTAS AUXILIARES (17)
OP	MINISTRACIONES DE INSPECTORÍAS
OP	MANTENIMIENTO VEHICULAR
SRF	APERTURA DE FONDO REVOLVENTE
SRF	SOLICITUD DE RECURSOS FINANCIEROS (COMISIÓN/URGENCIA)
CRF	COMPROBACIÓN DE RECURSOS FINANCIEROS (POR PERSONAL COMISIONADO)
CRF	GASTOS POR COMPROBAR (MINISTRACIONES DE JTA-AUX, E INSPECTORÍAS)
CRF	CANCELACIÓN FONDO REVOLVENTE
Obra Orden Compromiso 
Obra Ordenes Pago Anticipo 
Obra Ordenes Pago de la Estimaciones
    Obra Ordenes Pago Convenios DIF 
    Obra Ordenes Pago Convenios CMIC






-- Tabla Beneficiarios
CREATE TABLE Beneficiarios (
    Beneficiario_ID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    RFC VARCHAR(13) NOT NULL,
    Cargo VARCHAR(50)
);

-- Tabla Transacciones
CREATE TABLE Transacciones (
    ID_Transaccion INT AUTO_INCREMENT PRIMARY KEY,
    Tipo_Documento ENUM('Orden Compromiso', 'Orden de Pago', 'Solicitud', 'Comprobación') NOT NULL,
    Folio_Integra VARCHAR(20) NOT NULL,
    Importe_Total DECIMAL(12,2) NOT NULL,
    Importe_Letra VARCHAR(255) NOT NULL,
    Concepto VARCHAR(255) NOT NULL,
    Num_Acreedor VARCHAR(20) NOT NULL,
    Beneficiario_ID INT NOT NULL,
    Autorizacion_Titular VARCHAR(255) NOT NULL,
    Fecha_Emision DATETIME NOT NULL,
    Clave_Presupuestal VARCHAR(20) NOT NULL,
    Elemento_PEP VARCHAR(50),
    Doc_SAP VARCHAR(20),
    Cuenta_Pagadora VARCHAR(30),
    Deducciones DECIMAL(12,2),
    Reintegro DECIMAL(12,2),
    Banco VARCHAR(50),
    CLABE VARCHAR(18),
    FOREIGN KEY (Beneficiario_ID) REFERENCES Beneficiarios(Beneficiario_ID)
);

-- Tabla Documentos_Vinculados
CREATE TABLE Documentos_Vinculados (
    ID_Transaccion_Origen INT,
    ID_Transaccion_Destino INT,
    FOREIGN KEY (ID_Transaccion_Origen) REFERENCES Transacciones(ID_Transaccion),
    FOREIGN KEY (ID_Transaccion_Destino) REFERENCES Transacciones(ID_Transaccion)
);





Regla de negocio al devolver un tramite tiene un periodo de 2 días habiles para mitigar las observaciones del analista. La regla valida la fecha_devuelto con la fecha_actual en caso de que la fecha_actual sea mayor a 3 días hábiles después de la fecha_devuelto deberá cambiar el estatus a ‘Rechazado’ y en comentarios deberá poner ‘Rechazado se supero los días permitidos para resolver las observaciones  por el analista.’


Campos de la Tabla ConsentradoGeneralTramites

ID_CONTRATO	int(11)
Mes	varchar(40)
FechaRecepcion	timestamp
TipoTramite	enum('OC','OP','SRF','CRF','JA','IPS','OCO','OPO','Obra')
Dependencia	varchar(100)
Proveedor	varchar(100)
Concepto	text
Importe	decimal(10,2)
AnalistaTurnado	varchar(80)
Estatus	enum('Creado','Turnado','Procesando','Observaciones','JuntasAuxiliares','Inspectoria','RegistradoSAP','Remesa','DevueltoOrdenesPago','Pagado','Terminado','Rechazado','Devuelto','Cancelado','Cheque')
Comentarios	text
Fondo	text
FechaLimite	datetime
FechaTurnado	datetime
FechaTurnadoEntrega	datetime
FechaDevuelto   datetime
AnalistaID	int(11)


DELIMITER $$

CREATE PROCEDURE ActualizarTramitesVencidos()
BEGIN
    UPDATE ConsentradoGeneralTramites
    SET Estatus = 'Rechazado',
        Comentarios = 
            CASE 
                WHEN Comentarios IS NULL OR Comentarios = '' THEN 
                    JSON_ARRAY(
                        JSON_OBJECT(
                            'Fecha', NOW(),
                            'Estatus', 'Rechazado',
                            'Usuario', 'Tarea Programada BD',
                            'Comentario', 'Rechazado se superó los días permitidos para resolver las observaciones por el analista.'
                        )
                    )
                ELSE 
                    JSON_ARRAY_APPEND(
                        Comentarios, '$', 
                        JSON_OBJECT(
                            'Fecha', NOW(),
                            'Estatus', 'Rechazado',
                            'Usuario', 'Tarea Programada BD',
                            'Comentario', 'Rechazado se superó los días permitidos para resolver las observaciones por el analista.'
                        )
                    )
            END
    WHERE Estatus = 'Devuelto'
    AND DATE_ADD(FechaDevuelto, INTERVAL 3 DAY) < CURDATE()
    AND DAYOFWEEK(FechaDevuelto) NOT IN (1, 7); -- Excluir fines de semana
END $$

DELIMITER ;


CREATE EVENT IF NOT EXISTS VerificarTramitesVencidos
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '15:30:00')
DO CALL ActualizarTramitesVencidos();


SHOW EVENTS;
SET GLOBAL event_scheduler = ON;


SHOW VARIABLES LIKE 'event_scheduler';
SET GLOBAL event_scheduler = ON;
















<?php
include_once 'app/config/Database.php';

class TramitesModel {
    private $conn;

    public function __construct() {
        $this->conn = (new Database())->conn;
    }

    // Función Actualizar Tramite Completo
    public function updateTramiteCompleto($data) {
        // Validar que el ID del contrato esté presente
        if (!isset($data['ID_CONTRATO']) || empty($data['ID_CONTRATO'])) {
            return ["error" => "ID_CONTRATO es obligatorio"];
        }

        $id_contrato = $data['ID_CONTRATO'];

        // 1️⃣ Consultar el registro actual
        $query = "SELECT * FROM ConsentradoGeneralTramites WHERE ID_CONTRATO = ?";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return ["error" => "Error en la preparación de la consulta: " . $this->conn->error];
        }

        $stmt->bind_param("i", $id_contrato);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            return ["error" => "No se encontró el trámite con ID $id_contrato"];
        }

        $registro_actual = $resultado->fetch_assoc();
        $stmt->close();

        // 2️⃣ Verificar qué datos han cambiado
        $campos_actualizar = [];
        $parametros = [];
        $tipos_parametros = "";

        foreach ($data as $campo => $valor) {
            if ($campo !== "ID_CONTRATO" && $valor !== '' && $valor !== null) {
                // Solo actualizar si el valor es diferente al actual
                if (strtolower(trim((string) $valor)) !== strtolower(trim((string) $registro_actual[$campo]))) {
                    $campos_actualizar[] = "$campo = ?";
                    $parametros[] = $valor;
                    $tipos_parametros .= is_numeric($valor) ? "d" : "s"; // d = decimal, s = string
                }
            }
        }

        // 3️⃣ Si hay cambios, construir y ejecutar la consulta UPDATE
        if (!empty($campos_actualizar)) {
            $parametros[] = $id_contrato;
            $tipos_parametros .= "i"; // Agregar el tipo para el ID

            $sql_update = "UPDATE ConsentradoGeneralTramites SET " . implode(", ", $campos_actualizar) . " WHERE ID_CONTRATO = ?";
            $stmt_update = $this->conn->prepare($sql_update);

            if (!$stmt_update) {
                return ["error" => "Error en la preparación de la consulta: " . $this->conn->error];
            }

            // Desreferenciar el array de parámetros para bind_param
            $stmt_update->bind_param($tipos_parametros, ...$parametros);

            if ($stmt_update->execute()) {
                return ["success" => "Trámite actualizado correctamente."];
            } else {
                return ["error" => "Error al actualizar: " . $stmt_update->error];
            }
        } else {
            return ["message" => "No hubo cambios en el trámite."];
        }
    }
}

