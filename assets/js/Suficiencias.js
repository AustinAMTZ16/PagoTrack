// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    // Verifica si el botón existe antes de agregar el listener
    const downloadButton = document.getElementById("downloadExcelSuficiencias");
    if (downloadButton) {
        downloadButton.addEventListener("click", exportToExcel);
    }
    // Función para generar y descargar el archivo Excel
    function exportToExcel() {
        const table = document.querySelector("#tableSuficiencias"); // Selecciona la tabla por su ID
        if (table) { // Verifica si la tabla existe
            const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" }); // Convierte la tabla en un libro de Excel
            XLSX.writeFile(wb, "datos_oficios.xlsx"); // Descarga el archivo Excel con el nombre especificado
        } else {
            console.error("La tabla no existe en el DOM.");
        }
    }
    getSuficiencias();
});

function getSuficiencias() {
    fetch(URL_BASE + 'getSuficiencias', {
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
        console.log('Respuesta de la API:', result.data);
        llenarTablaSuficiencias(result.data);
        
    })
    .catch(error => {
        console.error('Error al obtener las remesas con trámites:', error.message);
    });
}

function llenarTablaSuficiencias(data) {
    const tableId = "tableSuficiencias";

    // Verificar si DataTable ya está inicializado y destruirlo para actualizar
    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().clear().destroy();
    }

    // Formatear el importe a moneda
    const formatoMoneda = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });

    // Inicializar DataTable con los datos obtenidos
    $(`#${tableId}`).DataTable({
        data: data,
        columns: [
            { data: "SuficienciasID" },
            { data: "PersonaQuienSolicita" },
            { data: "Dependencia" },
            { data: "CentroGestor" },
            { data: "AreaFuncional" },
            { data: "NoOficioSolicitud" },
            { data: "FechaSolicitud" },
            { data: "FechaRecepcion" },
            { data: "NoOficioContestacion" },
            { data: "Tipo" },
            { data: "FechaContestacion" },
            { data: "SolpedCompromisoGasto" },
            { data: "ServicioSolicitado" },
            { data: "FuenteFinanciamiento" },
            { data: "PosPrecog" },
            { data: "Requisito" },
            { data: "Concepto" },
            { 
                data: "MontoSuficienciaPresupuestal2024",
                render: function (data) {
                    return data ? formatoMoneda.format(data) : "$0.00";
                }
            },
            { data: "Conac" },
            { data: "Cuenta" },
            { data: "Folio" },
            { data: "Foja" },
            { data: "NoticiaAdministrativa" },
            { data: "NoContabilizarConsecutivo" },
            { data: "ConsecutivoMes" },
            { data: "Mes" },
            { data: "Observaciones" },
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    if (data.Estatus === "Creado") {
                        botones += `<button class="btn btn-primary" onclick="turnarTramite(${data.ID_CONTRATO})">Turnar</button> `;
                    }
                    if (data.Estatus === "VoBO") {
                        botones += `<button class="btn btn-success" onclick="aprobarTramite(${data.ID_CONTRATO})">VoBO</button> `;
                    }
                    if (data.Estatus === "RegistradoSAP") {
                        botones += `<button class="btn btn-info" onclick="createRemesa(${data.ID_CONTRATO})">Crear Remesa</button> `;
                    }
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && usuario.RolUser === "Admin") {
                        botones += `<button class="btn btn-danger" onclick="eliminarTramite(${data.ID_CONTRATO})">Eliminar</button>`;
                    }
                    return botones;
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
            },
            aria: {
                sortAscending: ": Activar para ordenar la columna de manera ascendente",
                sortDescending: ": Activar para ordenar la columna de manera descendente"
            }
        },
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        order: [[0, "DESC"]],
    });
}


