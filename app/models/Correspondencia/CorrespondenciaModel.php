<?php
include_once 'app/config/Database.php';

class CorrespondenciaModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = (new Database())->conn;
    }
    // Función para obtener los oficios
    public function listarOficios()
    {
        try {
            // Consulta de totales
            $query = "SELECT * FROM Correspondencia ORDER BY FechaCreacion DESC;";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            // Respuesta de error en caso de fallo
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }
    // Función para crear un oficio
    public function crearOficio($data)
    {
        try {
            date_default_timezone_set('America/Mexico_City'); // Establecer zona horaria de México
            $fechaActual = date('Y-m-d H:i:s'); // Obtener fecha y hora actual en formato MySQL
            // Crear historial de comentarios en formato JSON
            $comentariosArray = [];
            if (!empty($data['Comentarios'])) {
                $comentarioInicial = [
                    "Fecha" => $fechaActual,
                    "Estatus" => $data['Estado'],
                    "Usuario" => $data['UsuarioRegistro'],
                    "Comentario" => $data['Comentarios']
                ];
                $comentariosArray[] = $comentarioInicial;
            }
            $jsonComentarios = json_encode($comentariosArray, JSON_UNESCAPED_UNICODE);


            // Consulta con campos completos
            $query = "INSERT INTO Correspondencia (
                Folio,
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
                FechaRetroactiva,
                Estado,
                UsuarioRegistro,
                Comentarios,
                FechaRecepcion
            ) VALUES (
                :Folio,
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
                :FechaRetroactiva,
                :Estado,
                :UsuarioRegistro,
                :Comentarios,
                :FechaRecepcion
            )";

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':Folio', $data['Folio']);
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
            $stmt->bindParam(':FechaRetroactiva', $data['FechaRetroactiva']);
            $stmt->bindParam(':Estado', $data['Estado']);
            $stmt->bindParam(':UsuarioRegistro', $data['UsuarioRegistro']);
            $stmt->bindParam(':Comentarios', $jsonComentarios);
            $stmt->bindParam(':FechaRecepcion', $data['FechaRecepcion']);
            $stmt->execute();

            return json_encode(["message" => "Oficio creado correctamente"]);
        } catch (PDOException $e) {
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }
    // Función para actualizar un oficio
    public function actualizarOficio($data)
    {
        try {
            date_default_timezone_set('America/Mexico_City'); // Establecer zona horaria de México
            $fechaActual = date('Y-m-d H:i:s'); // Obtener fecha y hora actual en formato MySQL
            // Obtener comentarios actuales si existen
            $queryComentarios = "SELECT Comentarios FROM Correspondencia WHERE ID = :ID";
            $stmtComentarios = $this->conn->prepare($queryComentarios);
            $stmtComentarios->bindValue(':ID', $data['ID']);
            $stmtComentarios->execute();
            $resultComentarios = $stmtComentarios->fetch(PDO::FETCH_ASSOC);

            $comentariosActuales = [];
            if (!empty($resultComentarios['Comentarios'])) {
                $comentariosActuales = json_decode($resultComentarios['Comentarios'], true);
            }

            if (!empty($data['Comentarios'])) {
                $nuevoComentario = [
                    "Fecha" => $fechaActual,
                    "Estatus" => $data['Estado'] ?? '',
                    "Usuario" => $data['UsuarioRegistro'] ?? '',
                    "Comentario" => $data['Comentarios']
                ];
                $comentariosActuales[] = $nuevoComentario;
                $data['Comentarios'] = json_encode($comentariosActuales, JSON_UNESCAPED_UNICODE);
            }

            $camposValidos = [
                'Folio',
                'FechaRecepcion',
                'Solicitante',
                'Dependencia',
                'Departamento',
                'NumeroOficio',
                'tipoOficio',
                'Asunto',
                'Concepto',
                'Monto',
                'FechaVencimiento',
                'Turnado',
                'RespuestaConocimiento',
                'FechaRetroactiva',
                'Estado',
                'UsuarioRegistro',
                'Comentarios',
                'ArchivoScaneado',
                'FechaEntregaAcuse'
            ];

            if (!isset($data['ID'])) {
                http_response_code(400);
                return json_encode(["error" => "Falta el ID del oficio a actualizar"]);
            }

            $setClauses = [];
            $params = [];

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
            $query = "UPDATE Correspondencia SET $setSQL WHERE ID = :ID";

            $stmt = $this->conn->prepare($query);

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
    public function eliminarOficio($data)
    {
        try {
            $query = "DELETE FROM Correspondencia WHERE ID = :ID";
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
    // Función para actualizar un oficio con archivo
    public function actualizarOficioArchivo($data, $archivos)
    {
        try {
            date_default_timezone_set('America/Mexico_City'); // Establecer zona horaria de México
            $fechaActual = date('Y-m-d H:i:s'); // Obtener fecha y hora actual en formato MySQL
            // ✅ 1. Validar y mover archivo si viene
            if (isset($archivos['Archivo']) && $archivos['Archivo']['error'] === UPLOAD_ERR_OK) {
                $archivo = $archivos['Archivo'];

                $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
                $nombreArchivoFinal = $data['ID'] . '.' . $extension;
                $rutaDestino = __DIR__ . '/../../../assets/uploads/Correspondencia/' . $nombreArchivoFinal;

                if (!is_dir(dirname($rutaDestino))) {
                    mkdir(dirname($rutaDestino), 0777, true);
                }

                if (move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
                    $data['ArchivoScaneado'] = $nombreArchivoFinal;
                } else {
                    return json_encode([
                        "error" => "No se pudo mover el archivo al directorio destino."
                    ]);
                }
            }

            // ✅ 2. Acumulación de comentarios
            if (!empty($data['Comentarios'])) {
                // Obtener comentarios actuales
                $stmtComentarios = $this->conn->prepare("SELECT Comentarios FROM Correspondencia WHERE ID = :ID");
                $stmtComentarios->bindValue(":ID", $data['ID']);
                $stmtComentarios->execute();
                $resultado = $stmtComentarios->fetch(PDO::FETCH_ASSOC);

                $comentariosPrevios = [];
                if (!empty($resultado['Comentarios'])) {
                    $comentariosPrevios = json_decode($resultado['Comentarios'], true);
                    if (!is_array($comentariosPrevios)) {
                        $comentariosPrevios = [];
                    }
                }

                // Agregar nuevo comentario al historial
                $comentarioNuevo = [
                    "ID_OFICIO" => $data['ID'],
                    "Fecha" => $fechaActual,
                    "Estatus" => $data['Estado'] ?? "ACTUALIZACIÓN",
                    "Usuario" => $data['UsuarioRegistro'] ?? "N/A",
                    "Comentario" => $data['Comentarios']
                ];
                $comentariosPrevios[] = $comentarioNuevo;
                $data['Comentarios'] = json_encode($comentariosPrevios, JSON_UNESCAPED_UNICODE);
            }

            // ✅ 3. Preparar UPDATE dinámico
            $camposValidos = [
                'Folio',
                'FechaRecepcion',
                'Solicitante',
                'Dependencia',
                'Departamento',
                'NumeroOficio',
                'tipoOficio',
                'Asunto',
                'Concepto',
                'Monto',
                'FechaVencimiento',
                'Turnado',
                'RespuestaConocimiento',
                'FechaRetroactiva',
                'Estado',
                'UsuarioRegistro',
                'Comentarios',
                'ArchivoScaneado',
                'FechaEntregaAcuse'
            ];

            if (!isset($data['ID'])) {
                http_response_code(400);
                return json_encode(["error" => "Falta el ID del oficio a actualizar"]);
            }

            $setClauses = [];
            $params = [];

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
            $query = "UPDATE Correspondencia SET $setSQL WHERE ID = :ID";

            $stmt = $this->conn->prepare($query);
            foreach ($params as $campo => $valor) {
                $stmt->bindValue(":$campo", $valor);
            }
            $stmt->bindValue(":ID", $data['ID']);
            $stmt->execute();

            $rowsAffected = $stmt->rowCount();

            return json_encode([
                "message" => $rowsAffected > 0 ? "Oficio actualizado correctamente" : "No se realizaron cambios",
                "rowsAffected" => $rowsAffected,
                "archivo" => $data['ArchivoScaneado'] ?? null
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }
}
