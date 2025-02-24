<?php
include_once 'app/config/Database.php';

class SuficienciaModel {
    private $conn;

    public function __construct() {
        $this->conn = (new Database())->conn;
    }
    // Función para obtener las Suficiencias
    public function getSuficiencias(){
        try{
            // Consulta de totales
            $query = "SELECT SuficienciasID,PersonaQuienSolicita,Dependencia,CentroGestor,AreaFuncional,NoOficioSolicitud,FechaSolicitud,FechaRecepcion,NoOficioContestacion,Tipo,FechaContestacion,SolpedCompromisoGasto,ServicioSolicitado,FuenteFinanciamiento,PosPrecog,Requisito,Concepto,MontoSuficienciaPresupuestal2024,Conac,Cuenta,Folio,Foja,NoticiaAdministrativa,NoContabilizarConsecutivo,ConsecutivoMes,Mes,Observaciones FROM Suficiencias ORDER BY FechaRecepcion DESC;";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        catch(PDOException $e){
            // Respuesta de error en caso de fallo
            http_response_code(500);
            return json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
        }
    }
}
?>


