/**
 * Índice:
 * 1. Definición de variables globales
 * 2. Evento DOMContentLoaded
 *    2.1. Obtener referencias a elementos del DOM
 *    2.2. Cargar trámites y trámites turnados
 *    2.3. Agregar eventos a elementos interactivos
 * 3. Funciones principales
 *    3.1. getTramites - Obtener trámites desde la API
 *    3.2. getTramitesTurnados - Obtener trámites turnados desde la API
 *    3.3. actualizarTablaTramites - Renderizar la tabla de trámites
 *    3.4. actualizarTablaTurnados - Renderizar la tabla de trámites turnados
 *    3.5. exportToExcel - Exportar trámites a un archivo Excel
 */
// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Variable global para almacenar la lista trámites
let tramitesArray = [];
let nombreAnalista = "";

let tramitesHoy = [];
let tramitesVencidos = [];
let tramitesFuturos = [];


// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    // Referencia al Select de Estado
    const estadoSelect = document.getElementById("estadoSelect");
    // Referencia a la tabla de trámites
    const tableTramitesJS = document.getElementById('tableTramites');
    // Referencia a la tabla de trámites turnados
    const tableTurnadosJS = document.getElementById('tableTurnados');
    // Referencia a la tabla de seguimiento de trámites por analista
    const tramitesTableJS = document.getElementById('tramitesTable');
    // Referencia al botón de generar resumen iA
    const btnResumen = document.getElementById("generarResumen");
    // Referencia al botón de limpiar filtros
    const btnLimpiar = document.getElementById("btn-limpiar");
    // Referencia al botón de filtrar trámites
    const btnFiltrar = document.getElementById("btn-filtrar");
    // Obtener la lista de trámites
    if (tableTramitesJS) {
        getTramites();
    }
    // Obtener la lista de trámites turnados
    if (tableTurnadosJS) {
        getTramitesTurnados();
    }
    // Agregar el evento al select de estado
    if (estadoSelect) {
        const filtrosIniciales = {
            ID_CONTRATO: '',
            estado: '',
            mes: '',
            tipoTramite: '',
            analista: '',
            dependencia: '',
            proveedor: '',
            concepto: '',
            importe: '',
            remesa: '',
            integracionSAP: '',
            docSAP: '',
            numeroTramite: '',
            fechaRecepcion: '',
            fechaVencimiento: ''
        };
        filtrarTramites(filtrosIniciales);

        /* 
        // Listener para capturar el cambio de selección
        estadoSelect.addEventListener("change", function () {
            const selectedValue = estadoSelect.value; // Obtiene el valor seleccionado
            if (selectedValue) {
                // Llama a la función con el valor seleccionado
            } else if (selectedValue === 'Todos') {
                //console.log('Todos');
                //actualizarTablaTramites(tramitesArray, "tableTramites"); 
                filtrarTramitesOperador();
            }
        }); */
    }
    // Valida si existe la tabla de seguimiento de trámites por analista
    if (tramitesTableJS) {
        getSeguimientoTramites();
    }
    // Verifica si el botón existe antes de agregar el listener
    const downloadButton = document.getElementById("downloadExcelTramites");
    if (downloadButton) {
        downloadButton.addEventListener("click", exportToExcel);
    }
    // Generar resumen con ChatGPT
    if (btnResumen) {
        btnResumen.addEventListener("click", function () {
            let tramites = [];
            let dataTable = $('#tableTramites').DataTable(); // Acceder a DataTable

            // Obtener TODAS las filas del DataTable, sin importar la paginación
            let allRows = dataTable.rows().data();

            allRows.each(function (row) { // Iterar sobre cada fila
                tramites.push({
                    mes: row.Mes,
                    fechaRecepcion: row.FechaRecepcion,
                    fechaLimite: row.FechaLimite,
                    tipoTramite: row.TipoTramite,
                    institucion: row.Dependencia,
                    proveedor: row.Proveedor,
                    importe: row.Importe,
                    analista: `${row.NombreUser} ${row.ApellidoUser}`,
                    estatus: row.Estatus
                });
            });

            if (tramites.length === 0) {
                alert("No hay datos en la tabla para analizar.");
                return;
            }

            // Enviar los datos al servidor PHP para análisis con ChatGPT
            fetch(URL_B + 'api/gpt_request.php', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tramites })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        document.getElementById("resumenGPT").innerHTML = `<b>Error:</b> ${data.error}`;
                    } else {
                        document.getElementById("resumenGPT").innerHTML = `<b>Resumen GPT:</b><br>${data.choices[0].message.content}`;
                    }
                })
                .catch(error => {
                    console.error("Error en la solicitud:", error);
                    document.getElementById("resumenGPT").innerHTML = "<b>Error al generar el resumen.</b>";
                });
        });
    }
    // Limpiar filtros
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function () {
            document.querySelectorAll('.filtro-select, .filtro-input, .filtro-date').forEach(element => {
                if (element.tagName === 'SELECT') {
                    element.value = 'Todos';
                } else {
                    element.value = '';
                }
            });
            console.clear();
            //console.log('Filtros limpiados');
            const filtrosIniciales = {
                ID_CONTRATO: '',
                estado: '',
                mes: '',
                tipoTramite: '',
                analista: '',
                dependencia: '',
                proveedor: '',
                concepto: '',
                importe: '',
                remesa: '',
                integracionSAP: '',
                docSAP: '',
                numeroTramite: '',
                fechaRecepcion: '',
                fechaVencimiento: ''
            };
            filtrarTramites(filtrosIniciales);
        });
    }
    // Filtrar trámites
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function () {
            // Definir todos los filtros con su tipo
            const filterConfig = [
                { id: 'ID_CONTRATO', type: 'text' },
                { id: 'estadoSelect', type: 'select' },
                { id: 'mesSelect', type: 'select' },
                { id: 'tipoTramiteSelect', type: 'select' },
                { id: 'analistaSelect', type: 'select' },
                { id: 'dependenciaSelect', type: 'select' },
                { id: 'proveedorSelect', type: 'text' },
                { id: 'conceptoSelect', type: 'text' },
                { id: 'importeSelect', type: 'number' },
                { id: 'remesaSelect', type: 'text' },
                { id: 'integracionSAPSelect', type: 'text' },
                { id: 'docSAPSelect', type: 'text' },
                { id: 'numeroTramiteSelect', type: 'text' },
                { id: 'fechaRecepcionSelect', type: 'date' },
                { id: 'fechaVencimientoSelect', type: 'date' }
            ];

            // Objeto para almacenar los filtros aplicados
            const appliedFilters = {};

            filterConfig.forEach(config => {
                const element = document.getElementById(config.id);
                let value = element.value.trim();

                // Manejar diferentes tipos de inputs
                if (element.tagName === 'SELECT') {
                    if (value !== 'Todos') {
                        appliedFilters[config.id.replace('Select', '')] = value;
                    }
                } else {
                    if (value !== '' && !(config.type === 'number' && isNaN(value))) {
                        if (config.type === 'number') value = Number(value);
                        appliedFilters[config.id.replace('Select', '')] = value;
                    }
                }
            });

            //console.log('Filtros aplicados:', appliedFilters);
            filtrarTramites(appliedFilters);
        });
    }
});
// Función para obtener la lista de trámites
function getTramites() {
    fetch(URL_BASE + 'getTramites', {
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
            if (result.data && Array.isArray(result.data)) {
                // Extraer el array dentro de 'data'
                tramitesArray = result.data;
                //console.log('Trámites:', tramitesArray);
                // console.log('Array de trámites:', tramitesArray);
                //actualizarTablaTramites(tramitesArray, 'tableTramites'); // Pasar el array a la función
                filtrarTramitesOperador();
            } else {
                console.error('No se encontró un array en la propiedad "data".');
            }
        })
        .catch(error => {
            console.error('Error al obtener los trámites:', error.message);
            alert(`Error al obtener los trámites: ${error.message}`);
        });
}
//funcion para obtener el seguimiento de trámites
function getSeguimientoTramites() {
    fetch(URL_BASE + 'getSeguimientoTramites', {
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
            console.log('Result:', result);
            // Renderizar la tabla
            renderTable(result.data);
        })
        .catch(error => {
            console.error('Error al obtener el seguimiento de trámites:', error.message);
        });
}
//funcion para obtener el conteo de estatus
function getConteoEstatus() {
    fetch(URL_BASE + 'getConteoEstatus', {
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
            //console.log('Result:', result);
            // Renderizar la tabla
            /* renderTable(result.data); */
        })
        .catch(error => {
            console.error('Error al obtener el conteo de estatus:', error.message);
        });
}
//funcion para obtener el reporte de estatus de comentarios
function getReporteEstatusComentarios() {
    fetch(URL_BASE + 'getReporteEstatusComentarios', {
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
            //console.log('Result:', result);
            // Renderizar la tabla
            /* renderTable(result.data); */
        })
        .catch(error => {
            console.error('Error al obtener el reporte de estatus de comentarios:', error.message);
        });
}
//funcion para obtener la lista de trámites turnados
function getTramitesTurnados() {
    fetch(URL_BASE + 'getTramites', {
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
            if (result.data && Array.isArray(result.data)) {
                // Extraer el array dentro de 'data'
                tramitesArray = result.data;
                // console.log('Array de trámites:', tramitesArray);
                estadoTurnado();
            } else {
                console.error('No se encontró un array en la propiedad "data".');
            }
        })
        .catch(error => {
            console.error('Error al obtener los trámites:', error.message);
            alert(`Error al obtener los trámites: ${error.message}`);
        });
}
// Función para actualizar la tabla de trámites
function actualizarTablaTramites(data, tableId) {
    if (!Array.isArray(data)) {
        console.error("Error: La respuesta no es un array válido.", data);
        alert("Error: Datos inválidos.");
        return;
    }
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
    // Inicializar DataTable con datos dinámicos
    $(`#${tableId}`).DataTable({
        data: data,
        columns: [
            { data: "ID_CONTRATO", visible: true }, // Campo oculto
            { data: "Mes" },
            {
                data: "FechaRecepcion",
                render: function (data) {
                    if (!data) return "";
                    const [fecha] = data.split(" ");
                    const [año, mes, dia] = fecha.split("-");
                    return `${dia}-${mes}-${año}`; // Formato DD-MM-YYYY
                }
            },
            {
                data: "FechaLimite",
                render: function (data) {
                    if (!data) return "";
                    const [fecha] = data.split(" ");
                    const [año, mes, dia] = fecha.split("-");
                    return `${dia}-${mes}-${año}`; // Formato DD-MM-YYYY
                }
            },
            { data: "TipoTramite" },
            { data: "Dependencia" },
            { data: "Proveedor" },
            { data: "Concepto" },
            {
                data: "Importe",
                render: function (data) {
                    return data ? formatoMoneda.format(data) : "$0.00";
                }
            },
            {
                data: null,
                render: function (data) {
                    nombreAnalista = `${data.NombreUser} ${data.ApellidoUser}`;
                    return nombreAnalista;
                }
            },
            { data: "Estatus" },
            { data: "Fondo" },
            { data: "RemesaNumero" },
            { data: "DocSAP" },
            { data: "IntegraSAP" },
            { data: "NoTramite" },
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    if (data.Estatus === "Creado") {
                        botones += `<button class="btn btn-primary toggleButton" onclick="turnarTramite(${data.ID_CONTRATO})">Turnar</button> `;
                    }
                    if (data.Estatus === "VoBO") {
                        botones += `<button class="btn btn-primary toggleButton" onclick="aprobarTramite(${data.ID_CONTRATO})">VoBO</button> `;
                    }
                    if (data.Estatus === "RegistradoSAP") {
                        botones += `<button class="btn btn-primary toggleButton" onclick="createRemesa(${data.ID_CONTRATO})">Asignar Remesa</button> `;
                    }
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && (usuario.RolUser === "Admin" || usuario.RolUser === "Operador") || usuario.RolUser === "KPI") {
                        botones += `<button class="btn btn-primary toggleButton" onclick="modificarTramite(${data.ID_CONTRATO})">Modificar</button>`;
                    }
                    if (usuario && usuario.RolUser === "Admin") {
                        botones += `<button class="btn btn-primary toggleButton" onclick="eliminarTramite(${data.ID_CONTRATO})">Eliminar</button>`;
                    }
                    botones += `<button class="btn btn-primary toggleButton" onclick="generarQR(${data.ID_CONTRATO}, '${nombreAnalista}', '${data.NoTramite}')">QR</button>`;
                    botones += `<button class="btn btn-primary toggleButton" onclick="window.location.href = 'TramiteDetalle.html?id=${data.ID_CONTRATO}'">Detalle</button>`;

                    return botones;
                }
            },
            {
                data: "Comentarios",
                render: function (data) {
                    // Asegurarse de que los caracteres especiales no rompan el código
                    var comentarioEscapado = encodeURIComponent(data);
                    return `<button class="btn btn-primary toggleButton" onclick="mostrarComentario('${comentarioEscapado}')">Ver Comentario</button>`;
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
            infoPostFix: "",
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
        pageLength: 5, // Número de filas por página
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "Todos"]],
        responsive: true,
        order: [[0, "DESC"]],
    });
}
// Función para actualizar la tabla de trámites turnados
function actualizarTablaTurnados(data, tableId) {
    if (!Array.isArray(data)) {
        console.error("Error: La respuesta no es un array válido.", data);
        alert("Error: Datos inválidos.");
        return;
    }
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
    // Inicializar DataTable con datos dinámicos
    $(`#${tableId}`).DataTable({
        data: data,
        columns: [
            { data: "ID_CONTRATO", visible: true }, // Campo oculto
            { data: "Mes" },
            {
                data: "FechaRecepcion",
                render: function (data) {
                    // Mostrar la fecha y la hora de la fechaLimite
                    return data ? new Date(data).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + new Date(data).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";
                }
            },
            {
                data: "FechaLimite",
                render: function (data) {
                    //mostrar solo la fecha de la fechaLimite 
                    return data ? new Date(data).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : "";
                }
            },
            { data: "TipoTramite" },
            { data: "Dependencia" },
            { data: "Proveedor" },
            { data: "Concepto" },
            {
                data: "Importe",
                render: function (data) {
                    return data ? formatoMoneda.format(data) : "$0.00";
                }
            },
            {
                data: null,
                render: function (data) {
                    nombreAnalista = `${data.NombreUser} ${data.ApellidoUser}`;
                    return nombreAnalista;
                }
            },
            { data: "Estatus" },
            { data: "Fondo" },
            { data: "RemesaNumero" },
            { data: "DocSAP" },
            { data: "IntegraSAP" },
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    if (data.Estatus === "Devuelto" || data.Estatus === "Turnado" || data.Estatus === "Observaciones") {
                        botones += `<button class="btn btn-primary toggleButton" onclick="editarTramite('${data.ID_CONTRATO}', '${data.Proveedor}', '${data.Concepto}', '${data.Importe}', '${data.FechaLimite}', '${data.FechaRecepcion}', '${data.Dependencia}', '${data.NombreUser} ${data.ApellidoUser}')">Actualizar Estado</button> `;
                    }
                    botones += `<button class="btn btn-primary toggleButton" onclick="generarQR(${data.ID_CONTRATO}, '${nombreAnalista}', '${data.NoTramite}')">QR</button>`;
                    return botones;
                }
            },
            {
                data: "Comentarios",
                render: function (data) {
                    // Asegurarse de que los caracteres especiales no rompan el código
                    var comentarioEscapado = encodeURIComponent(data);
                    return `<button class="btn btn-primary toggleButton" onclick="mostrarComentario('${comentarioEscapado}')">Ver Comentario</button>`;
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
            infoPostFix: "",
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
        pageLength: 10, // Número de filas por página
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        order: [[0, "DESC"]],
    });
}
// Filtrar trámites por estado
function filtrarTramites(filtros) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const CorreoUser = usuario.CorreoUser;

    let base = tramitesArray;

    // 🔹 Filtro por operador
    if (CorreoUser === 'gonzalo.ochoa@ayuntamientopuebla.gob.mx') {
        base = base.filter(tramite => ['OCO', 'OPO', 'Obra'].includes(tramite.TipoTramite));
    } else if (CorreoUser === 'juan.garcia@ayuntamientopuebla.gob.mx') {
        base = base.filter(tramite => !['OCO', 'OPO', 'Obra'].includes(tramite.TipoTramite));
    }

    // 🔹 Mapeo de filtros con campos reales
    const mapaCampos = {
        ID_CONTRATO: 'ID_CONTRATO',
        estado: 'Estatus',
        mes: 'Mes',
        tipoTramite: 'TipoTramite',
        analista: 'AnalistaID',
        dependencia: 'Dependencia',
        proveedor: 'Proveedor',
        concepto: 'Concepto',
        importe: 'Importe',
        remesa: 'RemesaNumero',
        integracionSAP: 'IntegraSAP',
        docSAP: 'DocSAP',
        numeroTramite: 'NoTramite',
        fechaRecepcion: 'FechaRecepcion',
        fechaVencimiento: 'FechaLimite'
    };

    // 🔹 Campos con comparación exacta
    const camposExactos = [
        'estado',
        'tipoTramite',
        'analista',
        'ID_CONTRATO',
        'mes',
        'remesa',
        'integracionSAP',
        'docSAP',
        'numeroTramite',
        'fechaRecepcion',
        'fechaVencimiento'
    ];

    // 🔹 Aplicar filtros uno por uno
    const filtrados = base.filter(tramite => {
        for (let campo in filtros) {
            const valorFiltro = filtros[campo];
            if (valorFiltro === '' || valorFiltro === 'Todos') continue; // Saltar filtros vacíos

            const campoReal = mapaCampos[campo];
            const valorTramite = tramite[campoReal];

            // Comparaciones específicas
            if (campo === 'importe') {
                if (parseFloat(valorTramite) !== parseFloat(valorFiltro)) return false;
            } else if (campo === 'fechaRecepcion' || campo === 'fechaVencimiento') {
                const fechaBase = valorTramite ? valorTramite.split(' ')[0] : '';
                if (fechaBase !== valorFiltro) return false;
            } else if (typeof valorTramite === 'string') {
                if (camposExactos.includes(campo)) {
                    if (valorTramite !== valorFiltro) return false;
                } else {
                    if (!valorTramite.toLowerCase().includes(valorFiltro.toLowerCase())) return false;
                }
            } else {
                if (valorTramite != valorFiltro) return false;
            }
        }

        return true;
    });

    // 🔹 Actualizar tabla
    actualizarTablaTramites(filtrados, 'tableTramites');

    // 🔹 Si existe tabla turnados actualizarla
    if ($.fn.DataTable.isDataTable(`#tableTurnados`)) {
        actualizarTablaTurnados(filtrados, 'tableTurnados');
    }
}
//Filtrar trámites por AnalistaTurnado
function estadoTurnado() {
    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Obtener el id del usuario
    const idUser = usuario.InicioSesionID;
    // console.log('Usuario:', idUser);
    // Filtrar los trámites por el AnalistaTurnado
    const tramitesTurnados = tramitesArray.filter(tramite => tramite.AnalistaID === idUser);
    // En caso de que el usuario.RolUser sea igual a 'Admin' debera mostrar todos los trámites
    if (usuario.RolUser === 'Admin') {
        // Funcion para obtener KPI'S 
        obtenerSemaforoTurnado(tramitesArray);
        // Actualizar la tabla de trámites
        actualizarTablaTurnados(tramitesArray, 'tableTurnados');
    } else {
        // Funcion para obtener KPI'S 
        obtenerSemaforoTurnado(tramitesTurnados);
        // Filtrar los trámites por el AnalistaTurnado
        actualizarTablaTurnados(tramitesTurnados, 'tableTurnados');
    }
}
//Filtrar trámites por tipo de operador
function filtrarTramitesOperador() {
    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Obtener el id del usuario
    const idUser = usuario.InicioSesionID;
    const CorreoUser = usuario.CorreoUser;
    if (CorreoUser === 'gonzalo.ochoa@ayuntamientopuebla.gob.mx') {
        // Filtrar los trámites por TipoTramite
        const tramitesOperador = tramitesArray.filter(tramite => tramite.TipoTramite === 'OCO' || tramite.TipoTramite === 'Obra' || tramite.TipoTramite === 'OPO');
        // Actualizar la tabla de trámites
        //console.log('Trámites de ObraG:', tramitesOperador);
        actualizarTablaTramites(tramitesOperador, 'tableTramites');
    } else if (CorreoUser === 'juan.garcia@ayuntamientopuebla.gob.mx') {
        // Filtrar los trámites excepto los de tipo Obra
        const tramitesOperador = tramitesArray.filter(tramite => tramite.TipoTramite !== 'Obra' && tramite.TipoTramite !== 'OCO' && tramite.TipoTramite !== 'OPO');
        //console.log('Trámites de ObraJ:', tramitesOperador);
        // Actualizar la tabla de trámites
        actualizarTablaTramites(tramitesOperador, 'tableTramites');
    } else {
        // Mostrar todos los trámites
        const tramitesOperador = tramitesArray;
        //console.log('Trámites de ObraA:', tramitesOperador);
        // Actualizar la tabla de trámites
        actualizarTablaTramites(tramitesOperador, 'tableTramites');
    }
}
// Turnar tramite por id
function turnarTramite(id) {
    // console.log('Turnar tramite:', id);
    window.location.href = `turnarTramite.html?id=${id}`;
}
// Editar tramite por id
function editarTramite(id, proveedor, concepto, importe, fechaLimite, fechaRecepcion, dependencia, nombreUser) {
    // Formatea las fechas eliminando la hora
    const formatoFecha = (fecha) => fecha.split(' ')[0];

    const fechaLimiteFormateada = formatoFecha(fechaLimite);
    const fechaRecepcionFormateada = formatoFecha(fechaRecepcion);

    //console.log('Editar tramite:', id, proveedor, concepto, importe, fechaLimite, fechaRecepcion, dependencia);

    window.location.href = `turnadoUpdateTramite.html?id=${id}&proveedor=${encodeURIComponent(proveedor)}&concepto=${encodeURIComponent(concepto)}&importe=${importe}&fechaLimite=${fechaLimiteFormateada}&fechaRecepcion=${fechaRecepcionFormateada}&dependencia=${encodeURIComponent(dependencia)}&nombreUser=${encodeURIComponent(nombreUser)}`;
}
// Eliminar tramite por id
function eliminarTramite(id) {
    //console.log('Eliminar tramite:', id);

    try {
        // Confirmación del usuario antes de eliminar
        const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este registro?");
        if (!confirmDelete) {
            return; // Si el usuario cancela, salimos de la función
        }
        const data = {
            ID_CONTRATO: id
        };
        // Realizar la solicitud para eliminar el registro
        fetch(URL_BASE + 'deleteTramite', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
                }
                return await response.json();
            })
            .then(result => {
                alert("Registro eliminado correctamente.");
                // Recargar o actualizar la tabla para reflejar los cambios
                getTramites();
            })
            .catch(error => {
                console.error('Error al eliminar el trámite:', error.message);
            });
    } catch (error) {
        console.error("Error al eliminar el registro:", error);
        alert("Ocurrió un error al intentar eliminar el registro.");
    }


}
// Crear Remesa por id
function createRemesa(id) {
    // console.log('Crear Remesa:', id);
    window.location.href = `createRemesa.html?id=${id}`;
}
// Reporte de estatus de comentarios
function renderTable(data) {
    const tableId = "tramitesTable"; // ID de la tabla
    const table = document.getElementById(tableId);
    const tableHead = table.querySelector("thead tr");
    const tableBody = table.querySelector("tbody");

    // Limpiar la tabla antes de insertar nuevos datos
    tableHead.innerHTML = "<th>InicioSesionID</th>";
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='99'>No hay datos disponibles</td></tr>";
        return;
    }

    // Obtener los nombres de los tipos de trámites dinámicamente
    const columns = Object.keys(data[0]).filter(key => key !== "InicioSesionID");

    // Generar encabezados de tabla dinámicos
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        tableHead.appendChild(th);
    });

    // Insertar filas con los datos
    data.forEach(row => {
        const tr = document.createElement("tr");

        // Celda del analista
        const tdAnalista = document.createElement("td");
        tdAnalista.textContent = row.InicioSesionID;
        tr.appendChild(tdAnalista);

        // Celdas de conteo de trámites
        columns.forEach(col => {
            const td = document.createElement("td");

            if (col === "Total") {
                // Hacer el Total clickeable
                const link = document.createElement("a");
                link.href = `#`;
                link.textContent = row[col] || 0;
                link.style.cursor = "pointer";
                link.style.color = "#007bff";
                link.style.textDecoration = "underline";

                // Agregar evento click para mostrar detalles
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    showTramitesDetails(row.InicioSesionID);
                });

                td.appendChild(link);
            } else {
                td.textContent = row[col] || 0;
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    // Destruir DataTable si ya estaba inicializado
    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().clear().destroy();
    }

    // Inicializar DataTable con configuración en español
    $(`#${tableId}`).DataTable({
        language: {
            processing: "Procesando...",
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            infoPostFix: "",
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
        pageLength: 20, // Número de filas por página
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        order: [[11, "DESC"]],
    });


}
// Mostrar comentario en modal
function mostrarComentario(comentario) {
    const comentarioDecoded = decodeURIComponent(comentario);
    let htmlContenido = '';

    try {
        const comentarios = JSON.parse(comentarioDecoded);

        if (Array.isArray(comentarios)) {
            htmlContenido = comentarios.map(entry => `
                <div class="comentario-card mb-3 p-3 border rounded shadow-sm">
                    <div><strong># Contrato:</strong> ${entry.ID_CONTRATO || 'N/A'}</div>
                    <div><strong>Fecha:</strong> ${entry.Fecha || 'N/A'}</div>
                    <div><strong>Estatus:</strong> ${entry.Estatus || 'N/A'}</div>
                    <div><strong>Modificado_Por:</strong> ${entry.Modificado_Por || 'N/A'}</div>
                    <div><strong>Comentario:</strong><br><div class="comentario-texto">${entry.Comentario || 'Sin comentario'}</div></div>
                </div>
            `).join('');
        } else {
            htmlContenido = `
                <div class="comentario-card p-3 border rounded shadow-sm">
                    <div><strong>Comentario:</strong><br><div class="comentario-texto">${comentarios.Comentario || comentarioDecoded}</div></div>
                </div>
            `;
        }
    } catch (e) {
        console.error('El comentario no es un JSON válido:', e);
        htmlContenido = `<div class="alert alert-warning">El formato del comentario no es válido.</div>`;
    }

    $('#comentarioModal .modal-body').html(htmlContenido);
    $('#comentarioModal').modal('show');
}
// Modificar tramite por id
function modificarTramite(id) {
    //console.log('Editar tramite:', id);
    window.location.href = `updateTramiteCompleto.html?id=${id}`;
}
// Funcion para obtener KPI'S  Total Hoy, Total Vencidos, Total a vencer
function obtenerSemaforoTurnado(tramitesTurnados) {
    // console.log('Trámites Turnados:', tramitesTurnados);
    // // Obtener la fecha actual en formato YYYY-MM-DD
    // const hoy = new Date();
    // const fechaActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    // //console.log('Fecha actual:', fechaActual); // Ejemplo: "2025-03-06"

    // // Obtener el total de trámites
    // const totalTramites = tramitesTurnados.length;
    // //console.log('Total de trámites:', totalTramites);

    // // Lista de estatus válidos
    // const estatusValidos = ['Turnado', 'Devuelto', 'DevueltoOrdenPago'];

    // // Trámites que vencen hoy
    // const tramitesHoy = tramitesTurnados.filter(tramite =>
    //     estatusValidos.includes(tramite.Estatus) &&
    //     obtenerFechaSinHora(tramite.FechaLimite) === fechaActual
    // );
    // const idsHoy = tramitesHoy.map(tramite => tramite.ID_CONTRATO);
    // console.log('Trámites Hoy:', idsHoy);
    // //console.log('Total de trámites en estado Turnado, Devuelto o DevueltoOrdenPago que vencen hoy:', idsHoy.length, idsHoy);
    // document.getElementById('total_hoy').textContent = idsHoy.length || 0;

    // // Trámites vencidos (FechaLimite < fecha actual)
    // const tramitesVencidos = tramitesTurnados.filter(tramite =>
    //     estatusValidos.includes(tramite.Estatus) &&
    //     obtenerFechaSinHora(tramite.FechaLimite) < fechaActual
    // );
    // const idsVencidos = tramitesVencidos.map(tramite => tramite.ID_CONTRATO);
    // //console.log('Total de trámites vencidos:', idsVencidos.length, idsVencidos);
    // document.getElementById('total_vencidos').textContent = idsVencidos.length || 0;

    // // Trámites a vencer (FechaLimite > fecha actual)
    // const tramitesFuturos = tramitesTurnados.filter(tramite =>
    //     estatusValidos.includes(tramite.Estatus) &&
    //     obtenerFechaSinHora(tramite.FechaLimite) > fechaActual
    // );
    // const idsFuturos = tramitesFuturos.map(tramite => tramite.ID_CONTRATO);
    // //console.log('Total de trámites a vencer:', idsFuturos.length, idsFuturos);
    // document.getElementById('total_futuros').textContent = idsFuturos.length || 0;




    // // Trámites que vencen hoy - Detalle
    // console.log('===== DETALLE TRÁMITES QUE VENCEN HOY =====');
    // tramitesHoy.forEach(t => {
    //     console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    // });

    // // Trámites vencidos - Detalle
    // console.log('===== DETALLE TRÁMITES VENCIDOS =====');
    // tramitesVencidos.forEach(t => {
    //     console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    // });

    // // Trámites a vencer - Detalle
    // console.log('===== DETALLE TRÁMITES A VENCER =====');
    // tramitesFuturos.forEach(t => {
    //     console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    // });





    console.log('Trámites Turnados:', tramitesTurnados);
    const hoy = new Date();
    const fechaActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const estatusValidos = ['Turnado', 'Devuelto', 'DevueltoOrdenPago'];

    // Clasificación
    tramitesHoy = tramitesTurnados.filter(t =>
        estatusValidos.includes(t.Estatus) &&
        obtenerFechaSinHora(t.FechaLimite) === fechaActual
    );
    tramitesVencidos = tramitesTurnados.filter(t =>
        estatusValidos.includes(t.Estatus) &&
        obtenerFechaSinHora(t.FechaLimite) < fechaActual
    );
    tramitesFuturos = tramitesTurnados.filter(t =>
        estatusValidos.includes(t.Estatus) &&
        obtenerFechaSinHora(t.FechaLimite) > fechaActual
    );

    // Mostrar totales
    document.getElementById('total_hoy').textContent = tramitesHoy.length || 0;
    document.getElementById('total_vencidos').textContent = tramitesVencidos.length || 0;
    document.getElementById('total_futuros').textContent = tramitesFuturos.length || 0;

    // Mostrar en consola
    console.log('===== DETALLE TRÁMITES QUE VENCEN HOY =====');
    tramitesHoy.forEach(t => {
        console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    });

    console.log('===== DETALLE TRÁMITES VENCIDOS =====');
    tramitesVencidos.forEach(t => {
        console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    });

    console.log('===== DETALLE TRÁMITES A VENCER =====');
    tramitesFuturos.forEach(t => {
        console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    });

    // Eventos de clic para mostrar modales
    document.getElementById('total_hoy').closest('.card').addEventListener('click', () => {
        showTramitesModal('Trámites que vencen hoy', tramitesHoy, 'bg-primary');
    });
    document.getElementById('total_vencidos').closest('.card').addEventListener('click', () => {
        showTramitesModal('Trámites vencidos', tramitesVencidos, 'bg-danger');
    });
    document.getElementById('total_futuros').closest('.card').addEventListener('click', () => {
        showTramitesModal('Trámites a vencer', tramitesFuturos, 'bg-success');
    });

}
// Función para obtener solo la fecha en formato YYYY-MM-DD
function obtenerFechaSinHora(fecha) {
    const nuevaFecha = new Date(fecha);
    return `${nuevaFecha.getFullYear()}-${String(nuevaFecha.getMonth() + 1).padStart(2, '0')}-${String(nuevaFecha.getDate()).padStart(2, '0')}`;
}
// Función para generar y descargar el archivo Excel
function exportToExcel() {
    const table = document.querySelector("#tableTramites"); // Selecciona la tabla por su ID
    if (table) { // Verifica si la tabla existe
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" }); // Convierte la tabla en un libro de Excel
        XLSX.writeFile(wb, "datos_oficios.xlsx"); // Descarga el archivo Excel con el nombre especificado
    } else {
        console.error("La tabla no existe en el DOM.");
    }
}
function generarQR(id, nombreAnalista, noTramite) {
    const url = `https://pagotrack.mexiclientes.com/TramiteDetalle.html?id=${id}`;
    const qrCanvas = document.createElement("canvas");

    const qr = new QRCode(document.createElement("div"), {
        text: url,
        width: 300,
        height: 300,
        correctLevel: QRCode.CorrectLevel.H
    });

    // Esperamos que el QR se genere
    setTimeout(() => {
        const qrImg = qr._el.querySelector("img") || qr._el.querySelector("canvas");
        if (!qrImg) {
            console.error("No se pudo generar el QR.");
            return;
        }

        const tempCanvas = document.createElement("canvas");
        const ctx = tempCanvas.getContext("2d");

        const qrWidth = 300;
        const qrHeight = 300;
        const textHeight = 60;
        tempCanvas.width = qrWidth;
        tempCanvas.height = qrHeight + textHeight;

        // Dibujar QR
        if (qrImg.tagName === "IMG") {
            const image = new Image();
            image.src = qrImg.src;
            image.onload = () => {
                ctx.drawImage(image, 0, 0, qrWidth, qrHeight);

                // Dibujar texto debajo
                ctx.font = "bold 16px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "center";
                ctx.fillText(`Analista: ${nombreAnalista}`, qrWidth / 2, qrHeight + 20);
                ctx.fillText(`No. Orden: ${noTramite}`, qrWidth / 2, qrHeight + 40);
                ctx.fillText(`ID Tramite: ${id}`, qrWidth / 2, qrHeight + 60);

                // Descargar
                const link = document.createElement("a");
                link.href = tempCanvas.toDataURL("image/png");
                link.download = `qr_tramite_${id}.png`;
                link.click();
            };
        } else {
            // Si es canvas directamente
            ctx.drawImage(qrImg, 0, 0);

            // Texto
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            ctx.fillText(`Analista: ${nombreAnalista}`, qrWidth / 2, qrHeight + 20);
            ctx.fillText(`ID Tramite: ${id}`, qrWidth / 2, qrHeight + 40);

            // Descargar
            const link = document.createElement("a");
            link.href = tempCanvas.toDataURL("image/png");
            link.download = `qr_tramite_${id}.png`;
            link.click();
        }
    }, 500);
}
// Función para mostrar los detalles de los trámites
function showTramitesDetails(InicioSesionID) {
    const data = {
        InicioSesionID: InicioSesionID
    };

    // Obtener los trámites del analista
    fetch(URL_BASE + 'getTallesTramites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(response => {
            // Verificar si la respuesta tiene la estructura esperada
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('La estructura de datos no es válida');
            }
            const tramites = response.data;
            // Crear modal o ventana con los detalles
            const modalHtml = `
            <div class="modal fade" id="tramitesModal" tabindex="-1" role="dialog" aria-labelledby="tramitesModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl" role="document">
                    <div class="modal-content">                        
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table id="detalleTramitesTable" class="table table-striped table-bordered" style="width:100%">
                                    <thead class="thead-dark">
                                        <tr>
                                            <th>ID Tramite</th>
                                            <th>Tipo</th>
                                            <th>Dependencia</th>
                                            <th>Proveedor</th>
                                            <th>Concepto</th>
                                            <th>Importe</th>
                                            <th>Estatus</th>
                                            <th>Fecha Recepción</th>
                                            <th>Fecha Limite</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tramites.map(tramite => {
                const comentarioEscapado = encodeURIComponent(tramite.Comentarios || '');
                return `
                                                <tr>
                                                    <td>${tramite.ID_CONTRATO || 'N/A'}</td>
                                                    <td>${tramite.TipoTramite || 'N/A'}</td>
                                                    <td>${tramite.Dependencia || 'N/A'}</td>
                                                    <td>${tramite.Proveedor || 'N/A'}</td>
                                                    <td>${tramite.Concepto || 'N/A'}</td>
                                                    <td>$${tramite.Importe ? parseFloat(tramite.Importe).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                                                    <td>
                                                        <span class="badge ${tramite.Estatus === 'Observaciones' ? 'bg-warning' : 'bg-primary'}">
                                                            ${tramite.Estatus || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>${formatDate(tramite.FechaRecepcion)}</td>
                                                    <td>${formatDate(tramite.FechaLimite)}</td>
                                                    <td>
                                                        <button class="btn btn-primary toggleButton" onclick="mostrarComentario('${comentarioEscapado}')">Ver Comentario</button>
                                                    </td>
                                                </tr>
                                            `;
            }).join('')}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                       
                    </div>
                </div>
            </div>
        `;

            // Agregar el modal al body
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Mostrar el modal
            $('#tramitesModal').modal('show');

            // Inicializar DataTable en la tabla de detalles
            $('#detalleTramitesTable').DataTable({
                language: {
                    processing: "Procesando...",
                    search: "Buscar:",
                    lengthMenu: "Mostrar _MENU_ registros",
                    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "Mostrando 0 a 0 de 0 registros",
                    infoFiltered: "(filtrado de _MAX_ registros totales)",
                    infoPostFix: "",
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
                lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
                responsive: true,
                dom: '<"top"Bf>rt<"bottom"lip><"clear">',
                buttons: [
                    {
                        extend: 'excel',
                        text: 'Exportar a Excel',
                        className: 'btn btn-success'
                    },
                    {
                        extend: 'print',
                        text: 'Imprimir',
                        className: 'btn btn-info'
                    }
                ]
            });

            // Eliminar el modal cuando se cierre
            $('#tramitesModal').on('hidden.bs.modal', function () {
                $(this).remove();
            });
        })
        .catch(error => {
            console.error('Error al obtener los trámites:', error);
            alert('Error al cargar los detalles de los trámites: ' + error.message);
        });
}
// Función auxiliar para formatear fechas
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Si no es una fecha válida, devolver el string original

    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
// Función para mostrar los detalles de los trámites de los analistas
function showTramitesModal(titulo, tramites) {
    // Elimina el modal anterior si existe
    const existingModal = document.getElementById('tramitesModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div class="modal fade" id="tramitesModal" tabindex="-1" role="dialog" aria-labelledby="tramitesModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table id="detalleTramitesTable" class="table table-striped table-bordered" style="width:100%">
                                <thead class="thead-dark">
                                    <tr>
                                        <th>No. Trámite</th>
                                        <th>Tipo</th>
                                        <th>Dependencia</th>
                                        <th>Proveedor</th>
                                        <th>Concepto</th>
                                        <th>Importe</th>
                                        <th>Estatus</th>
                                        <th>Fecha Recepción</th>
                                        <th>Fecha Limite</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                        ${tramites.map(tramite => {
                                            const comentarioEscapado = encodeURIComponent(tramite.Comentarios || '');
                                            return `
                                                <tr>
                                                    <td>${tramite.ID_CONTRATO || 'N/A'}</td>
                                                    <td>${tramite.TipoTramite || 'N/A'}</td>
                                                    <td>${tramite.Dependencia || 'N/A'}</td>
                                                    <td>${tramite.Proveedor || 'N/A'}</td>
                                                    <td>${tramite.Concepto || 'N/A'}</td>
                                                    <td>$${tramite.Importe ? parseFloat(tramite.Importe).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                                                    <td>
                                                        <span class="badge ${tramite.Estatus === 'Observaciones' ? 'bg-warning' : 'bg-primary'}">
                                                            ${tramite.Estatus || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>${formatDate(tramite.FechaRecepcion)}</td>
                                                    <td>${formatDate(tramite.FechaLimite)}</td>
                                                    <td>
                                                        <button class="btn btn-primary toggleButton" onclick="mostrarComentario('${comentarioEscapado}')">Ver Comentario</button>
                                                    </td>
                                                </tr>
                                            `;
    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    $('#tramitesModal').modal('show');

    $('#detalleTramitesTable').DataTable({
        language: { /* ... */ }, // Usa tu configuración actual
        pageLength: 10,
        buttons: [
            { extend: 'excel', text: 'Exportar a Excel', className: 'btn btn-success' },
            { extend: 'print', text: 'Imprimir', className: 'btn btn-info' }
        ]
    });

    $('#tramitesModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}