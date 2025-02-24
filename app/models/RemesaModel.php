<?php
include_once 'app/config/Database.php';

class RemesaModel {
    private $conn;
    public function __construct() {
        $this->conn = (new Database())->conn;
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
            // Obtener la fecha actual en formato dd-mm-yy
            $fechaAhora = date("d-m-y");

            // Obtener los comentarios anteriores de la remesa
            $querySelect = "SELECT Comentarios FROM Remesas WHERE ID_REMESA = :ID_REMESA";
            $stmtSelect = $this->conn->prepare($querySelect);
            $stmtSelect->bindParam(':ID_REMESA', $data['ID_REMESA']);
            $stmtSelect->execute();
            $comentariosAnteriores = $stmtSelect->fetchColumn();

            // Concatenar los comentarios con la fecha actual
            $nuevoComentario = "\nFecha: $fechaAhora\n" . $data['Comentarios'];
            $comentariosActualizados = trim($comentariosAnteriores . $nuevoComentario);

            // Actualizar la remesa con los nuevos comentarios concatenados
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
                    cgt.AnalistaTurnado,
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
    //Actualizar trámite y remesa
    public function updateTramiteRemesa($data) {
        try {
            // Obtener la fecha actual en formato dd-mm-yy
            $fechaAhora = date("d-m-y");
    
            // Iniciar una transacción para garantizar consistencia
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
    
            // Concatenar los comentarios con la fecha actual
            $nuevoComentario = "\nFecha: $fechaAhora\n" . $data['Comentarios'];
            $comentariosActualizados1 = trim($comentariosAnteriores1 . $nuevoComentario);
            $comentariosActualizados2 = trim($comentariosAnteriores2 . $nuevoComentario);
    
            // Primera actualización en ConsentradoGeneralTramites
            $query1 = "UPDATE ConsentradoGeneralTramites SET Estatus = :Estatus, Comentarios = :Comentarios WHERE ID_CONTRATO = :ID_CONTRATO";
            $stmt1 = $this->conn->prepare($query1);
            $stmt1->bindParam(':Estatus', $data['Estatus']);
            $stmt1->bindParam(':Comentarios', $comentariosActualizados1);
            $stmt1->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmt1->execute();
    
            // Segunda actualización en Remesas
            $query2 = "UPDATE Remesas SET Estatus = :Estatus, Comentarios = :Comentarios WHERE FK_CONTRATO = :ID_CONTRATO";
            $stmt2 = $this->conn->prepare($query2);
            $stmt2->bindParam(':Estatus', $data['Estatus']);
            $stmt2->bindParam(':Comentarios', $comentariosActualizados2);
            $stmt2->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
            $stmt2->execute();
    
            // Confirmar la transacción si ambas consultas son exitosas
            $this->conn->commit();
    
            // Retornar la cantidad de filas afectadas en ambas tablas
            return $stmt1->rowCount() + $stmt2->rowCount();
    
        } catch (PDOException $e) {
            // En caso de error, revertir la transacción
            $this->conn->rollBack();
            throw new Exception("Error al actualizar trámite y remesa: " . $e->getMessage());
        }
    }
}
?>