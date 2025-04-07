<?php
include_once 'app/config/Database.php';

class OficiosModel {
    private $conn;

    public function __construct() {
        $this->conn = (new Database())->conn;
    }
    // Función para obtener los oficios
    public function listarOficios(){
        try{
            // Consulta de totales
            $query = "SELECT * FROM Oficios ORDER BY FechaCreacion DESC;";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        }
        catch(PDOException $e){
            // Respuesta de error en caso de fallo
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }
    // Función para crear un oficio
    public function crearOficio($data){
        try{
            // Consulta con campos completos
            $query = "INSERT INTO Oficios (
                Folio,
                FechaRecepcion,
                Solicitante,
                Dependencia,
                Departamento,
                NumeroOficio,
                tipoOficio,
                Asunto,
                Concepto,
                Monto,
                FechaVencimiento,
                Turnado,
                RespuestaConocimiento,
                FechaRetroactiva,
                Estado,
                UsuarioRegistro,
                Comentarios
            ) VALUES (
                :Folio,
                :FechaRecepcion,
                :Solicitante,
                :Dependencia,
                :Departamento,
                :NumeroOficio,
                :tipoOficio,
                :Asunto,
                :Concepto,
                :Monto,
                :FechaVencimiento,
                :Turnado,
                :RespuestaConocimiento,
                :FechaRetroactiva,
                :Estado,
                :UsuarioRegistro,
                :Comentarios
            )";
    
            $stmt = $this->conn->prepare($query);
    
            $stmt->bindParam(':Folio', $data['Folio']);
            $stmt->bindParam(':FechaRecepcion', $data['FechaRecepcion']);
            $stmt->bindParam(':Solicitante', $data['Solicitante']);
            $stmt->bindParam(':Dependencia', $data['Dependencia']);
            $stmt->bindParam(':Departamento', $data['Departamento']);
            $stmt->bindParam(':NumeroOficio', $data['NumeroOficio']);
            $stmt->bindParam(':tipoOficio', $data['tipoOficio']);
            $stmt->bindParam(':Asunto', $data['Asunto']);
            $stmt->bindParam(':Concepto', $data['Concepto']);
            $stmt->bindParam(':Monto', $data['Monto']);
            $stmt->bindParam(':FechaVencimiento', $data['FechaVencimiento']);
            $stmt->bindParam(':Turnado', $data['Turnado']);
            $stmt->bindParam(':RespuestaConocimiento', $data['RespuestaConocimiento']);
            $stmt->bindParam(':FechaRetroactiva', $data['FechaRetroactiva']);
            $stmt->bindParam(':Estado', $data['Estado']);
            $stmt->bindParam(':UsuarioRegistro', $data['UsuarioRegistro']);
            $stmt->bindParam(':Comentarios', $data['Comentarios']);
    
            $stmt->execute();
    
            return json_encode(["message" => "Oficio creado correctamente"]);
        } catch(PDOException $e){
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }
    // Función para actualizar un oficio
    public function actualizarOficio($data) {
        try {
            // Lista de columnas válidas en la tabla
            $camposValidos = [
                'Folio', 'FechaRecepcion', 'Solicitante', 'Dependencia', 'Departamento',
                'NumeroOficio', 'tipoOficio', 'Asunto', 'Concepto', 'Monto', 'FechaVencimiento',
                'Turnado', 'RespuestaConocimiento', 'FechaRetroactiva', 'Estado',
                'UsuarioRegistro', 'Comentarios'
            ];
    
            // Verificar que venga el ID
            if (!isset($data['ID'])) {
                http_response_code(400);
                return json_encode(["error" => "Falta el ID del oficio a actualizar"]);
            }
    
            $setClauses = [];
            $params = [];
    
            // Construir cláusulas dinámicamente
            foreach ($camposValidos as $campo) {
                if (isset($data[$campo])) {
                    $setClauses[] = "$campo = :$campo";
                    $params[$campo] = $data[$campo];
                }
            }
    
            if (empty($setClauses)) {
                return json_encode(["message" => "No se proporcionaron campos para actualizar"]);
            }
    
            $setSQL = implode(", ", $setClauses);
    
            $query = "UPDATE Oficios SET $setSQL WHERE ID = :ID";
    
            $stmt = $this->conn->prepare($query);
    
            // Enlazar campos dinámicamente
            foreach ($params as $campo => $valor) {
                $stmt->bindValue(":$campo", $valor);
            }
    
            $stmt->bindValue(":ID", $data['ID']);
            $stmt->execute();
    
            $rowsAffected = $stmt->rowCount();
    
            if ($rowsAffected > 0) {
                return json_encode(["message" => "Oficio actualizado correctamente", "rowsAffected" => $rowsAffected]);
            } else {
                return json_encode(["message" => "No se realizaron cambios", "rowsAffected" => 0]);
            }
    
        } catch (PDOException $e) {
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }
    // Función para eliminar un oficio
    public function eliminarOficio($data) {
        try {
            $query = "DELETE FROM Oficios WHERE ID = :ID";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':ID', $data['ID']);   
            $stmt->execute();
            $rowsAffected = $stmt->rowCount();
            if ($rowsAffected > 0) {
                return json_encode(["message" => "Oficio eliminado correctamente", "rowsAffected" => $rowsAffected]);
            } else {
                return json_encode(["message" => "No se realizó ninguna eliminación", "rowsAffected" => 0]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }    
}
?>


