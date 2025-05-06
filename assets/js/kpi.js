// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Declaración global para almacenar datos parseados
let parsedData = {};
// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerKPI();
});
// Funcion para obtener los KPI'S
function obtenerKPI() {
    fetch(URL_BASE + 'obtenerKPI', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(async (response) => {
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    })
    .then(result => {
        //console.log('Respuesta de la API:', result);

        // Verificar si 'result.data' es una cadena JSON válida antes de intentar parsearla
        try {
            const data = JSON.parse(result.data);
            parsedData = JSON.parse(result.data);
            //console.log('Datos parseados:', parsedData);

            // Verificar si 'totales' y 'tramites' existen en 'data'
            if (data) {
                // Rellenar los totales
                document.getElementById('total_hoy').textContent = data.total_hoy || 0;
                document.getElementById('total_vencidos').textContent = data.total_vencidos || 0;
                document.getElementById('total_futuros').textContent = data.total_futuros || 0;

                // Convertir la lista en un objeto clave-valor para un acceso más fácil
                // Verifica si `conteo_estatus` es un array antes de iterarlo
                if (Array.isArray(data.conteo_estatus)) {
                    const conteo_estatus = {};
                    
                    data.conteo_estatus.forEach(item => {
                        conteo_estatus[item.Estatus] = item.total_registros;
                    });

                    // Asignar los valores a los elementos HTML
                    document.getElementById('estatus_creado').textContent = conteo_estatus.Creado || 0;
                    document.getElementById('estatus_turnado').textContent = conteo_estatus.Turnado || 0;
                    document.getElementById('estatus_devuelto').textContent = conteo_estatus.Devuelto || 0;
                    document.getElementById('estatus_rechazado').textContent = conteo_estatus.Rechazado || 0;
                    document.getElementById('estatus_juntasAuxiliares').textContent = conteo_estatus.JuntasAuxiliares || 0;
                    document.getElementById('estatus_inspectorias').textContent = conteo_estatus.Inspectoria || 0;
                    document.getElementById('estatus_registradoSAP').textContent = conteo_estatus.RegistradoSAP || 0;
                    document.getElementById('estatus_remesa').textContent = conteo_estatus.Remesa || 0;
                    document.getElementById('estatus_revisionRemesa').textContent = conteo_estatus.RevisionRemesa || 0;
                    document.getElementById('estatus_remesaAprobada').textContent = conteo_estatus.RemesaAprobada || 0;
                    document.getElementById('estatus_ordenesPago').textContent = conteo_estatus.OrdenesPago || 0;
                    document.getElementById('estatus_devueltoOrdenesPago').textContent = conteo_estatus.DevueltoOrdenesPago || 0;
                    document.getElementById('estatus_cancelado').textContent = conteo_estatus.Cancelado || 0;
                    document.getElementById('estatus_procesando').textContent = conteo_estatus.Procesando || 0;
                } else {
                    console.error("conteo_estatus no es un array:", data.conteo_estatus);
                }


                // Rellenar las tablas
                rellenarTabla('tabla_hoy', data.tramites_hoy || []);
                rellenarTabla('tabla_vencidos', data.tramites_vencidos || []);
                rellenarTabla('tabla_futuros', data.tramites_futuros || []);
            } else {
                console.error('Error: Datos incompletos, faltan propiedades "totales" o "tramites".');
            }
        } catch (error) {
            console.error('Error al parsear los datos de la API:', error);
        }
    })
    .catch(error => {
        console.error('Error al obtener las remesas con trámites:', error.message);
    });
}
// Funcion para rellenar la tabla de trámites
function rellenarTabla(tableId, tramites) {
    if (!Array.isArray(tramites)) {
        console.error("Error: Los datos no son un array válido.", tramites);
        alert("Error: Datos inválidos.");
        return;
    }

    // Verificar si la tabla existe en el DOM
    if ($(`#${tableId}`).length === 0) {
        console.error(`Error: No se encontró la tabla con ID ${tableId}`);
        return;
    }

    // Verificar si la tabla ya está inicializada y destruirla antes de actualizar
    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().clear().destroy();
        $(`#${tableId}`).find("thead").empty();
        $(`#${tableId}`).find("tbody").empty();
    }

    // Restaurar el encabezado
    let theadHTML = `
        <tr>
            <th>ID</th>
            <th>Tipo Tramite</th>
            <th>Estatus</th>
            <th>Fecha Recepción</th>
            <th>Fecha Límite</th>
            <th>Dependencia</th>
            <th>Beneficiario</th>
            <th>Concepto</th>
            <th>Importe</th>
            <th>Analista</th>
            <th>Comentarios</th>
        </tr>`;
    $(`#${tableId} thead`).html(theadHTML);
    
    // Formato de moneda
    const formatoMoneda = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });

    // Inicializar DataTable con los datos
    $(`#${tableId}`).DataTable({
        data: tramites,
        columns: [
            { data: "ID_CONTRATO", visible: true }, 
            {data: "TipoTramite"},
            { data: "Estatus" },
            { data: "FechaRecepcion" },
            { data: "FechaLimite" },
            { data: "Dependencia" },
            { data: "Proveedor" },
            { data: "Concepto" },
            { data: "Importe", 
                render: function (data) {
                    return formatoMoneda.format(data);
                }
             },
            { data: null, render: function (data) { return `${data.NombreUser} ${data.ApellidoUser}`; } },
            { 
                data: "Comentarios",
                render: function (data) {
                    var comentarioEscapado = encodeURIComponent(data || "Sin comentario");
                    return `<button class="btn btn-info" onclick="mostrarComentario('${comentarioEscapado}')">Ver Comentario</button>`;
                }
            }
        ],
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        language: {
            processing: "Procesando...",
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "No hay datos disponibles en la tabla",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            }
        },
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        order: [[0, "DESC"]],
    });
}
//Funcion para mostrar el comentario en el modal
function mostrarComentario(comentario) {
    // Decodificar el comentario
    var comentarioDecoded = decodeURIComponent(comentario);

    try {
        // Intentar convertir el comentario a formato JSON con indentación
        var comentarioJson = JSON.parse(comentarioDecoded);

        // Si existe el campo "Comentario", aplicar saltos de línea automáticos
        if (comentarioJson.Comentario) {
            comentarioJson.Comentario = comentarioJson.Comentario.replace(/(.{50})/g, "$1\n");
        }

        // Convertir nuevamente a JSON con formato
        comentarioDecoded = JSON.stringify(comentarioJson, null, 4);
    } catch (e) {
        console.error('El comentario no es un JSON válido:', e);
    }

    // Mostrar el comentario en el modal con formato adecuado
    $('#comentarioModal .modal-body').html('<pre style="white-space: pre-wrap; word-wrap: break-word;">' + comentarioDecoded + '</pre>');
    $('#comentarioModal').modal('show');
}
// Generar resumen con ChatGPT
document.addEventListener("DOMContentLoaded", function () {
    const btnResumen = document.getElementById("generarResumen");

    if (!btnResumen) {
        console.error("❌ Error: No se encontró el botón 'generarResumen' en el DOM.");
        return;
    }

    btnResumen.addEventListener("click", function () {
        if (!parsedData || Object.keys(parsedData).length === 0) {
            alert("No hay datos disponibles para generar el resumen.");
            return;
        }

        fetch(URL_B + 'api/gpt_request.php', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ datos: parsedData })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById("resumenGPT").innerHTML = `<b>Error:</b> ${data.error}`;
            } else {
                document.getElementById("resumenGPT").innerHTML = `<b>Resumen Corporativo:</b><br>${data.choices[0].message.content}`;
            }
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
            document.getElementById("resumenGPT").innerHTML = "<b>Error al generar el resumen.</b>";
        });
    });
});
