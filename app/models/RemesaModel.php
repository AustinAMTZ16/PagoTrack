<?php
include_once 'app/config/Database.php';

class RemesaModel {
    private $conn;

    public function __construct() {
        $this->conn = (new Database())->conn;
    }

    // Crear una nueva remesa
    public function create($data) {
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

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        } else {
            throw new Exception("Error al registrar el cliente.");
        }
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
        $query = "UPDATE Remesas SET Estatus = :Estatus, Comentarios = :Comentarios WHERE ID_REMESA = :ID_REMESA";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':Estatus', $data['Estatus']);
        $stmt->bindParam(':Comentarios', $data['Comentarios']);
        $stmt->bindParam(':ID_REMESA', $data['ID_REMESA']);
        if($stmt->execute()) {
            return true;
        } else {
            return false;
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
}
?>