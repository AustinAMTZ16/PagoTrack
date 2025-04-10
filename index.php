<?php
    // Declarar como variables globales
    // Incluir el controlador
    include_once 'app/controllers/TramitesController.php';
    include_once 'app/controllers/RemesaController.php';
    include_once 'app/controllers/LoginController.php'; 
    include_once 'app/controllers/KpiController.php';
    include_once 'app/controllers/SuficienciaController.php';
    include_once 'app/controllers/Oficios/OficiosController.php';
    // Instanciamos el controlador
    $controllerTramite = new TramitesController();
    $controllerRemesa = new RemesaController();
    $controllerLogin = new LoginController();
    $controllerKpi = new KpiController();
    $controllerSuficiencia = new SuficienciaController();
    $controllerOficios = new OficiosController();
    //Obtener el método de la solicitud HTTP
    $requestMethod = $_SERVER['REQUEST_METHOD'];

    // Configurar CORS
    header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PATCH, DELETE"); // Permitir métodos HTTP
    header("Access-Control-Allow-Headers: Content-Type"); // Permitir ciertos encabezados

    // TRY: CONTROLA LOS METODOS [GET-POST-PATCH-DALETE] Y EXCEPTION A ERROR 500
    try{
        if (isset($_GET['action'])) {
            $action = $_GET['action'];
            $data = json_decode(file_get_contents("php://input"));
            // Ejecutar el manejo según el método de la solicitud HTTP
            switch ($requestMethod) {
                case 'GET':
                    handleGetRequest($action, $data);
                    break;
                case 'POST':
                    handlePostRequest($action, $data);
                    break;
                case 'PATCH':
                    handlePatchRequest($action, $data);
                    break;
                case 'DELETE':
                    handleDeleteRequest($action, $data);
                    break;
                default:
                    http_response_code(404);
                    echo json_encode([
                        'Message' => 'Solicitud no válida.'
                    ], JSON_UNESCAPED_UNICODE);
                    break;
            }
        } else {
                http_response_code(404);
                echo json_encode([
                    'Message' => 'No hay acción. URL'
                ], JSON_UNESCAPED_UNICODE);
        }

    }catch(Exception $e){
        http_response_code(500);
        echo json_encode([
            'Message' => 'Error interno del servidor. Detalles: ' . $e->getMessage() . ' en línea ' . $e->getLine()
        ], JSON_UNESCAPED_UNICODE);
    }
    // Función para manejar las solicitudes POST
    function handlePostRequest($action, $data)
    {
        switch ($action) {
            case 'createTramite':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerTramite;
                    $respuesta = $controllerTramite->createTramite((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
 
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Tramite registrado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Tramite no registrado.'), JSON_UNESCAPED_UNICODE);
                }
                 exit;
                 break;
            case 'createRemesa':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerRemesa;
                    $respuesta = $controllerRemesa->createRemesa((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }

                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Remesa no registrada.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'loginUser':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerLogin;
                    $respuesta = $controllerLogin->loginUser((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Usuario logueado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Usuario no logueado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'registerUser':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerLogin;
                    $respuesta = $controllerLogin->registerUser((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Usuario registrado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Usuario no registrado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'crearOficio':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerOficios;
                    $respuesta = $controllerOficios->crearOficio((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Oficio creado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Oficio no creado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'getDetalleRemesas':
                // Declarar como global
                global $controllerRemesa;
                $respuesta = $controllerRemesa->getDetalleRemesas((array) $data);
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Listado de detalle de remesas.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron detalle de remesas.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'updateRemesaTramites':
                if(!empty($data)){
                    global $controllerRemesa;
                    $respuesta = $controllerRemesa->updateRemesaTramites((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Trámites actualizados.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron trámites actualizados.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            default:
                http_response_code(404);
                echo json_encode(['Message' => 'Acción POST desconocida.'], JSON_UNESCAPED_UNICODE);
                exit;
                break;
        }
     }

    // Función para manejar las solicitudes GET
    function handleGetRequest($action, $data)
    {
        switch ($action) {
            case 'getTramites':
                // Declarar como global
                global $controllerTramite;
                $respuesta = $controllerTramite->getTramites();
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Listado de tramites.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron tramites.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'getRemesas':
                // Declarar como global
                global $controllerRemesa;
                $respuesta = $controllerRemesa->getRemesas();
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Listado de remesas.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron remesas.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'checkUserExistsUser':   
                // Declarar como global
                global $controllerLogin;
                $respuesta = $controllerLogin->checkUserExistsUser((array) $data);
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Usuario existe.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Usuario no existe.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'getSeguimientoTramites':
                // Declarar como global
                global $controllerTramite;
                $respuesta = $controllerTramite->getSeguimientoTramites();
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Listado de seguimiento de trámites.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron seguimiento de trámites.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;  
            case 'getConteoEstatus':
                // Declarar como global
                global $controllerTramite;
                $respuesta = $controllerTramite->getConteoEstatus();
                if ($respuesta) {
                    http_response_code(200);    
                    echo json_encode(array('message' => 'Listado de conteo de estatus.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron conteo de estatus.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'getReporteEstatusComentarios':
                // Declarar como global
                global $controllerTramite;
                $respuesta = $controllerTramite->getReporteEstatusComentarios();
                if ($respuesta) {
                    http_response_code(200);    
                    echo json_encode(array('message' => 'Listado de reporte de estatus de comentarios.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron reporte de estatus de comentarios.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'getRemesasWithTramites':
                // Declarar como global
                global $controllerRemesa;
                $respuesta = $controllerRemesa->getRemesasWithTramites();
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Listado de remesas con trámites.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron remesas con trámites.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'obtenerKPI':
                // Declarar como global
                global $controllerKpi;
                $respuesta = $controllerKpi->obtenerKPI();
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Data de KPI.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron KPI.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'listarOficios':
                // Declarar como global
                global $controllerOficios;
                $respuesta = $controllerOficios->listarOficios();
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Listado de oficios.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron oficios.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'getListaRemesas':
                // Declarar como global
                global $controllerRemesa;
                $respuesta = $controllerRemesa->getListaRemesas();
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Listado de remesas.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'No se encontraron remesas.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            default:
                http_response_code(404);
                echo json_encode(['Message' => 'Acción GET desconocida.'], JSON_UNESCAPED_UNICODE);
                exit;
                break;
        }
    }
    // Función para manejar las solicitudes PATCH
    function handlePatchRequest($action, $data)
    {
        switch ($action) {
            case 'updateTramite':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerTramite;
                    $respuesta = $controllerTramite->updateTramite((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Tramite modificado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Tramite no modificado.'), JSON_UNESCAPED_UNICODE);
                }
                break;
            case 'updateRemesa':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerRemesa;
                    $respuesta = $controllerRemesa->updateRemesa((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Remesa modificada.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Remesa no modificada.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'updateUser':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerLogin;
                    $respuesta = $controllerLogin->updateUser((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Usuario modificado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Usuario no modificado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'recoverPasswordUser':
                if(!empty($data)){
                    global $controllerLogin;
                    $respuesta = $controllerLogin->recoverPasswordUser((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }   
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Contraseña recuperada.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Contraseña no recuperada.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'updateTramiteRemesa':
                if(!empty($data)){
                    global $controllerRemesa;
                    $respuesta = $controllerRemesa->updateTramiteRemesa((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Tramite y remesa modificados.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Tramite y remesa no modificados.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;  
            case 'actualizarOficio':
                if(!empty($data)){
                    global $controllerOficios;
                    $respuesta = $controllerOficios->actualizarOficio((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Oficio modificado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Oficio no modificado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break; 
            case 'updateTramiteCompleto':
                    if(!empty($data)){
                        global $controllerTramite;
                        $respuesta = $controllerTramite->updateTramiteCompleto((array) $data);
                    }else{
                        echo "Datos no proporcionados";
                        exit;
                    }
                    if ($respuesta) {
                        http_response_code(200);
                        echo json_encode(array('message' => 'Tramite modificados.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                    } else {
                        http_response_code(404);
                        echo json_encode(array('message' => 'Tramite no modificados.'), JSON_UNESCAPED_UNICODE);
                    }
                    exit;
                    break; 
                
            default:
                http_response_code(404);
                echo json_encode(['Message' => 'Acción PATCH desconocida.'], JSON_UNESCAPED_UNICODE);
                break;
        }
    }
    // Función para manejar las solicitudes DELETE
    function handleDeleteRequest($action, $data)
    {
        switch ($action) {
            case 'deleteTramite':
                if(!empty($data)){
                    // Declarar como global
                    global $controllerTramite;
                    $respuesta = $controllerTramite->deleteTramite((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Tramite eliminado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Tramite no eliminado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'deleteRemesa':
                if(!empty($data)){
                    global $controllerRemesa;
                    $respuesta = $controllerRemesa->deleteRemesa((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Remesa eliminada.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Remesa no eliminada.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;
            case 'deleteUser':
                if(!empty($data)){
                    global $controllerLogin;
                    $respuesta = $controllerLogin->deleteUser((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Usuario eliminado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Usuario no eliminado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;  
            case 'eliminarOficio':
                if(!empty($data)){
                    global $controllerOficios;
                    $respuesta = $controllerOficios->eliminarOficio((array) $data);
                }else{
                    echo "Datos no proporcionados";
                    exit;
                }
                if ($respuesta) {
                    http_response_code(200);
                    echo json_encode(array('message' => 'Oficio eliminado.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(array('message' => 'Oficio no eliminado.'), JSON_UNESCAPED_UNICODE);
                }
                exit;
                break;  
            default:
                http_response_code(404);
                echo json_encode(['Message' => 'Acción DELETE desconocida.'], JSON_UNESCAPED_UNICODE);
                break;
        }
    }
?>