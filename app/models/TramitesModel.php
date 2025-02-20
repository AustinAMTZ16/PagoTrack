<?php
include_once 'app/config/Database.php';

class TramitesModel {
    private $conn;
    public function __construct() {
        $this->conn = (new Database())->conn;
    }
    // Crear un nuevo trámite
    public function create($data) {
        date_default_timezone_set('America/Mexico_City'); // Establecer zona horaria de México
        $fechaActual = date('Y-m-d H:i:s'); // Obtener fecha y hora actual en formato MySQL

        // Crear el primer comentario en formato JSON
        $comentariosArray = [];

        if (!empty($data['Comentarios'])) {
            $comentarioInicial = [
                "Fecha" => $fechaActual,
                "Estatus" => $data['Estatus'],
                "Comentario" => $data['Comentarios']
            ];
            $comentariosArray[] = $comentarioInicial;
        }

        // Convertir a JSON el array de comentarios
        $comentariosJSON = json_encode($comentariosArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        try {
            $query = "INSERT INTO ConsentradoGeneralTramites (Mes, TipoTramite, Dependencia, Proveedor, Concepto, Importe, Estatus, Comentarios, Fondo, FechaLimite, AnalistaID) 
                    VALUES (:Mes, :TipoTramite, :Dependencia, :Proveedor, :Concepto, :Importe, :Estatus, :Comentarios, :Fondo, :FechaLimite, :AnalistaID)";
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':Mes', $data['Mes']);
            $stmt->bindParam(':TipoTramite', $data['TipoTramite']);
            $stmt->bindParam(':Dependencia', $data['Dependencia']);
            $stmt->bindParam(':Proveedor', $data['Proveedor']);
            $stmt->bindParam(':Concepto', $data['Concepto']);
            $stmt->bindParam(':Importe', $data['Importe']);
            $stmt->bindParam(':Estatus', $data['Estatus']);
            $stmt->bindParam(':Comentarios', $comentariosJSON);
            $stmt->bindParam(':Fondo', $data['Fondo']);
            $stmt->bindParam(':FechaLimite', $data['FechaLimite']);
            $stmt->bindParam(':AnalistaID', $data['AnalistaID']);

            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            } else {
                throw new Exception("Error al registrar el trámite.");
            }
        } catch (PDOException $e) {
            throw new Exception("Error al registrar el trámite: " . $e->getMessage());
        }
    }
    // Obtener todos los trámites
    public function getAll() {
        $query = "SELECT  ISS.NombreUser, ISS.ApellidoUser, CT.* FROM ConsentradoGeneralTramites CT
                    INNER JOIN InicioSesion ISS 
                    ON CT.AnalistaID = ISS.InicioSesionID 
                    ORDER BY CT.FechaRecepcion DESC;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    // Actualizar un trámite
    public function update($data) {
        date_default_timezone_set('America/Mexico_City'); // Establecer zona horaria de México
        $fechaActual = date('Y-m-d H:i:s'); // Obtener fecha y hora actual en formato MySQL

        try {
            // Paso 1: Obtener el registro actual
            $querySelect = "SELECT Estatus, Comentarios, AnalistaID FROM ConsentradoGeneralTramites WHERE ID_CONTRATO = :ID_CONTRATO";
            $stmtSelect = $this->conn->prepare($querySelect);
            $stmtSelect->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmtSelect->execute();
            $currentData = $stmtSelect->fetch(PDO::FETCH_ASSOC);

            if (!$currentData) {
                return false; // Si no se encuentra el registro, retornar falso.
            }

            // Paso 2: Usar los valores actuales como predeterminados
            $estatus = isset($data['Estatus']) && $data['Estatus'] !== '' ? $data['Estatus'] : $currentData['Estatus'];
            $AnalistaID = isset($data['AnalistaID']) && $data['AnalistaID'] !== '' ? $data['AnalistaID'] : $currentData['AnalistaID'];

            // Paso 3: Construir el nuevo comentario en formato JSON
            $nuevoComentario = isset($data['Comentarios']) && $data['Comentarios'] !== '' 
                ? json_encode([
                    "Fecha" => $fechaActual,
                    "Estatus" => $estatus,
                    "Comentario" => $data['Comentarios']
                ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) 
                : '';

            // Paso 4: Acumular comentarios manteniendo el formato JSON
            if (!empty($currentData['Comentarios'])) {
                // Si ya hay comentarios, convertirlos a array
                $comentariosArray = json_decode($currentData['Comentarios'], true);
                if (!is_array($comentariosArray)) {
                    $comentariosArray = [];
                }
            } else {
                $comentariosArray = [];
            }

            // Agregar el nuevo comentario al array
            if ($nuevoComentario !== '') {
                $comentariosArray[] = json_decode($nuevoComentario, true);
            }

            // Convertir el array nuevamente a JSON
            $comentariosActualizados = json_encode($comentariosArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

            // Paso 5: Actualizar el registro
            $queryUpdate = "UPDATE ConsentradoGeneralTramites 
                            SET Estatus = :Estatus, 
                                Comentarios = :Comentarios, 
                                FechaTurnado = :FechaTurnado, 
                                AnalistaID = :AnalistaID 
                            WHERE ID_CONTRATO = :ID_CONTRATO";

            $stmtUpdate = $this->conn->prepare($queryUpdate);

            $stmtUpdate->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmtUpdate->bindParam(':Estatus', $estatus);
            $stmtUpdate->bindParam(':Comentarios', $comentariosActualizados);
            $stmtUpdate->bindParam(':AnalistaID', $AnalistaID);
            $stmtUpdate->bindParam(':FechaTurnado', $data['FechaTurnado'], PDO::PARAM_STR);

            return $stmtUpdate->execute();

        } catch (PDOException $e) {
            throw new Exception("Error al actualizar el trámite: " . $e->getMessage());
        }
    }
    // Eliminar un trámite
    public function delete($data) {
        $query = "DELETE FROM ConsentradoGeneralTramites WHERE ID_CONTRATO = :ID_CONTRATO";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
        $stmt->execute();
        $filasAfectadas = $stmt->rowCount();
        if ($filasAfectadas > 0) {
            return true;
        } else {
            return false;
        }
    }
    // Tabla de seguimiento de trámites
    public function getSeguimientoTramites() {
        $query = "SELECT 
                    ISN.NombreUser AS Analista,
                    ISN.ApellidoUser AS Apellido,
                    SUM(CASE WHEN CGT.TipoTramite = 'OC' THEN 1 ELSE 0 END) AS OC,
                    SUM(CASE WHEN CGT.TipoTramite = 'OP' THEN 1 ELSE 0 END) AS OP,
                    SUM(CASE WHEN CGT.TipoTramite = 'SRF' THEN 1 ELSE 0 END) AS SRF,
                    SUM(CASE WHEN CGT.TipoTramite = 'CRF' THEN 1 ELSE 0 END) AS CRF,
                    SUM(CASE WHEN CGT.TipoTramite = 'JA' THEN 1 ELSE 0 END) AS JA,
                    SUM(CASE WHEN CGT.TipoTramite = 'IPS' THEN 1 ELSE 0 END) AS IPS,
                    SUM(CASE WHEN CGT.TipoTramite = 'Obra' THEN 1 ELSE 0 END) AS Obra,
                    SUM(CASE WHEN CGT.TipoTramite = 'OCO' THEN 1 ELSE 0 END) AS OCO,
                    SUM(CASE WHEN CGT.TipoTramite = 'OPO' THEN 1 ELSE 0 END) AS OPO,
                    COUNT(*) AS Total
                FROM ConsentradoGeneralTramites CGT
                INNER JOIN InicioSesion ISN ON CGT.AnalistaID = ISN.InicioSesionID
                WHERE CGT.Estatus IN ('Turnado', 'Devuelto')  -- Filtra solo los estatus requeridos
                GROUP BY ISN.NombreUser, ISN.ApellidoUser
                ORDER BY Total DESC;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    // Conteo por estatus
    public function getConteoEstatus() {
        $query = "SELECT Estatus, COUNT(*) AS Total FROM ConsentradoGeneralTramites GROUP BY Estatus;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    //Reporte de estatus de comentarios
    public function getReporteEstatusComentarios() {
        $query = "SELECT Estatus, Comentarios, is2.NombreUser, FechaTurnado, COUNT(*) AS total_registros
                    FROM ConsentradoGeneralTramites ct
                    INNER JOIN InicioSesion is2 
                    ON ct.AnalistaID = is2.InicioSesionID 
                    GROUP BY Estatus, Comentarios, is2.NombreUser, FechaTurnado 
                    ORDER BY FechaTurnado DESC;";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
