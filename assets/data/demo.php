<?php
class OficiosModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = (new Database())->conn;
    }

    // Función para actualizar un oficio con archivo
public function actualizarRegistroOficioArchivo($data, $archivos)
{
    try {
        date_default_timezone_set('America/Mexico_City');
        $fechaActual = date('Y-m-d H:i:s');
        $data['FechaActualizacion'] = $fechaActual;

        // ✅ 1. Validar y mover archivo si viene
        if (isset($archivos['Archivo']) && $archivos['Archivo']['error'] === UPLOAD_ERR_OK) {
            $archivo = $archivos['Archivo'];

            // (Opcional) Validar tipo MIME
            /*
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($archivo['tmp_name']);
            if (!in_array($mime, ['application/pdf'])) {
                return json_encode(["error" => "Solo se permiten archivos PDF."]);
            }
            */

            $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
            $nombreArchivoFinal = $data['ID_RegistroOficios'] . '.' . $extension;
            $rutaDestino = __DIR__ . '/../../../assets/uploads/oficios/' . $nombreArchivoFinal;

            if (!is_dir(dirname($rutaDestino))) {
                mkdir(dirname($rutaDestino), 0777, true);
            }

            if (move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
                $data['ArchivoAdjunto'] = $nombreArchivoFinal;
            } else {
                return json_encode([
                    "error" => "No se pudo mover el archivo al directorio destino."
                ]);
            }
        }

        // ✅ 2. Acumulación de comentarios
        if (!empty($data['Comentario'])) {
            $stmtComentarios = $this->conn->prepare("SELECT Comentario FROM RegistroOficios WHERE ID_RegistroOficios = :ID_RegistroOficios");
            $stmtComentarios->bindValue(":ID_RegistroOficios", $data['ID_RegistroOficios']);
            $stmtComentarios->execute();
            $resultado = $stmtComentarios->fetch(PDO::FETCH_ASSOC);

            $comentariosPrevios = [];
            if (!empty($resultado['Comentario'])) {
                $comentariosPrevios = json_decode($resultado['Comentario'], true);
                if (!is_array($comentariosPrevios)) {
                    $comentariosPrevios = [];
                }
            }

            $comentarioNuevo = [
                "ID_OFICIO" => $data['ID_RegistroOficios'],
                "Fecha" => $fechaActual,
                "Estatus" => $data['Estado'] ?? "ACTUALIZACIÓN",
                "Usuario" => $data['UsuarioRegistro'] ?? "N/A",
                "Comentario" => $data['Comentario']
            ];
            $comentariosPrevios[] = $comentarioNuevo;
            $data['Comentario'] = json_encode($comentariosPrevios, JSON_UNESCAPED_UNICODE);
        }

        // ✅ 3. Preparar UPDATE dinámico
        $camposValidos = [
            'TipoOficio',
            'NumeroOficio',
            'FechaRetroactivo',
            'DirigidoA',
            'Asunto',
            'Institucion',
            'Solicita',
            'FolioInterno',
            'Estado',
            'FechaEntregaDGAnalista',
            'Concepto',
            'RespuestaA',
            'Monto',
            'FechaRecepcionDependencia',
            'FechaEntregaAnalistaOperador',
            'Comentario',
            'ArchivoAdjunto',
            'UsuarioRegistro',
            'FechaActualizacion'
        ];

        if (!isset($data['ID_RegistroOficios'])) {
            http_response_code(400);
            return json_encode(["error" => "Falta el ID del oficio a actualizar"]);
        }

        $setClauses = [];
        $params = [];

        foreach ($camposValidos as $campo) {
            if (array_key_exists($campo, $data)) {
                $setClauses[] = "$campo = :$campo";
                $params[$campo] = $data[$campo];
            }
        }

        if (empty($setClauses)) {
            return json_encode(["message" => "No se proporcionaron campos para actualizar"]);
        }

        $setSQL = implode(", ", $setClauses);
        $query = "UPDATE RegistroOficios SET $setSQL WHERE ID_RegistroOficios = :ID_RegistroOficios";

        $stmt = $this->conn->prepare($query);

        foreach ($params as $campo => $valor) {
            $stmt->bindValue(":$campo", $valor);
        }

        $stmt->bindValue(":ID_RegistroOficios", $data['ID_RegistroOficios']);
        $stmt->execute();

        $rowsAffected = $stmt->rowCount();

        return json_encode([
            "message" => $rowsAffected > 0 ? "Oficio actualizado correctamente" : "No se realizaron cambios",
            "rowsAffected" => $rowsAffected,
            "archivo" => $data['ArchivoAdjunto'] ?? null
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
    }
}
