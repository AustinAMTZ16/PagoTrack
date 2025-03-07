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
    
        try {
            //EN CASO DE QUE EL ESTATUS SEA CREADO SERIA LA LOGICA ACTUAL EN CASO DE SER TURNADO SOLO DEBE AGREGAR LA FECHA ACTUAL AL CAMPO FechaTurnado
            if ($data['Estatus'] === 'Turnado') {
                $query = "INSERT INTO ConsentradoGeneralTramites 
                (Mes, TipoTramite, Dependencia, Proveedor, Concepto, Importe, Estatus, Fondo, FechaLimite, AnalistaID, FechaTurnado) 
                VALUES (:Mes, :TipoTramite, :Dependencia, :Proveedor, :Concepto, :Importe, :Estatus, :Fondo, :FechaLimite, :AnalistaID, :FechaTurnado)";
            }else{
                // 🔹 Paso 1: Insertar el registro SIN comentarios
                $query = "INSERT INTO ConsentradoGeneralTramites 
                      (Mes, TipoTramite, Dependencia, Proveedor, Concepto, Importe, Estatus, Fondo, FechaLimite, AnalistaID) 
                      VALUES (:Mes, :TipoTramite, :Dependencia, :Proveedor, :Concepto, :Importe, :Estatus, :Fondo, :FechaLimite, :AnalistaID)";
            }
            $stmt = $this->conn->prepare($query);
    
            $stmt->bindParam(':Mes', $data['Mes']);
            $stmt->bindParam(':TipoTramite', $data['TipoTramite']);
            $stmt->bindParam(':Dependencia', $data['Dependencia']);
            $stmt->bindParam(':Proveedor', $data['Proveedor']);
            $stmt->bindParam(':Concepto', $data['Concepto']);
            $stmt->bindParam(':Importe', $data['Importe']);
            $stmt->bindParam(':Estatus', $data['Estatus']);
            $stmt->bindParam(':Fondo', $data['Fondo']);
            $stmt->bindParam(':FechaLimite', $data['FechaLimite']);
            $stmt->bindParam(':AnalistaID', $data['AnalistaID']);
            if ($data['Estatus'] === 'Turnado') {
                $stmt->bindParam(':FechaTurnado', $fechaActual);
            }
    
            if (!$stmt->execute()) {
                throw new Exception("Error al registrar el trámite.");
            }
    
            // 🔹 Paso 2: Obtener el ID generado
            $idContrato = $this->conn->lastInsertId();
    
            // 🔹 Paso 3: Construir el comentario inicial en JSON
            $comentariosArray = [];
            if (!empty($data['Comentarios'])) {
                $comentarioInicial = [
                    "ID_CONTRATO" => $idContrato,
                    "Fecha" => $fechaActual,
                    "Estatus" => $data['Estatus'],
                    "Comentario" => $data['Comentarios']
                ];
                $comentariosArray[] = $comentarioInicial;
            }
    
            // Convertir a JSON el array de comentarios
            $comentariosJSON = json_encode($comentariosArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
            // 🔹 Paso 4: Actualizar el registro con los comentarios
            $queryUpdate = "UPDATE ConsentradoGeneralTramites SET Comentarios = :Comentarios WHERE ID_CONTRATO = :ID_CONTRATO";
            $stmtUpdate = $this->conn->prepare($queryUpdate);
            $stmtUpdate->bindParam(':Comentarios', $comentariosJSON);
            $stmtUpdate->bindParam(':ID_CONTRATO', $idContrato, PDO::PARAM_INT);
    
            if (!$stmtUpdate->execute()) {
                throw new Exception("Error al actualizar los comentarios del trámite.");
            }
    
            return $idContrato; // Retornar el ID del contrato creado
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
        // Definir zona horaria de México
        date_default_timezone_set('America/Mexico_City'); 
        // Obtener la fecha y hora actual en formato MySQL
        $fechaActual = date('Y-m-d H:i:s'); 
    
        try {
            // 🔹 Paso 1: Obtener el registro actual desde la base de datos
            $querySelect = "SELECT Estatus, Comentarios, AnalistaID FROM ConsentradoGeneralTramites WHERE ID_CONTRATO = :ID_CONTRATO";
            $stmtSelect = $this->conn->prepare($querySelect);
            $stmtSelect->bindParam(':ID_CONTRATO', $data['ID_CONTRATO'], PDO::PARAM_INT);
            $stmtSelect->execute();
            $currentData = $stmtSelect->fetch(PDO::FETCH_ASSOC);
    
            // Si el registro no existe, retornar falso
            if (!$currentData) {
                return false; 
            }
    
            // 🔹 Paso 2: Determinar los valores a actualizar
            $estatus = !empty($data['Estatus']) ? $data['Estatus'] : $currentData['Estatus'];
            $AnalistaID = !empty($data['AnalistaID']) ? $data['AnalistaID'] : $currentData['AnalistaID'];
    
            // 🔹 Paso 3: Construcción del nuevo comentario en formato JSON
            $nuevoComentario = !empty($data['Comentarios']) ? json_encode([
                "ID_CONTRATO" => $data['ID_CONTRATO'],
                "Fecha" => $fechaActual,
                "Estatus" => $data['Estatus'],
                "Comentario" => $data['Comentarios']
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : '';
    
            // 🔹 Paso 4: Acumulación de comentarios manteniendo el formato JSON
            $comentariosArray = !empty($currentData['Comentarios']) ? json_decode($currentData['Comentarios'], true) : [];
            
            // Si hay un nuevo comentario, agregarlo al array
            if (!empty($nuevoComentario)) {
                $comentariosArray[] = json_decode($nuevoComentario, true);
            }
    
            // Convertir el array nuevamente a JSON
            $comentariosActualizados = json_encode($comentariosArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
            // 🔹 Paso 5: Construcción de la consulta SQL dinámica
            $queryUpdate = "UPDATE ConsentradoGeneralTramites 
                            SET Estatus = :Estatus, 
                                Comentarios = :Comentarios,  
                                AnalistaID = :AnalistaID";
    
            // Si el estatus es "Devuelto", agregar los campos adicionales a la consulta
            if ($estatus === 'Devuelto') {
                $queryUpdate .= ", FechaDevuelto = :FechaDevuelto";
            } if ($estatus === 'Turnado') {
                $queryUpdate .= ", FechaTurnado = :FechaTurnado";
            } if ($estatus === 'RegistradoSAP' || $estatus === 'JuntasAuxiliares' || $estatus === 'Inspectoria') {
                $queryUpdate .= ", FechaTurnadoEntrega = :FechaTurnadoEntrega,
                                RemesaNumero = :RemesaNumero,
                                DocSAP = :DocSAP,
                                IntegraSAP = :IntegraSAP";
            }
    
            $queryUpdate .= " WHERE ID_CONTRATO = :ID_CONTRATO";
    
            // 🔹 Paso 6: Preparación y ejecución de la consulta SQL
            $stmtUpdate = $this->conn->prepare($queryUpdate);
    
            $stmtUpdate->bindParam(':ID_CONTRATO', $data['ID_CONTRATO'], PDO::PARAM_INT);
            $stmtUpdate->bindParam(':Estatus', $estatus);
            $stmtUpdate->bindParam(':Comentarios', $comentariosActualizados);
            $stmtUpdate->bindParam(':AnalistaID', $AnalistaID);
    
            // Enlazar parámetros adicionales solo si el estatus es "Devuelto"
            if ($estatus === 'Devuelto') {
                $stmtUpdate->bindParam(':FechaDevuelto', $fechaActual, PDO::PARAM_STR);
            } if ($estatus === 'Turnado') {
                $stmtUpdate->bindParam(':FechaTurnado', $fechaActual, PDO::PARAM_STR);
            } if ($estatus === 'RegistradoSAP') {
                $stmtUpdate->bindParam(':FechaTurnadoEntrega', $fechaActual, PDO::PARAM_STR);
                $stmtUpdate->bindParam(':RemesaNumero', $data['RemesaNumero']);
                $stmtUpdate->bindParam(':DocSAP', $data['DocSAP']);
                $stmtUpdate->bindParam(':IntegraSAP', $data['IntegraSAP']);
            }if ($estatus === 'JuntasAuxiliares' || $estatus === 'Inspectoria') {
                $stmtUpdate->bindParam(':FechaTurnadoEntrega', $fechaActual, PDO::PARAM_STR);
                $stmtUpdate->bindParam(':RemesaNumero', $data['RemesaNumero']);
                $stmtUpdate->bindParam(':DocSAP', $data['DocSAP']);
                $stmtUpdate->bindParam(':IntegraSAP', $data['IntegraSAP']);
            }
    
            // Ejecutar la actualización y devolver el resultado
            return $stmtUpdate->execute();
    
        } catch (PDOException $e) {
            // Capturar y lanzar excepciones en caso de error
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
    // Actualizar un trámite completo
    public function updateTramiteCompleto($data) {
        date_default_timezone_set('America/Mexico_City'); // Establecer zona horaria de México
        $fechaActual = date('Y-m-d H:i:s'); // Obtener fecha y hora actual en formato MySQL
    
        // Validar que el ID del contrato esté presente
        if (!isset($data['ID_CONTRATO']) || empty($data['ID_CONTRATO'])) {
            return ["error" => "ID_CONTRATO es obligatorio"];
        }
    
        $id_contrato = $data['ID_CONTRATO'];
    
        // 1️⃣ Consultar el registro actual antes de actualizar
        $query = "SELECT * FROM ConsentradoGeneralTramites WHERE ID_CONTRATO = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["error" => "Error en la preparación de la consulta: " . implode(" - ", $this->conn->errorInfo())];
        }
        $stmt->bindParam(1, $id_contrato, PDO::PARAM_INT);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if (!$resultado) {
            return ["error" => "No se encontró el trámite con ID $id_contrato"];
        }
    
        // 2️⃣ Manejo de comentarios
        $comentariosArray = [];
    
        if (!empty($resultado['Comentarios'])) {
            $comentariosArray = json_decode($resultado['Comentarios'], true);
            if (!is_array($comentariosArray)) {
                $comentariosArray = [];
            }
        }
    
        // Agregar nuevo comentario si `MotivoModificacion` está presente
        if (!empty($data['MotivoModificacion'])) {
            $nuevoComentario = [
                "ID_CONTRATO" => $resultado['ID_CONTRATO'],
                "Fecha" => $fechaActual,
                "Estatus" => $resultado['Estatus'], // Tomar el estatus actual del trámite
                "Comentario" => $data['MotivoModificacion']
            ];
            $comentariosArray[] = $nuevoComentario;
        }
    
        // Convertir el array de comentarios nuevamente a JSON
        $comentariosActualizados = json_encode($comentariosArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
        // 3️⃣ Verificar qué datos han cambiado
        $campos_actualizar = [];
        $parametros = [];
    
        foreach ($data as $campo => $valor) {
            if ($campo !== "ID_CONTRATO" && $campo !== "MotivoModificacion") { // Se omite MotivoModificacion
                $valor_actual = isset($resultado[$campo]) ? $resultado[$campo] : null;
    
                if (is_numeric($valor)) {
                    $valor = (float)$valor;
                    $valor_actual = is_numeric($valor_actual) ? (float)$valor_actual : $valor_actual;
                } elseif (is_string($valor)) {
                    $valor = trim($valor);
                    $valor_actual = is_string($valor_actual) ? trim($valor_actual) : $valor_actual;
                } elseif ($valor === null) {
                    $valor = '';
                    $valor_actual = ($valor_actual === null) ? '' : $valor_actual;
                }
    
                if ((is_string($valor) && strcmp($valor, $valor_actual) !== 0) || $valor !== $valor_actual) {
                    $campos_actualizar[] = "$campo = ?";
                    $parametros[] = [
                        "valor" => $valor,
                        "tipo" => is_int($valor) ? PDO::PARAM_INT : PDO::PARAM_STR
                    ];
                }
            }
        }
    
        // 4️⃣ Asegurar que `Comentarios` se actualiza con los nuevos comentarios
        $campos_actualizar[] = "Comentarios = ?";
        $parametros[] = [
            "valor" => $comentariosActualizados,
            "tipo" => PDO::PARAM_STR
        ];
    
        // 5️⃣ Si hay cambios, construir y ejecutar la consulta UPDATE
        if (!empty($campos_actualizar)) {
            $sql_update = "UPDATE ConsentradoGeneralTramites SET " . implode(", ", $campos_actualizar) . " WHERE ID_CONTRATO = ?";
            $stmt_update = $this->conn->prepare($sql_update);
            if (!$stmt_update) {
                return ["error" => "Error en la preparación de la consulta: " . implode(" - ", $this->conn->errorInfo())];
            }
    
            // Binding de parámetros
            foreach ($parametros as $index => $param) {
                $stmt_update->bindValue($index + 1, $param["valor"], $param["tipo"]);
            }
    
            // Agregar ID_CONTRATO al final
            $stmt_update->bindValue(count($parametros) + 1, $id_contrato, PDO::PARAM_INT);
    
            if ($stmt_update->execute()) {
                // 🔄 6️⃣ Volver a consultar el registro actualizado
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(1, $id_contrato, PDO::PARAM_INT);
                $stmt->execute();
                $registro_actualizado = $stmt->fetch(PDO::FETCH_ASSOC);
    
                return [
                    $registro_actualizado
                ];
            } else {
                return ["error" => "Error al actualizar: " . implode(" - ", $stmt_update->errorInfo())];
            }
        } else {
            return ["message" => "No hubo cambios en el trámite."];
        }
    }
    
}
?>
