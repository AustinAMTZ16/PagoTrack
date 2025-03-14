<?php
include_once 'app/config/Database.php';

class RemesaModel {
    private $conn;
    public function __construct() {
        $this->conn = (new Database())->conn;
    }

    // Obtener lista de remesas
    public function getListaRemesas() {
        $query = "SELECT 
                        SUBSTRING_INDEX(RemesaNumero, '-', 2) AS Grupo,
                        COUNT(*) AS TotalRegistros
                    FROM ConsentradoGeneralTramites
                    WHERE RemesaNumero IS NOT NULL
                    GROUP BY Grupo;
                ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    // Obtener detalle de remesas
    public function getDetalleRemesas($data) {
        $consecutivo = $data['consecutivo'];
        $query = "SELECT 
                        SUBSTRING_INDEX(RemesaNumero, '-', 2) AS Grupo,
                        CG.ID_CONTRATO,
                        CG.OfPeticion,
                        CG.FechaRecepcion,
                        CG.IntegraSAP,
                        CG.DocSAP,
                        CG.TipoTramite,
                        CG.NoTramite,
                        CG.Dependencia,
                        CG.Proveedor,
                        CG.Concepto,
                        CG.Importe,
                        CG.DoctacionAnexo,
                        CG.Fondo,
                        CG.FechaRemesa,
                        CONCAT(i.NombreUser, ' ', i.ApellidoUser) AS Analista,
                        CG.Estatus
                    FROM ConsentradoGeneralTramites CG
                    inner join InicioSesion i on CG.AnalistaID = i.InicioSesionID
                    WHERE RemesaNumero IS NOT null
                    and CG.RemesaNumero like '$consecutivo%'
                    ORDER BY Grupo, RemesaNumero;
                 ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }












































    // Crear una nueva remesa
    public function create($data) {
        try {
            // Iniciar transacción
            $this->conn->beginTransaction();
    
            // Insertar en la tabla Remesas
            $query = "INSERT INTO Remesas (DepartamentoTurnado, NumeroRemesa, NumeroConsecutivo, FolioIntegra, OficioPeticion, Beneficiario, FechaPago, FuenteFinanciamiento, Documento, Estatus, Comentarios, FK_CONTRATO) 
                      VALUES (:DepartamentoTurnado, :NumeroRemesa, :NumeroConsecutivo, :FolioIntegra, :OficioPeticion, :Beneficiario, :FechaPago, :FuenteFinanciamiento, :Documento, :Estatus, :Comentarios, :FK_CONTRATO)";
            $stmt = $this->conn->prepare($query);
    
            $stmt->bindParam(':DepartamentoTurnado', $data['DepartamentoTurnado']);
            $stmt->bindParam(':NumeroRemesa', $data['NumeroRemesa']);
            $stmt->bindParam(':NumeroConsecutivo', $data['NumeroConsecutivo']);
            $stmt->bindParam(':FolioIntegra', $data['FolioIntegra']);
            $stmt->bindParam(':OficioPeticion', $data['OficioPeticion']);
            $stmt->bindParam(':Beneficiario', $data['Beneficiario']);
            $stmt->bindParam(':FechaPago', $data['FechaPago']);
            $stmt->bindParam(':FuenteFinanciamiento', $data['FuenteFinanciamiento']);
            $stmt->bindParam(':Documento', $data['Documento']);
            $stmt->bindParam(':Estatus', $data['Estatus']);
            $stmt->bindParam(':Comentarios', $data['Comentarios']);
            $stmt->bindParam(':FK_CONTRATO', $data['FK_CONTRATO']);
    
            if (!$stmt->execute()) {
                throw new Exception("Error al registrar la remesa.");
            }
    
            // Obtener el último ID insertado
            $lastInsertId = $this->conn->lastInsertId();
    
            // Actualizar el estatus en ConsentradoGeneralTramites
            $updateQuery = "UPDATE ConsentradoGeneralTramites SET Estatus = 'Remesa' WHERE ID_CONTRATO = :FK_CONTRATO";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':FK_CONTRATO', $data['FK_CONTRATO']);
    
            if (!$updateStmt->execute()) {
                throw new Exception("Error al actualizar el estatus en ConsentradoGeneralTramites.");
            }
    
            // Si ambas operaciones son exitosas, hacer commit
            $this->conn->commit();
    
            return $lastInsertId;
        } catch (Exception $e) {
            // Si ocurre un error, hacer rollback y lanzar la excepción
            $this->conn->rollBack();
            throw $e;
        }




        // $query = "INSERT INTO Remesas (DepartamentoTurnado, NumeroRemesa, NumeroConsecutivo, FolioIntegra, OficioPeticion, Beneficiario, FechaPago, FuenteFinanciamiento, Documento, Estatus, Comentarios, FK_CONTRATO) 
        //           VALUES (:DepartamentoTurnado, :NumeroRemesa, :NumeroConsecutivo, :FolioIntegra, :OficioPeticion, :Beneficiario, :FechaPago, :FuenteFinanciamiento, :Documento, :Estatus, :Comentarios, :FK_CONTRATO)";
        // $stmt = $this->conn->prepare($query);

        // $stmt->bindParam(':DepartamentoTurnado', $data['DepartamentoTurnado']);
        // $stmt->bindParam(':NumeroRemesa', $data['NumeroRemesa']);
        // $stmt->bindParam(':NumeroConsecutivo', $data['NumeroConsecutivo']);
        // $stmt->bindParam(':FolioIntegra', $data['FolioIntegra']);
        // $stmt->bindParam(':OficioPeticion', $data['OficioPeticion']);
        // $stmt->bindParam(':Beneficiario', $data['Beneficiario']);
        // $stmt->bindParam(':FechaPago', $data['FechaPago']);
        // $stmt->bindParam(':FuenteFinanciamiento', $data['FuenteFinanciamiento']);
        // $stmt->bindParam(':Documento', $data['Documento']);
        // $stmt->bindParam(':Estatus', $data['Estatus']);
        // $stmt->bindParam(':Comentarios', $data['Comentarios']);
        // $stmt->bindParam(':FK_CONTRATO', $data['FK_CONTRATO']);

        // if ($stmt->execute()) {
        //     //Necesito actualizar el estatus del registro relacionado FK_CONTRATO en la tabla ConsentradoGeneralTramites
        //     // Es decir update ConsentradoGeneralTramites set  Estatus = 'RemesaCreada' where ID_CONTRATO =  FK_CONTRATO
        //     // Ejempo update ConsentradoGeneralTramites set  Estatus = 'RemesaCreada' where ID_CONTRATO =  5
        //     return $this->conn->lastInsertId();
        // } else {
        //     throw new Exception("Error al registrar el cliente.");
        // }
    }
    // Obtener todas las remesas
    public function getAll() {
        $query = "SELECT * FROM Remesas";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    // Actualizar una remesa
    public function update($data) {
        try {
            // Obtener la fecha actual en formato ISO 8601 (YYYY-MM-DD HH:MM:SS)
            date_default_timezone_set('America/Mexico_City');
            $fechaAhora = date("Y-m-d H:i:s");
    
            // Obtener los comentarios anteriores de la remesa
            $querySelect = "SELECT Comentarios FROM Remesas WHERE ID_REMESA = :ID_REMESA";
            $stmtSelect = $this->conn->prepare($querySelect);
            $stmtSelect->bindParam(':ID_REMESA', $data['ID_REMESA']);
            $stmtSelect->execute();
            $comentariosAnteriores = $stmtSelect->fetchColumn();
    
            // Convertir comentarios previos a array JSON
            $comentariosArray = $comentariosAnteriores ? json_decode($comentariosAnteriores, true) : [];
            if (!is_array($comentariosArray)) {
                $comentariosArray = [];
            }
    
            // Agregar nuevo comentario en formato JSON
            $nuevoComentario = [
                "Fecha" => $fechaAhora,
                "Estatus" => $data['Estatus'],
                "Comentario" => $data['Comentarios']
            ];
            $comentariosArray[] = $nuevoComentario;
    
            // Convertir el array nuevamente a JSON
            $comentariosActualizados = json_encode($comentariosArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
            // Actualizar la remesa con los nuevos comentarios acumulativos en JSON
            $queryUpdate = "UPDATE Remesas SET Estatus = :Estatus, Comentarios = :Comentarios WHERE ID_REMESA = :ID_REMESA";
            $stmtUpdate = $this->conn->prepare($queryUpdate);
            $stmtUpdate->bindParam(':Estatus', $data['Estatus']);
            $stmtUpdate->bindParam(':Comentarios', $comentariosActualizados);
            $stmtUpdate->bindParam(':ID_REMESA', $data['ID_REMESA']);
    
            return $stmtUpdate->execute();
            
        } catch (PDOException $e) {
            throw new Exception("Error al actualizar la remesa: " . $e->getMessage());
        }
    }
    // Eliminar una remesa
    public function delete($data) {
        $query = "DELETE FROM Remesas WHERE ID_REMESA = :ID_REMESA";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ID_REMESA', $data['ID_REMESA']);
        $stmt->execute();
        $filasAfectadas = $stmt->rowCount();
        if ($filasAfectadas > 0) {
            return true;
        } else {
            return false;
        }
    }
    //Lista de remesas con tramites para el seguimiento de ordenes de pago
    public function getRemesasWithTramites() {
        $query = "SELECT 
                    cgt.ID_CONTRATO,
                    cgt.Mes,
                    cgt.FechaRecepcion,
                    cgt.TipoTramite,
                    cgt.Dependencia,
                    cgt.Proveedor,
                    cgt.Concepto,
                    cgt.Importe,
                    cgt.Estatus,
                    cgt.Comentarios,
                    cgt.Fondo,
                    cgt.FechaLimite,
                    cgt.FechaTurnado,
                    cgt.FechaTurnadoEntrega,
                    cgt.AnalistaID,
                    r.ID_REMESA,
                    r.DepartamentoTurnado,
                    r.FechaRemesa,
                    r.NumeroRemesa,
                    r.NumeroConsecutivo,
                    r.FolioIntegra,
                    r.OficioPeticion,
                    r.Beneficiario,
                    r.FechaPago,
                    r.FuenteFinanciamiento,
                    r.Documento,
                    r.Estatus AS EstatusRemesa,
                    r.Comentarios AS ComentariosRemesa,
                    r.FK_CONTRATO
                FROM 
                    ConsentradoGeneralTramites cgt
                LEFT JOIN 
                    Remesas r ON cgt.ID_CONTRATO = r.FK_CONTRATO
                    WHERE cgt.Estatus = 'Remesa'
                    OR cgt.Estatus = 'DevueltoOrdenesPago'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();   
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    //Actualizar tramite y remesa
    public function updateTramiteRemesa($data) {
        try {
            date_default_timezone_set('America/Mexico_City'); // Establecer zona horaria
            $fechaActual = date('Y-m-d H:i:s'); // Formato de fecha estándar
    
            // Iniciar transacción
            $this->conn->beginTransaction();
    
            // Obtener los comentarios anteriores de ConsentradoGeneralTramites
            $querySelect1 = "SELECT Comentarios FROM ConsentradoGeneralTramites WHERE ID_CONTRATO = :ID_CONTRATO";
            $stmtSelect1 = $this->conn->prepare($querySelect1);
            $stmtSelect1->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmtSelect1->execute();
            $comentariosAnteriores1 = $stmtSelect1->fetchColumn();
    
            // Obtener los comentarios anteriores de Remesas
            $querySelect2 = "SELECT Comentarios FROM Remesas WHERE FK_CONTRATO = :ID_CONTRATO";
            $stmtSelect2 = $this->conn->prepare($querySelect2);
            $stmtSelect2->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmtSelect2->execute();
            $comentariosAnteriores2 = $stmtSelect2->fetchColumn();
    
            // Crear el nuevo comentario en formato JSON
            $nuevoComentario = [
                "Fecha" => $fechaActual,
                "Estatus" => $data['Estatus'],
                "Comentario" => $data['Comentarios']
            ];
    
            // Acumular comentarios en formato JSON
            $comentariosArray1 = !empty($comentariosAnteriores1) ? json_decode($comentariosAnteriores1, true) : [];
            if (!is_array($comentariosArray1)) {
                $comentariosArray1 = [];
            }
            $comentariosArray1[] = $nuevoComentario;
            $comentariosActualizados1 = json_encode($comentariosArray1, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
            $comentariosArray2 = !empty($comentariosAnteriores2) ? json_decode($comentariosAnteriores2, true) : [];
            if (!is_array($comentariosArray2)) {
                $comentariosArray2 = [];
            }
            $comentariosArray2[] = $nuevoComentario;
            $comentariosActualizados2 = json_encode($comentariosArray2, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
            // Actualizar ConsentradoGeneralTramites
            $query1 = "UPDATE ConsentradoGeneralTramites SET Estatus = :Estatus, Comentarios = :Comentarios WHERE ID_CONTRATO = :ID_CONTRATO";
            $stmt1 = $this->conn->prepare($query1);
            $stmt1->bindParam(':Estatus', $data['Estatus']);
            $stmt1->bindParam(':Comentarios', $comentariosActualizados1);
            $stmt1->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmt1->execute();
    
            // Actualizar Remesas
            $query2 = "UPDATE Remesas SET Estatus = :Estatus, Comentarios = :Comentarios WHERE FK_CONTRATO = :ID_CONTRATO";
            $stmt2 = $this->conn->prepare($query2);
            $stmt2->bindParam(':Estatus', $data['Estatus']);
            $stmt2->bindParam(':Comentarios', $comentariosActualizados2);
            $stmt2->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmt2->execute();
    
            // Confirmar transacción
            $this->conn->commit();
    
            return $stmt1->rowCount() + $stmt2->rowCount();
    
        } catch (PDOException $e) {
            // Revertir transacción en caso de error
            $this->conn->rollBack();
            throw new Exception("Error al actualizar trámite y remesa: " . $e->getMessage());
        }
    }
    
}
?>