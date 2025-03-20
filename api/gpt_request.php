<?php
require '../vendor/autoload.php';

use GuzzleHttp\Client;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();
$apiKey = $_ENV['OPENAI_API_KEY'] ?? null;

if (!$apiKey) {
    echo json_encode(['error' => 'Clave API no encontrada']);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$datos = $input['datos'] ?? [];

if (empty($datos)) {
    echo json_encode(['error' => 'No hay datos para analizar']);
    exit;
}

// Procesamiento de datos
$tramitesHoy = $datos['tramites_hoy'] ?? [];
$tramitesVencidos = $datos['tramites_vencidos'] ?? [];
$tramitesFuturos = $datos['tramites_futuros'] ?? [];
$conteoEstatus = $datos['conteo_estatus'] ?? [];

// Funciones de ayuda
function calcularImporteTotal($tramites) {
    return array_reduce($tramites, function($total, $tramite) {
        return $total + floatval(str_replace(['$', ','], '', $tramite['Importe']));
    }, 0);
}

function extraerComentarios($tramites) {
    return array_filter(array_map(function($t) {
        return isset($t['Comentarios']) ? trim($t['Comentarios']) : null;
    }, $tramites));
}






// Construcción del prompt
$prompt = "
Genera un reporte diario con el siguiente formato y estilo, utilizando etiquetas HTML para que la visualización en el navegador sea atractiva:

Reporte Diario de Trámites – [FECHA ACTUAL]
Temperatura en Puebla: [TEMPERATURA] °C

Trámites que vencen hoy:

Total de trámites: [N]
IDs involucrados: [ID], [ID]
Distribución por estatus: [ESTATUS], [ESTATUS]
Comentarios clave: [COMENTARIOS], [COMENTARIOS]
Dependencias: [DEPENDENCIA], [DEPENDENCIA]
Proveedores: [PROVEEDOR], [PROVEEDOR]
Conceptos: [CONCEPTO], [CONCEPTO]
Importes: [IMPORTE], [IMPORTE]
Fechas de recepción: [FECHA_RECEPCION], [FECHA_RECEPCION]
Fechas importantes de vencimiento: [FECHA_VENCIMIENTO_IMPORTANTE], [FECHA_VENCIMIENTO_IMPORTANTE]
Trámites vencidos (atrasados):

Total de trámites: [N]
IDs involucrados: [ID], [ID]
Distribución por estatus: [ESTATUS], [ESTATUS]
Comentarios clave: [COMENTARIOS], [COMENTARIOS]
Dependencias: [DEPENDENCIA], [DEPENDENCIA]
Proveedores: [PROVEEDOR], [PROVEEDOR]
Conceptos: [CONCEPTO], [CONCEPTO]
Importes: [IMPORTE], [IMPORTE]
Fechas de recepción: [FECHA_RECEPCION], [FECHA_RECEPCION]
Fechas importantes de vencimiento: [FECHA_VENCIMIENTO_IMPORTANTE], [FECHA_VENCIMIENTO_IMPORTANTE]
Trámites futuros a vencer:

Total de trámites: [N]
IDs involucrados: [ID], [ID]
Distribución por estatus: [ESTATUS], [ESTATUS]
Comentarios clave: [COMENTARIOS], [COMENTARIOS]
Dependencias: [DEPENDENCIA], [DEPENDENCIA]
Proveedores: [PROVEEDOR], [PROVEEDOR]
Conceptos: [CONCEPTO], [CONCEPTO]
Importes: [IMPORTE], [IMPORTE]
Fechas de recepción: [FECHA_RECEPCION], [FECHA_RECEPCION]
Fechas importantes de vencimiento: [FECHA_VENCIMIENTO_IMPORTANTE], [FECHA_VENCIMIENTO_IMPORTANTE]
Análisis de trámites devueltos:

IDs involucrados: [ID], [ID]
Comentarios recurrentes: [COMENTARIOS_DEVUELTOS]
Errores comunes: [ERRORES_COMUNES]
Dependencias involucradas
Proveedores involucrados
Propuestas de mejora:

[Mínimo 3 propuestas concretas de mejora]
Conteo total de trámites:

[ESTADISTICAS_ESTATUS]
Conclusión:

[CONCLUSION]
Dato curioso del día: [DATOS_CURIOSOS_ALEATORIO]

Instrucciones para la generación del reporte:

Mantén un tono profesional pero amigable
Incluye IDs específicos de trámites problemáticos y fechas importantes de vencimiento
Analiza en profundidad los comentarios proporcionados
Presenta gráficas textuales claramente (por ejemplo: 📊 75% │░░░░░░░░░░░░░░)
Usa la fecha actual en formato día/mes/año
Datos disponibles para análisis:    
1. Trámites que vencen hoy (" . count($tramitesHoy) . "):
    " . json_encode($tramitesHoy) . "    
2. Trámites vencidos (" . count($tramitesVencidos) . "):
    " . json_encode($tramitesVencidos) . "    
3. Trámites futuros (" . count($tramitesFuturos) . "):
    " . json_encode($tramitesFuturos) . "    
4. Conteo de estatus:
    " . json_encode($conteoEstatus) . "    
5. Comentarios relevantes:
    - Hoy: " . implode(' | ', extraerComentarios($tramitesHoy)) . "
    - Vencidos: " . implode(' | ', extraerComentarios($tramitesVencidos)) . "
    - Futuros: " . implode(' | ', extraerComentarios($tramitesFuturos)) . "    
Moneda: MXN
Ubicación: Puebla, México
Sistema utilizado: PagoTrack
Utiliza etiquetas HTML para una visualización clara y atractiva en navegador
";

try {
    $client = new Client();
    $response = $client->post('https://api.openai.com/v1/chat/completions', [
        'headers' => [
            'Authorization' => "Bearer $apiKey",
            'Content-Type' => 'application/json'
        ],
        'json' => [
            'model' => 'gpt-4o',
            'messages' => [
                [
                    'role' => 'system', 
                    'content' => "Eres un analista financiero experto en gestión de trámites. 
                                  Genera reportes estructurados con insights accionables. 
                                  Analiza profundamente los comentarios y datos técnicos.
                                  Usa formato creativo con emojis y secciones claras."
                ],
                [
                    'role' => 'user', 
                    'content' => $prompt
                ]
            ],
            'temperature' => 0.7
        ]
    ]);

    $responseData = json_decode($response->getBody()->getContents(), true);
    echo json_encode($responseData);

} catch (Exception $e) {
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
?>