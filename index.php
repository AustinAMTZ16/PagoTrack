<?php
    // Declarar como variables globales
    // Incluir el controlador
    include_once 'app/controllers/TramitesController.php';
    include_once 'app/controllers/RemesaController.php';
    include_once 'app/controllers/LoginController.php'; 
    // Instanciamos el controlador
    $controllerTramite = new TramitesController();
    $controllerRemesa = new RemesaController();
    $controllerLogin = new LoginController();

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
                    echo json_encode(array('message' => 'Remesa registrada.', 'data' => $respuesta), JSON_UNESCAPED_UNICODE);
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
            default:
                http_response_code(404);
                echo json_encode(['Message' => 'Acción DELETE desconocida.'], JSON_UNESCAPED_UNICODE);
                break;
        }
    }
?>