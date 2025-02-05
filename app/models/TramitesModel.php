<?php
include_once 'app/config/Database.php';

class TramitesModel {
    private $conn;
    
    public function __construct() {
        $this->conn = (new Database())->conn;
    }

    // Crear un nuevo trámite
    public function create($data) {
        $query = "INSERT INTO ConsentradoGeneralTramites (Mes, TipoTramite, Dependencia, Proveedor, Concepto, Importe, AnalistaTurnado, Estatus, Comentarios, Fondo, FechaLimite) 
                  VALUES (:Mes, :TipoTramite, :Dependencia, :Proveedor, :Concepto, :Importe, :AnalistaTurnado, :Estatus, :Comentarios, :Fondo, :FechaLimite)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':Mes', $data['Mes']);
        $stmt->bindParam(':TipoTramite', $data['TipoTramite']);
        $stmt->bindParam(':Dependencia', $data['Dependencia']);
        $stmt->bindParam(':Proveedor', $data['Proveedor']);
        $stmt->bindParam(':Concepto', $data['Concepto']);
        $stmt->bindParam(':Importe', $data['Importe']);
        $stmt->bindParam(':AnalistaTurnado', $data['AnalistaTurnado']);
        $stmt->bindParam(':Estatus', $data['Estatus']);
        $stmt->bindParam(':Comentarios', $data['Comentarios']);
        $stmt->bindParam(':Fondo', $data['Fondo']);
        $stmt->bindParam(':FechaLimite', $data['FechaLimite']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        } else {
            throw new Exception("Error al registrar el cliente.");
        }
    }

    // Obtener todos los trámites
    public function getAll() {
        $query = "SELECT * FROM ConsentradoGeneralTramites";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Actualizar un trámite
    public function update($data) {
        // Paso 1: Obtener el registro actual
        $querySelect = "SELECT Estatus, Comentarios, AnalistaTurnado FROM ConsentradoGeneralTramites WHERE ID_CONTRATO = :ID_CONTRATO";
        $stmtSelect = $this->conn->prepare($querySelect);
        $stmtSelect->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
        $stmtSelect->execute();
        $currentData = $stmtSelect->fetch(PDO::FETCH_ASSOC);

        if (!$currentData) {
            // Si no se encuentra el registro, retornar falso o lanzar una excepción.
            return false;
        }

        // Paso 2: Usar los valores actuales como predeterminados
        $estatus = isset($data['Estatus']) && $data['Estatus'] !== '' ? $data['Estatus'] : $currentData['Estatus'];
        $comentarios = isset($data['Comentarios']) && $data['Comentarios'] !== '' ? $data['Comentarios'] : $currentData['Comentarios'];
        $analistaTurnado = isset($data['AnalistaTurnado']) && $data['AnalistaTurnado'] !== '' ? $data['AnalistaTurnado'] : $currentData['AnalistaTurnado'];

        // Paso 3: Actualizar el registro
        $queryUpdate = "UPDATE ConsentradoGeneralTramites SET Estatus = :Estatus, Comentarios = :Comentarios, AnalistaTurnado = :AnalistaTurnado WHERE ID_CONTRATO = :ID_CONTRATO";
        $stmtUpdate = $this->conn->prepare($queryUpdate);

        $stmtUpdate->bindParam(':ID_CONTRATO', $data['ID_CONTRATO']);
        $stmtUpdate->bindParam(':Estatus', $estatus);
        $stmtUpdate->bindParam(':Comentarios', $comentarios);
        $stmtUpdate->bindParam(':AnalistaTurnado', $analistaTurnado);

        if ($stmtUpdate->execute()) {
            return true;
        } else {
            return false;
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
}
?>
