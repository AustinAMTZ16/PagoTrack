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
// Importar funciones globales
import Global from './funcionesGlobales.js';

// Obtener la URL base dinámicamente
// const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
// const Global.URL_BASE = `https://apipagotrack.mexiclientes.com/index.php?action=`;
// const Global.URL_BASE = `http://localhost/DigitalOcean/Egresos/BackEndPagoTrack/index.php?action=`;
// const Global.URL_BASE = `${URL_B}index.php?action=`;
// Variable global para almacenar la lista trámites
let tramitesArray = [];
let nombreAnalista = "";
let tramitesHoy = [];
let tramitesVencidos = [];
let tramitesFuturos = [];
const ordenEstatus = [
    'Observaciones',
    'Devuelto',
    'Turnado',
    'Rechazado',
    'RegistradoSAP',
    'Procesando',
    'JuntasAuxiliares',
    'Inspectoria',
    'Remesa',
    'RevisionRemesa',
    'RemesaAprobada',
    'DevueltoOrdenesPago',
    'Pagado',
    'Terminado',
    'Cancelado',
    'Cheque',
    'ComprobacionRecursoFinancieros',
    'OrdenesPago',
    'CRF'
];
let localStorageUser = JSON.parse(localStorage.getItem("usuario"));
// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    gestionarEstadoBotonNuevoTramite();
    // Referencia al Select de Estado
    const estadoSelect = document.getElementById("estadoSelect");
    // Referencia a la tabla de trámites
    const tableTramitesJS = document.getElementById('tableTramites');
    // Referencia a la tabla de trámites turnados
    const tableTurnadosJS = document.getElementById('tableTurnados');
    // Referencia a la tabla de trámites rezagados
    const tableRezagadosJS = document.getElementById('tramitesRezagados');
    // Referencia a la tabla de estimación de liquidez
    const tablaEstimacionJS = document.getElementById('tablaEstimacion');
    // Referencia a la tabla de seguimiento de trámites por analista
    const tramitesTableJS = document.getElementById('tramitesTable');
    // Tabla de historico de trámites por mes
    const rendimientoTable = document.getElementById('rendimientoTable');
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
    // Verifica si la tabla de trámites rezagados existe
    if (tableRezagadosJS) {
        getTramitesRezagados();
    }
    // Verifica si la tabla de estimación de liquidez existe
    if (tablaEstimacionJS) {
        getEstimacionLiquidez();
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
    }
    // Valida si existe la tabla de seguimiento de trámites por analista
    if (tramitesTableJS) {
        getSeguimientoTramites();
    }
    // Tabla de historico de trámites por mes
    if (rendimientoTable) {
        getHistoricoMes();
    }
    // Verifica si el botón existe antes de agregar el listener
    const downloadButton = document.getElementById("downloadExcelTramites");
    if (downloadButton) {
        downloadButton.addEventListener("click", () => {
            exportToExcel("tableTramites", "datos_tramites"); // 👈 Tabla 'tableTramites', Archivo 'datos_tramites.xlsx'
        });
    }
    //
    const downloadExcelLiquidez = document.getElementById("downloadExcelLiquidez");
    if (downloadExcelLiquidez) {
        downloadExcelLiquidez.addEventListener("click", () => {
            exportToExcel("tablaEstimacion", "datos_liquidez"); // 👈 Tabla 'tableLiquidez', Archivo 'datos_liquidez.xlsx'
        });
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
                    // console.error("Error en la solicitud:", error);
                    document.getElementById("resumenGPT").innerHTML = "<b>Error al generar el resumen.</b>";
                });
        });
    }
    // Limpiar filtros
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function () {
            const ids = [
                'ID_CONTRATO', 'estadoSelect', 'mesSelect', 'tipoTramiteSelect', 'analistaSelect',
                'dependenciaSelect', 'proveedorSelect', 'conceptoSelect', 'importeSelect',
                'remesaSelect', 'integracionSAPSelect', 'docSAPSelect', 'numeroTramiteSelect',
                'fechaRecepcionSelect', 'fechaCreacionSelect', 'fechaVencimientoSelect'
            ];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;

                if (el.tagName === 'SELECT') {
                    el.value = 'Todos';
                } else {
                    el.value = '';
                }
            });
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
                { id: 'fechaCreacionSelect', type: 'date' },
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

            // console.log('Filtros aplicados:', appliedFilters);
            filtrarTramites(appliedFilters);
        });
    }

    // Mostrar/ocultar filtros
    const btnExportar = document.getElementById('btn-mostrar-ocultar');
    const filtros = document.querySelector('.row.g-3');
    btnExportar.addEventListener('click', () => {
        if (filtros.hasAttribute('hidden')) {
            filtros.removeAttribute('hidden');
        } else {
            filtros.setAttribute('hidden', true);
        }
    });
    // Mostrar/ocultar tablas
    const btnExportartablas = document.getElementById('btn-mostrar-ocultar-tablas');
    if (btnExportartablas) {
        const filtrosTabla = document.querySelector('.tablasAnalistas');
        btnExportartablas.addEventListener('click', () => {
            if (filtrosTabla.hasAttribute('hidden')) {
                filtrosTabla.removeAttribute('hidden');
            } else {
                filtrosTabla.setAttribute('hidden', true);
            }
        });
    }
    // MostrarRezagados
    const btnTablasrezagados = document.getElementById('btn-mostrar-ocultar-tablasrezagados');
    if (btnTablasrezagados) {
        const filtrosTabla = document.querySelector('.tablasRezagados');
        btnTablasrezagados.addEventListener('click', () => {
            if (filtrosTabla.hasAttribute('hidden')) {
                filtrosTabla.removeAttribute('hidden');
            } else {
                filtrosTabla.setAttribute('hidden', true);
            }
        });
    }
    // Mostrar/Ocultar sección de liquidez
    const btnMostrarLiquidez = document.getElementById('btn-mostrar-ocultar-liquidez');
    if (btnMostrarLiquidez) {
        const seccionLiquidez = document.querySelector('.tablasLiquidez');
        btnMostrarLiquidez.addEventListener('click', () => {
            if (seccionLiquidez.hasAttribute('hidden')) {
                seccionLiquidez.removeAttribute('hidden');
            } else {
                seccionLiquidez.setAttribute('hidden', true);
            }
        });
    }
    // 1. Obtiene el div que queremos mostrar/ocultar.
    const divAnalista = document.getElementById("logicaAnalista");
    if (divAnalista) {
        // 4. Compara el rol del usuario. Usamos '===' para una comparación estricta.
        if (localStorageUser.RolUser === 'Admin') {
            // 5. Si es 'Admin', quita el atributo 'hidden' para hacer visible el div.
            // La forma más moderna y sencilla es establecer la propiedad .hidden en false.
            divAnalista.hidden = false;
            console.log("Acceso de Administrador concedido. Mostrando panel.");
        } else {
            console.log("El usuario no es Administrador. El panel permanece oculto.");
        }
    } else {
        // Mensaje en caso de que no haya usuario logeado o el div no se encuentre.
        console.log("No hay sesión de usuario activa o el elemento #logicaAnalista no se encontró en la página.");
    }
});
// Función para obtener la lista de trámites
function getTramites() {
    fetch(Global.URL_BASE + 'getTramites', {
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
    fetch(Global.URL_BASE + 'getSeguimientoTramites', {
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
            // console.log('Result:', result);
            // Renderizar la tabla
            renderTable(result.data);
        })
        .catch(error => {
            console.error('Error al obtener el seguimiento de trámites:', error.message);
        });
}
//funcion para obtener el historico de trámites por mes
function getHistoricoMes() {
    fetch(Global.URL_BASE + 'getHistoricoMes', {
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
            renderTablegetHistoricoMes(result.data);
            // console.log('Historico de trámites por mes:', result.data);
        })
        .catch(error => {
            console.error('Error al obtener el seguimiento de trámites:', error.message);
        });
}
//funcion para obtener el conteo de estatus
function getConteoEstatus() {
    fetch(Global.URL_BASE + 'getConteoEstatus', {
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
    fetch(Global.URL_BASE + 'getReporteEstatusComentarios', {
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
    fetch(Global.URL_BASE + 'getTramites', {
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
    // Ordenar manualmente antes de pasar a la tabla
    data.sort((a, b) => {
        // 1. Primer criterio: Estatus ('Observaciones' y 'Devuelto' primero)
        const ordenEstatus = ["Observaciones", "Devuelto"]; // Asegúrate de que esta variable exista en tu código
        const estatusA = ordenEstatus.indexOf(a.Estatus) !== -1 ? ordenEstatus.indexOf(a.Estatus) : 99;
        const estatusB = ordenEstatus.indexOf(b.Estatus) !== -1 ? ordenEstatus.indexOf(b.Estatus) : 99;

        if (estatusA !== estatusB) {
            return estatusA - estatusB;
        }

        // 2. Segundo criterio: FechaCreacion DESC (de más reciente a más antiguo)
        const fechaA = new Date(a.FechaCreacion);
        const fechaB = new Date(b.FechaCreacion);
        return fechaB - fechaA;
    });
    // Inicializar DataTable con datos dinámicos
    $(`#${tableId}`).DataTable({
        data: data,
        columns: [
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    if (data.Estatus === "Creado") {
                        // BTN ACCION TURNAR
                        botones += `<button class="btn-icon primary" title="Turnar" onclick="turnarTramite(${data.ID_CONTRATO})"><i class="fa-solid fa-person-walking-arrow-loop-left"></i></button> `;
                    }
                    if (data.Estatus === "VoBO") {
                        // BTN ACCION VoBo
                        botones += `<button class="btn-icon primary" title="VoBo" onclick="turnarTramite(${data.ID_CONTRATO})"><i class="fas fa-thumbs-up"></i></button> `;
                    }
                    if (data.Estatus === "RegistradoSAP" || data.Estatus === "Inspectoria" || data.Estatus === "JuntasAuxiliares") {
                        // BTN ACCION ASIGNAR REMESA
                        botones += `<button class="btn-icon primary" title="Asignar Remesa" onclick="createRemesa(${data.ID_CONTRATO})"><i class="fas fa-money-check-alt"></i></button> `;
                    }
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && (usuario.RolUser === "Admin" || usuario.RolUser === "OP_KPI") || usuario.RolUser === "Operador" || usuario.RolUser === "OP_Tramite" || usuario.RolUser === "OP_Remesa") {
                        // BTN ACCION MODIFICAR
                        botones += `<button class="btn-icon primary" title="Modificar" onclick="modificarTramite(${data.ID_CONTRATO})"><i class="fas fa-edit"></i></button>`;
                    }
                    if (usuario && usuario.RolUser === "Admin") {
                        // BTN ACCION ELIMINAR
                        botones += `<button class="btn-icon primary" title="Eliminar" onclick="eliminarTramite(${data.ID_CONTRATO})"><i class="fas fa-trash"></i></button>`;
                    }
                    // BTN ACCION QR
                    botones += `<button class="btn-icon primary" title="Ver QR" onclick="generarQR(${data.ID_CONTRATO}, '${nombreAnalista}', '${data.NoTramite}')"><i class="fas fa-qrcode"></i></button>`;
                    // BTN ACCION DETALLE
                    botones += `<button class="btn-icon primary" title="Ver Detalles" onclick="window.location.href = 'TramiteDetalle.html?id=${data.ID_CONTRATO}'"><i class="fas fa-eye"></i></button>`;
                    const comentarioEscapado = encodeURIComponent(data.Comentarios || "");
                    botones += `<button class="btn-icon primary" title="Comentarios" onclick="mostrarComentario('${comentarioEscapado}')"><i class="fas fa-comment-dots"></i></button>`;

                    return botones;
                },
            },
            { data: "ID_CONTRATO", visible: true },
            {
                data: "FechaCreacion",
            },
            {
                data: "FechaRecepcion"
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
            { data: "FechaLimitePago" },
            { data: "TipoTramite" },
            { data: "Estatus" },
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
            {
                data: "RemesaNumero",
                render: function (data, type, row) {
                    if (!data) return "";
                    return `<a href="seguimientoRemesas.html?remesa=${encodeURIComponent(data)}" class="text-primary fw-bold">${data}</a>`;
                }
            },
            { data: "DocSAP" },
            { data: "IntegraSAP" },
            { data: "FK_SRF" },
            {
                data: "FlagVolante",
                render: function (data, type, row) {
                    // Creamos el mismo enlace, pero el contenido visual cambia.
                    const url = `VolanteObsercacionesLista.html?tramite_search=${row.ID_CONTRATO}`;

                    // Si FLAG_VOLANTE es verdadero (1), mostramos un badge de éxito.
                    if (data) {
                        return `<a href="${url}" title="Ver volantes para el trámite ${row.ID_CONTRATO}"><span class="badge bg-success">Sí</span></a>`;
                    }
                    // Si es falso (0 o null), mostramos un badge de peligro.
                    else {
                        return `<a href="${url}" title="Verificar volantes para el trámite ${row.ID_CONTRATO}"><span class="badge bg-danger">No</span></a>`;
                    }
                }
            },
            { data: "NoTramite" },
            { data: "NumeroObra" }
        ],
        pageLength: 5, // Número de filas por página
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "Todos"]],
        paging: true,
        searching: true,
        ordering: false, // ya están ordenados antes
        info: true,
        scrollX: true,
        autoWidth: false,
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
        createdRow: function (row, data) {
            const estatus = data.Estatus;
            if (estatus === "Observaciones") {
                $('td', row).addClass('fila-observaciones');
            } else if (estatus === "Devuelto") {
                $('td', row).addClass('fila-devuelto');
            }
        }
    });
}
// Función para actualizar la tabla de trámites turnados
function actualizarTablaTurnados(data, tableId) {
    // filtrar data con el usuario actual logged in
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    // filtrar trámites turnados por el usuario AnalistaID
    if (usuario && usuario.InicioSesionID) {
        if (usuario.InicioSesionID == 1) {
            data;
            actualizarBarraDeProgreso(data);
        } else {
            data = data.filter(tramite => tramite.AnalistaID === usuario.InicioSesionID);
            actualizarBarraDeProgreso(data);
        }
    }

    if (!Array.isArray(data)) {
        console.error("Error: La respuesta no es un array válido.", data);
        alert("Error: Datos inválidos.");
        return;
    }

    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().clear().destroy();
    }

    const formatoMoneda = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
    // console.log('DATA actual:', data);
    // Ordenar manualmente antes de pasar a la tabla
    data.sort((a, b) => {
        // 1. Primer criterio: Estatus ('Observaciones' y 'Devuelto' primero)
        const ordenEstatus = ["Observaciones", "Devuelto"]; // Asegúrate de que esta variable exista en tu código
        const estatusA = ordenEstatus.indexOf(a.Estatus) !== -1 ? ordenEstatus.indexOf(a.Estatus) : 99;
        const estatusB = ordenEstatus.indexOf(b.Estatus) !== -1 ? ordenEstatus.indexOf(b.Estatus) : 99;

        if (estatusA !== estatusB) {
            return estatusA - estatusB;
        }

        // 2. Segundo criterio: FechaCreacion DESC (de más reciente a más antiguo)
        const fechaA = new Date(a.FechaCreacion);
        const fechaB = new Date(b.FechaCreacion);
        return fechaB - fechaA;
    });

    $(`#${tableId}`).DataTable({
        data: data,
        columns: [
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    if (localStorageUser.RolUser === "Analista" || localStorageUser.RolUser === "Admin" || localStorageUser.RolUser === "OP_Remesa" || localStorageUser.RolUser === "Operador" || localStorageUser.RolUser === "OP_KPI") {
                        if (["Devuelto", "Turnado", "Observaciones"].includes(data.Estatus)) {
                            botones += `<button class="btn-icon primary" title="Actualizar" onclick="editarTramite(                            
                            decodeURIComponent('${encodeURIComponent(data.ID_CONTRATO)}'),
                            decodeURIComponent('${encodeURIComponent(data.Proveedor)}'),
                            decodeURIComponent('${encodeURIComponent(data.Concepto)}'),
                            decodeURIComponent('${encodeURIComponent(data.Importe)}'),
                            decodeURIComponent('${encodeURIComponent(data.FechaLimite)}'),
                            decodeURIComponent('${encodeURIComponent(data.FechaRecepcion)}'),
                            decodeURIComponent('${encodeURIComponent(data.Dependencia)}'),
                            decodeURIComponent('${encodeURIComponent(data.NombreUser + ' ' + data.ApellidoUser)}'),
                            decodeURIComponent('${encodeURIComponent(data.VolantesPorSolventar)}')
                        )"><i class="fa-solid fa-pen-to-square"></i></button>`;
                        }
                        // BTN ACCION DETALLE
                        botones += `<button class="btn-icon primary" title="Ver Detalles" onclick="window.location.href = 'TramiteDetalle.html?id=${data.ID_CONTRATO}'"><i class="fas fa-eye"></i></button>`;
                        botones += `<button class="btn-icon primary" title="QR" onclick="generarQR(${data.ID_CONTRATO}, '${data.NombreUser}', '${data.NoTramite}')"><i class="fas fa-qrcode"></i></button>`;

                        const comentarioEscapado = encodeURIComponent(data.Comentarios || "");
                        botones += `<button class="btn-icon primary" title="Comentarios" onclick="mostrarComentario('${comentarioEscapado}')"><i class="fas fa-comment-dots"></i></button>`;
                    }
                    return botones;
                }
            },
            { data: "ID_CONTRATO" },
            { data: "FechaCreacion" },
            { data: "FechaRecepcion" },
            {
                data: "FechaLimite",
                render: function (data) {
                    return data ? new Date(data).toLocaleDateString('es-ES') : "";
                }
            },
            { data: "TipoTramite" },
            { data: "Estatus" },
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
                    return `${data.NombreUser} ${data.ApellidoUser}`;
                }
            },
            { data: "DocSAP" },
            { data: "IntegraSAP" },
            {
                data: "FlagVolante",
                render: function (data, type, row) {
                    // Creamos el mismo enlace, pero el contenido visual cambia.
                    const url = `VolanteObsercacionesLista.html?tramite_search=${row.ID_CONTRATO}`;

                    // Si FLAG_VOLANTE es verdadero (1), mostramos un badge de éxito.
                    if (data) {
                        return `<a href="${url}" title="Ver volantes para el trámite ${row.ID_CONTRATO}"><span class="badge bg-success">Sí</span></a>`;
                    }
                    // Si es falso (0 o null), mostramos un badge de peligro.
                    else {
                        return `<a href="${url}" title="Verificar volantes para el trámite ${row.ID_CONTRATO}"><span class="badge bg-danger">No</span></a>`;
                    }
                }
            }
        ],
        pageLength: 10, // Número de filas por página        
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        paging: true,
        searching: true,
        ordering: false, // ya están ordenados antes
        info: true,
        scrollX: true,
        autoWidth: false,
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "No hay datos disponibles en la tabla",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            }
        },
        createdRow: function (row, data) {
            const estatus = data.Estatus;
            if (estatus === "Observaciones") {
                $('td', row).addClass('fila-observaciones');
            } else if (estatus === "Devuelto") {
                $('td', row).addClass('fila-devuelto');
            }
        },
        initComplete: function () {
            $('#tableTurnados thead th').css('resize', 'horizontal');
        }
    });
}
/**
 * Calcula y actualiza la barra de progreso del analista.
 * @param {Array} tramitesDelAnalista - El array de trámites ya filtrado para el usuario actual.
 */
function actualizarBarraDeProgreso(tramitesDelAnalista) {
    // Calcular el mes actual
    const mesActual = getMesActualNombre();
    // 3. Filtramos el arreglo
    const tramitesDelMesActual = tramitesDelAnalista.filter(tramite => {
        return tramite.Mes === mesActual;
    });
    const totalTramites = tramitesDelMesActual.length;
    const barraProgreso = document.getElementById('barra-progreso-analista');
    const contenedorProgreso = document.getElementById('progreso-container');

    // Si no hay trámites, ocultamos la barra y detenemos la ejecución.
    if (totalTramites === 0) {
        contenedorProgreso.style.display = 'none';
        return;
    }

    contenedorProgreso.style.display = 'block'; // Asegurarnos de que sea visible

    // Definimos qué estados NO se consideran pendientes.
    // Esta es tu lógica original: todo lo que no es Creado o Turnado es avance.
    // const tramitesAvanzados = tramitesDelAnalista.filter(
    //     t => t.Estatus !== 'Creado' && t.Estatus !== 'Turnado'
    // ).length;

    // **LÓGICA REFINADA (RECOMENDADA):**
    // Se define explícitamente qué es un avance. Es más preciso.
    const ESTADOS_AVANZADOS = [
        'Observaciones', 'Devuelto', 'Rechazado', 'RegistradoSAP', 'Procesando',
        'JuntasAuxiliares', 'Inspectoria', 'Remesa', 'RevisionRemesa', 'RemesaAprobada',
        'DevueltoOrdenesPago', 'Pagado', 'Terminado', 'Cancelado', 'Cheque',
        'ComprobacionRecursosFinancieros', 'OrdenesPago', 'CRF'
    ];
    const tramitesAvanzados = tramitesDelMesActual.filter(t => ESTADOS_AVANZADOS.includes(t.Estatus)).length;


    // Cálculo del porcentaje
    const porcentaje = Math.round((tramitesAvanzados / totalTramites) * 100);

    // 1. Limpiamos las clases de color existentes para evitar conflictos
    barraProgreso.classList.remove('bg-success', 'bg-warning', 'bg-danger');

    // 2. Aplicamos la clase de color correcta según el porcentaje
    if (porcentaje < 20) {
        barraProgreso.classList.add('bg-danger');
    } else if (porcentaje < 55) {
        barraProgreso.classList.add('bg-warning');
    } else { // Si es 50 o más
        barraProgreso.classList.add('bg-success');
    }

    // Actualizar la barra de progreso en el DOM
    barraProgreso.style.width = `${porcentaje}%`;
    barraProgreso.setAttribute('aria-valuenow', porcentaje);
    barraProgreso.textContent = `${porcentaje}% (${tramitesAvanzados} de ${totalTramites})`;
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
        dependencia: 'DependenciaID',
        proveedor: 'Proveedor',
        concepto: 'Concepto',
        importe: 'Importe',
        remesa: 'RemesaNumero',
        integracionSAP: 'IntegraSAP',
        docSAP: 'DocSAP',
        numeroTramite: 'NoTramite',
        fechaRecepcion: 'FechaRecepcion',
        fechaVencimiento: 'FechaLimite',
        fechaCreacion: 'FechaCreacion'
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
        'fechaVencimiento',
        'fechaCreacion'
    ];

    // console.log('filtros aplicados:', filtros);

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
            } else if (campo === 'fechaRecepcion' || campo === 'fechaVencimiento' || campo === 'fechaCreacion') {
                const fechaBase = valorTramite ? valorTramite.split(' ')[0] : '';
                // const fechaBase = valorTramite ? new Date(valorTramite).toISOString().split('T')[0] : '';
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
function editarTramite(id, proveedor, concepto, importe, fechaLimite, fechaRecepcion, dependencia, nombreUser, FlagVolante) {
    // Formatea las fechas eliminando la hora
    const formatoFecha = (fecha) => fecha.split(' ')[0];

    const fechaLimiteFormateada = formatoFecha(fechaLimite);
    const fechaRecepcionFormateada = formatoFecha(fechaRecepcion);

    //console.log('Editar tramite:', id, proveedor, concepto, importe, fechaLimite, fechaRecepcion, dependencia);

    window.location.href = `turnadoUpdateTramite.html?id=${id}&proveedor=${encodeURIComponent(proveedor)}&concepto=${encodeURIComponent(concepto)}&importe=${importe}&fechaLimite=${fechaLimiteFormateada}&fechaRecepcion=${fechaRecepcionFormateada}&dependencia=${encodeURIComponent(dependencia)}&nombreUser=${encodeURIComponent(nombreUser)}&FlagVolante=${encodeURIComponent(FlagVolante)}`;
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
        fetch(Global.URL_BASE + 'deleteTramite', {
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
    const tableId = "tramitesTable";
    const table = document.getElementById(tableId);
    const tableHead = table.querySelector("thead tr");
    const tableBody = table.querySelector("tbody");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='99'>No hay datos disponibles</td></tr>";
        return;
    }

    // Definir columnas fijas + dinámicas
    const columnasFijas = ["OrdenGrupo", "Estatus", "NombreCompleto"];
    const columnasDinamicas = Object.keys(data[0]).filter(
        key => !columnasFijas.includes(key)
    );

    const allColumns = [...columnasFijas, ...columnasDinamicas];

    // Construir encabezados
    allColumns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        tableHead.appendChild(th);
    });

    data.forEach(row => {
        const tr = document.createElement("tr");

        allColumns.forEach(col => {
            const td = document.createElement("td");

            if (col === "TotalGeneral") {
                // const link = document.createElement("a");
                // link.href = "#";
                // link.textContent = row[col] || 0;
                // link.style.cursor = "pointer";
                // link.style.color = "#007bff";
                // link.style.textDecoration = "underline";

                // // Evento para mostrar detalles al hacer clic
                // link.addEventListener("click", function (e) {
                //     e.preventDefault();
                //     showTramitesDetails(row.Estatus);
                // });

                // td.appendChild(link);


                const link = document.createElement("a");
                link.href = "#";
                link.textContent = row[col] || 0;
                link.style.cursor = "pointer";
                link.style.textDecoration = "underline";
                link.style.fontWeight = "bold";
                link.style.fontSize = "18px";



                // Aplicar color al link basado en el Estatus
                const colorPorEstatus = {
                    "Creado": "#eab211",
                    "Turnado": "#eab211",             // marrón oscuro
                    "RegistradoSAP": "#004085",       // azul oscuro
                    "Remesa": "#004085",
                    "RemesaAprobada": "#004085",
                    "OrdenesPago": "#004085",
                    "Pagado": "#155724",              // verde oscuro
                    "Observaciones": "#ea8e11",       // naranja oscuro
                    "Devuelto": "#721c24",            // rojo oscuro
                    "Rechazado": "#721c24",
                    "Cancelado": "#721c24",
                    "JuntasAuxiliares": "#155724",
                    "Inspectoria": "#155724",
                    "ComprobacionRecurso": "#155724",
                    "Total general": "#000000"
                };

                const color = colorPorEstatus[row.Estatus?.trim()] || "#007bff";
                link.style.color = color;

                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    showTramitesDetails(row.Estatus);
                });

                td.appendChild(link);


            } else {
                td.textContent = row[col] !== null ? row[col] : "";
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    // Reinicializar DataTable
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
        pageLength: 30, // Número de filas por página
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        // order: [[11, "DESC"]],
        columnDefs: [
            {
                targets: 0, // Ocultar OrdenGrupo
                visible: false,
                searchable: false
            }
        ]
    });
}
// Tabla de historico de trámites por mes
// function renderTablegetHistoricoMes(data) {
//     const tableId = "rendimientoTable"; // ID de la tabla
//     const table = document.getElementById(tableId);
//     const tableHead = table.querySelector("thead tr");
//     const tableBody = table.querySelector("tbody");
//     // Limpiar la tabla antes de insertar nuevos datos
//     tableHead.innerHTML = "<th>InicioSesionID</th>";
//     tableBody.innerHTML = "";
//     if (data.length === 0) {
//         tableBody.innerHTML = "<tr><td colspan='99'>No hay datos disponibles</td></tr>";
//         return;
//     }
//     // Obtener los nombres de los tipos de trámites dinámicamente
//     const columns = Object.keys(data[0]).filter(key => key !== "InicioSesionID");
//     // Generar encabezados de tabla dinámicos
//     columns.forEach(col => {
//         const th = document.createElement("th");
//         th.textContent = col;
//         tableHead.appendChild(th);
//     });
//     // Insertar filas con los datos
//     data.forEach(row => {
//         const tr = document.createElement("tr");
//         // Celda del analista
//         const tdAnalista = document.createElement("td");
//         tdAnalista.textContent = row.InicioSesionID;
//         tr.appendChild(tdAnalista);
//         // Celdas de conteo de trámites
//         columns.forEach(col => {
//             const td = document.createElement("td");
//             if (col === "Total") {
//                 // Hacer el Total clickeable
//                 const link = document.createElement("a");
//                 link.href = `#`;
//                 link.textContent = row[col] || 0;
//                 link.style.cursor = "pointer";
//                 link.style.color = "#007bff";
//                 link.style.textDecoration = "underline";
//                 link.style.fontWeight = "bold";
//                 link.style.fontSize = "18px";
//                 // Agregar evento click para mostrar detalles
//                 link.addEventListener("click", function (e) {
//                     e.preventDefault();
//                     showHistoricoMes(row.InicioSesionID);
//                 });
//                 td.appendChild(link);
//             } else {
//                 td.textContent = row[col] || 0;
//             }
//             tr.appendChild(td);
//         });
//         tableBody.appendChild(tr);
//     });
//     // Destruir DataTable si ya estaba inicializado
//     if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
//         $(`#${tableId}`).DataTable().clear().destroy();
//     }
//     // Inicializar DataTable con configuración en español
//     $(`#${tableId}`).DataTable({
//         language: {
//             processing: "Procesando...",
//             search: "Buscar:",
//             lengthMenu: "Mostrar _MENU_ registros",
//             info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
//             infoEmpty: "Mostrando 0 a 0 de 0 registros",
//             infoFiltered: "(filtrado de _MAX_ registros totales)",
//             infoPostFix: "",
//             loadingRecords: "Cargando...",
//             zeroRecords: "No se encontraron resultados",
//             emptyTable: "No hay datos disponibles en la tabla",
//             paginate: {
//                 first: "Primero",
//                 previous: "Anterior",
//                 next: "Siguiente",
//                 last: "Último"
//             },
//             aria: {
//                 sortAscending: ": Activar para ordenar la columna de manera ascendente",
//                 sortDescending: ": Activar para ordenar la columna de manera descendente"
//             }
//         },
//         pageLength: 20, // Número de filas por página
//         lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
//         responsive: true,
//         order: [[11, "DESC"]],
//     });
// }
function renderTablegetHistoricoMes(data) {
    const tableId = "rendimientoTable"; // ID de la tabla
    const table = document.getElementById(tableId);
    
    // NUEVO: Asegurarnos de que el tfoot exista, si no, lo creamos.
    let tfoot = table.querySelector("tfoot");
    if (!tfoot) {
        tfoot = document.createElement("tfoot");
        table.appendChild(tfoot);
    }

    const tableHead = table.querySelector("thead");
    const tableBody = table.querySelector("tbody");

    // Limpiar la tabla antes de insertar nuevos datos
    tableHead.innerHTML = "<tr></tr>"; // Fila para los encabezados
    tableBody.innerHTML = "";
    tfoot.innerHTML = "<tr></tr>"; // NUEVO: Fila para los totales

    if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='99'>No hay datos disponibles</td></tr>";
        return;
    }

    // --- NUEVO: Calcular los totales antes de construir la tabla ---
    const totals = {};
    const columns = Object.keys(data[0]); // Obtener todas las columnas, incluido InicioSesionID

    // Inicializar totales en 0 para todas las columnas
    columns.forEach(col => {
        totals[col] = 0;
    });

    // Sumar los valores de cada fila a los totales
    data.forEach(row => {
        columns.forEach(col => {
            // Sumamos solo si la columna no es el ID del analista
            if (col !== "InicioSesionID" && col !== "Analista" && col !== "Apellido") {
                totals[col] += parseInt(row[col], 10) || 0;
            }
        });
    });
    // --- Fin del cálculo de totales ---

    // Generar encabezados de tabla dinámicos
    const headerRow = tableHead.querySelector("tr");
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });

    // NUEVO: Generar las celdas vacías del footer para que coincidan con los headers
    const footerRow = tfoot.querySelector("tr");
    columns.forEach(() => {
        const th = document.createElement("th");
        footerRow.appendChild(th);
    });

    // Insertar filas con los datos
    data.forEach(row => {
        const tr = document.createElement("tr");
        columns.forEach(col => {
            const td = document.createElement("td");
            if (col === "Total") {
                const link = document.createElement("a");
                link.href = `#`;
                link.textContent = row[col] || 0;
                link.style.cursor = "pointer";
                link.style.color = "#007bff";
                link.style.textDecoration = "underline";
                link.style.fontWeight = "bold";
                link.style.fontSize = "18px";
                link.addEventListener("click", function (e) {
                    e.preventDefault();
                    showHistoricoMes(row.InicioSesionID);
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
        language: { /* ... tu configuración de idioma ... */ },
        pageLength: 20,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        order: [[columns.indexOf('Total'), "DESC"]], // Ordenar por la columna Total

        // --- NUEVO: La función que dibuja los totales en el footer ---
        footerCallback: function (tfoot, data, start, end, display) {
            const api = this.api();

            api.columns().every(function (index) {
                const column = this;
                const headerText = $(column.header()).text();
                
                // Poner la etiqueta "TOTALES" en la primera columna visible
                if (index === 0) {
                    $(column.footer()).html('<strong>TOTALES</strong>');
                } 
                // Para el resto de las columnas, ponemos su total calculado
                else if (headerText !== "Analista" && headerText !== "Apellido") {
                    $(column.footer()).html('<strong>' + totals[headerText] + '</strong>');
                }
            });
        }
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
    // console.log('===== DETALLE TRÁMITES QUE VENCEN HOY =====');
    tramitesHoy.forEach(t => {
        // console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    });

    // console.log('===== DETALLE TRÁMITES VENCIDOS =====');
    tramitesVencidos.forEach(t => {
        // console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
    });

    // console.log('===== DETALLE TRÁMITES A VENCER =====');
    tramitesFuturos.forEach(t => {
        // console.log(`${t.NoTramite} | ${t.TipoTramite} | ${t.Dependencia} | ${t.Proveedor} | ${t.Concepto} | $${t.Importe}`);
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
    // console.log('Fecha original:', fecha);
    return `${nuevaFecha.getFullYear()}-${String(nuevaFecha.getMonth() + 1).padStart(2, '0')}-${String(nuevaFecha.getDate()).padStart(2, '0')}`;
}
// Función para generar y descargar el archivo Excel
// function exportToExcel() {
//     const table = document.querySelector("#tableTramites"); // Selecciona la tabla por su ID
//     if (table) { // Verifica si la tabla existe
//         const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" }); // Convierte la tabla en un libro de Excel
//         XLSX.writeFile(wb, "datos_oficios.xlsx"); // Descarga el archivo Excel con el nombre especificado
//     } else {
//         console.error("La tabla no existe en el DOM.");
//     }
// }
/**
 * Exporta el contenido de una tabla HTML a un archivo Excel.
 * @param {string} tableId - El ID del elemento <table> que se va a exportar.
 * @param {string} fileName - El nombre deseado para el archivo Excel (sin la extensión).
 */
function exportToExcel(tableId, fileName) {
    // 1. Selecciona la tabla usando el ID que se pasó como parámetro
    const table = document.getElementById(tableId);

    // 2. Verifica que la tabla exista en el DOM
    if (!table) {
        console.error(`Error: La tabla con el ID "${tableId}" no existe.`);
        return; // Detiene la ejecución si no se encuentra la tabla
    }

    // 3. Convierte la tabla en un libro de Excel
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });

    // 4. Descarga el archivo Excel con el nombre dinámico
    XLSX.writeFile(wb, `${fileName}.xlsx`);
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
function showTramitesDetails(filtro) {

    // parametros AnalistaID (int) o Estatus (string) Filtrado
    getTramites()
    // console.log('tramitesArray()', tramitesArray); 
    const tramitesDelMes = getMesActualNombre();
    let tramites = [];

    if (!isNaN(filtro)) {
        const numFiltro = Number(filtro);  // Convertir a número
        tramites = tramitesArray.filter(t =>
            t.AnalistaID === numFiltro && t.Mes === tramitesDelMes
        );
        // console.log(`Filtrando por AnalistaID = ${numFiltro} y Mes = ${tramitesDelMes}`, tramites);
    } else if (typeof filtro === "string") {
        tramites = tramitesArray.filter(t =>
            t.Estatus === filtro && t.Mes === tramitesDelMes
        );
        // console.log(`Filtrando por Estatus = "${filtro}" y Mes = ${tramitesDelMes}`, tramites);
    } else {
        // console.warn("⚠ Tipo de filtro no reconocido:", filtro);
    }



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
}
// Tabla de historico de trámites por mes
function showHistoricoMes(InicioSesionID) {
    const data = {
        InicioSesionID: InicioSesionID
    };

    // Obtener los trámites del analista
    fetch(Global.URL_BASE + 'getDetalleHistoricoMes', {
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

            // const tm = response.data filtrar por mes en que se encuentra el usuario
            const fechaActual = new Date();
            const mesActual = fechaActual.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
            const anioActual = fechaActual.getFullYear();
            const tramites = response.data.filter(tramite => {
                const fechaRecepcion = new Date(tramite.FechaRecepcion);
                return fechaRecepcion.getMonth() + 1 === mesActual && fechaRecepcion.getFullYear() === anioActual;
            });

            // const tramites = response.data; //acotar al mes en que se encuentra el usuario

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
            // console.error('Error al obtener los trámites:', error);
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
// Funcion Mes Actual Nombre
function getMesActualNombre() {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const mesActual = new Date().getMonth(); // 0-based (0 = Enero)
    return meses[mesActual];
}
// Función para obtener la lista de trámites REZAGADOS desde la API
function getTramitesRezagados() {
    // Calcular el mes actual
    const mesActual = getMesActualNombre();
    // Payload para la consulta específica de trámites rezagados
    const payload = {
        "mes": mesActual, // Puedes hacer estos valores dinámicos si lo necesitas
        "dias": 3,
        "estatus": [
            "Turnado", "Remesa", "Creado",
            "Devuelto", "Rechazado", "Observaciones",
            "RegistradoSAP", "RemesaAprobada", "OdenPago"
        ]
    };

    // Usamos la variable Global.URL_BASE que ya tienes definida
    fetch(Global.URL_BASE + 'consultarTramitesRezagados', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.data && Array.isArray(result.data)) {
                // Llamamos a la función para pintar la tabla de rezagados
                actualizarTablaRezagados(result.data, 'tramitesRezagados');
            } else {
                console.error('La respuesta para trámites rezagados no contiene un array en "data".', result);
            }
        })
        .catch(error => {
            console.error('Error al obtener los trámites rezagados:', error);
            // alert(`Error al obtener los trámites rezagados: ${error.message}`);
        });
}
// Función para actualizar la tabla de trámites REZAGADOS
function actualizarTablaRezagados(data, tableId) {
    if (!Array.isArray(data)) {
        // console.error("Error: Los datos para la tabla de rezagados no son un array.", data);
        return;
    }

    // Si la tabla DataTable ya existe, la destruimos para poder reinicializarla
    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().clear().destroy();
    }

    // Obtenemos las columnas dinámicamente a partir de los datos recibidos
    const columns = data.length > 0
        ? Object.keys(data[0]).map(key => ({ data: key, title: key }))
        : [];

    // Inicializamos DataTable con una configuración similar a tus otras tablas
    $(`#${tableId}`).DataTable({
        data: data,
        columns: columns,
        pageLength: 10,
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "Todos"]],
        responsive: true,
        searching: true,
        ordering: true,
        info: true,
        language: { // Usamos la misma configuración de idioma que tus otras tablas
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "No hay datos disponibles en la tabla",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            }
        }
    });
}
// Función para obtener los datos de la Estimación de Liquidez
function getEstimacionLiquidez() {
    // Calcular el mes actual
    const mesActual = getMesActualNombre();
    const payload = {
        "mes": mesActual, // O puedes obtenerlo de un filtro
        "estatus": ["Creado", "Turnado", "RegistradoSAP", "Remesa", "RemesaAprobada", "Observaciones", "Devuelto", "Rechazado"],
        "tipoTramite": ["OP", "OPO", "SRF"]
    };

    fetch(Global.URL_BASE + 'estimacionLiquidez', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(result => {
            if (result.data && Array.isArray(result.data)) {
                renderTablaEstimacion(result.data, 'tablaEstimacion');
            } else {
                // console.error('La respuesta de estimacionLiquidez no es válida.', result);
            }
        })
        .catch(error => console.error('Error al obtener la estimación de liquidez:', error));
}
/**
 * Renderiza la tabla de Estimación de Liquidez usando datos anidados
 * y creando columnas dinámicas para cada fondo.
 * @param {Array} data El array de trámites desde la API.
 * @param {string} tableId El ID del <table> donde se renderizará.
 */
// function renderTablaEstimacion(data, tableId) {
//     const tableElement = $(`#${tableId}`);
//     if (!Array.isArray(data)) {
//         // console.error("Error: Los datos para la tabla no son un array.", data);
//         return;
//     }
//     // Si la tabla DataTable ya existe, la destruimos
//     if ($.fn.DataTable.isDataTable(tableElement)) {
//         tableElement.DataTable().clear().destroy();
//     }
//     // Vaciamos el HTML para asegurarnos de que no hay encabezados viejos
//     tableElement.empty();
//     if (data.length === 0) {
//         tableElement.html('<tbody><tr><td>No hay datos disponibles.</td></tr></tbody>');
//         return;
//     }
//     // --- Lógica para construir la tabla dinámicamente ---
//     // 1. Descubrir todas las columnas posibles
//     const standardKeys = new Set();
//     const fundKeys = new Set();
//     data.forEach(row => {
//         // Añadir claves estándar (todas excepto 'Fondos')
//         Object.keys(row).forEach(key => {
//             if (key !== 'Fondos') standardKeys.add(key);
//         });
//         // Añadir claves de los fondos desde el objeto anidado
//         if (row.Fondos && typeof row.Fondos === 'object') {
//             Object.keys(row.Fondos).forEach(fundKey => fundKeys.add(fundKey));
//         }
//     });
//     // 2. Definir el orden final y construir las columnas para DataTables
//     const desiredOrder = ['ID_CONTRATO', 'Secretaria', 'Proveedor', 'Concepto', 'Estatus', 'Mes', 'TipoTramite', 'Analista', 'Importe'];
//     const orderedFunds = Array.from(fundKeys).sort();
//     // Combinamos el orden deseado con los fondos descubiertos
//     const finalHeaders = [...desiredOrder, ...orderedFunds];
//     // 3. Crear la configuración de columnas para DataTables
//     const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
//     const dataTableColumns = finalHeaders.map(header => {
//         // Caso especial para la columna calculada "Analista"
//         if (header === 'Analista') {
//             return {
//                 title: 'Analista',
//                 data: null,
//                 render: (data, type, row) => `${row.NombreUser || ''} ${row.ApellidoUser || ''}`
//             };
//         }
//         // Caso para columnas de Fondos
//         if (header.startsWith('F')) {
//             return {
//                 title: header,
//                 data: `Fondos.${header}`,
//                 defaultContent: '$0.00',
//                 render: (data) => (data && !isNaN(data)) ? formatoMoneda.format(data) : '$0.00'
//             };
//         }
//         // Caso para la columna Importe (para formatear moneda)
//         if (header === 'Importe') {
//             return {
//                 title: 'Importe',
//                 data: 'Importe',
//                 render: (data) => formatoMoneda.format(data)
//             };
//         }
//         // Caso para todas las demás columnas estándar
//         return {
//             title: header,
//             data: header
//         };
//     });
//     // 4. Inicializar DataTables
//     tableElement.DataTable({
//         data: data,
//         columns: dataTableColumns,
//         pageLength: 10,
//         scrollX: true, // Importante para tablas anchas
//         responsive: true,
//         // ...Pega aquí el resto de tu configuración de language, lengthMenu, etc.
//         language: {
//             search: "Buscar:",
//             lengthMenu: "Mostrar _MENU_ registros",
//             info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
//             infoEmpty: "Mostrando 0 a 0 de 0 registros",
//             zeroRecords: "No se encontraron resultados",
//             paginate: {
//                 first: "Primero",
//                 previous: "Anterior",
//                 next: "Siguiente",
//                 last: "Último"
//             }
//         }
//     });
// }
function renderTablaEstimacion(data, tableId) {
    const tableElement = $(`#${tableId}`);

    if (!Array.isArray(data)) {
        return;
    }

    if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().clear().destroy();
    }
    tableElement.empty(); // Se vacía la tabla para reconstruir <thead> y <tfoot>

    if (data.length === 0) {
        tableElement.html('<tbody><tr><td colspan="100%">No hay datos disponibles.</td></tr></tbody>'); // colspan al 100%
        return;
    }

    // --- Lógica para construir la tabla dinámicamente ---

    const standardKeys = new Set();
    const fundKeys = new Set();

    // --- NUEVO: Inicialización de variables para los totales ---
    let totalImporte = 0;
    const totalesFondos = {};

    data.forEach(row => {
        Object.keys(row).forEach(key => {
            if (key !== 'Fondos') standardKeys.add(key);
        });
        if (row.Fondos && typeof row.Fondos === 'object') {
            Object.keys(row.Fondos).forEach(fundKey => {
                fundKeys.add(fundKey);
                // --- NUEVO: Acumular totales de los fondos ---
                totalesFondos[fundKey] = (totalesFondos[fundKey] || 0) + (parseFloat(row.Fondos[fundKey]) || 0);
            });
        }
        // --- NUEVO: Acumular total del Importe ---
        totalImporte += parseFloat(row.Importe) || 0;
    });

    const desiredOrder = ['ID_CONTRATO', 'Secretaria', 'Proveedor', 'Concepto', 'Estatus', 'Mes', 'TipoTramite', 'Analista', 'Importe'];
    const orderedFunds = Array.from(fundKeys).sort();
    const finalHeaders = [...desiredOrder, ...orderedFunds];
    const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

    // --- NUEVO: Construir el HTML de la tabla con thead y tfoot ---
    const headerRow = `<tr>${finalHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`;
    const footerRow = `<tr>${finalHeaders.map(() => `<th></th>`).join('')}</tr>`; // Celdas vacías para el pie
    tableElement.html(`<thead>${headerRow}</thead><tbody></tbody><tfoot>${footerRow}</tfoot>`);


    const dataTableColumns = finalHeaders.map(header => {
        if (header === 'Analista') {
            return {
                title: 'Analista',
                data: null, // No se necesita, se usa render
                render: (data, type, row) => `${row.NombreUser || ''} ${row.ApellidoUser || ''}`
            };
        }
        if (header.startsWith('F')) {
            return {
                title: header,
                data: `Fondos.${header}`,
                defaultContent: '$0.00',
                render: (data) => (data && !isNaN(data)) ? formatoMoneda.format(data) : '$0.00'
            };
        }
        if (header === 'Importe') {
            return {
                title: 'Importe',
                data: 'Importe',
                render: (data) => formatoMoneda.format(data)
            };
        }
        return {
            title: header, // El title ya se puso en el <th>, pero es buena práctica mantenerlo
            data: header
        };
    });

    tableElement.DataTable({
        data: data,
        columns: dataTableColumns,
        pageLength: 800,
        scrollX: true,
        responsive: true,
        language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            zeroRecords: "No se encontraron resultados",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            }
        },

        // --- NUEVO: footerCallback para dibujar los totales ---
        footerCallback: function (tfoot, data, start, end, display) {
            const api = this.api();

            // Itera sobre cada columna visible para poner el total correspondiente
            api.columns().every(function () {
                const columnIndex = this.index();
                const headerText = $(this.header()).text(); // Obtiene el nombre de la columna

                let totalValue = null;

                if (headerText === 'Importe') {
                    totalValue = totalImporte;
                } else if (totalesFondos.hasOwnProperty(headerText)) {
                    totalValue = totalesFondos[headerText];
                }

                // Si encontramos un total para esta columna, lo formateamos y lo escribimos
                if (totalValue !== null) {
                    $(this.footer()).html(formatoMoneda.format(totalValue));
                }
            });

            // Poner una etiqueta en la primera columna del footer
            // Buscamos la columna 'ID_CONTRATO' para poner la etiqueta "TOTAL"
            const idColIndex = finalHeaders.indexOf('ID_CONTRATO');
            if (idColIndex !== -1) {
                $(api.column(idColIndex).footer()).html('<strong>TOTALES</strong>');
            }
        }
    });
}
/**
 * Verifica la fecha actual y deshabilita el botón "Nuevo Trámite"
 * si se ha pasado la fecha de corte mensual.
 */
function gestionarEstadoBotonNuevoTramite() {
    // Día del mes para el cierre. Puedes ajustar este valor si es necesario.
    const DIA_DE_CIERRE = 25;

    // Obtenemos la fecha y día actual desde el navegador del cliente.
    const hoy = new Date();
    const diaActual = hoy.getDate(); // Devuelve el día del mes (1-31)

    // Obtenemos la referencia al botón por su nuevo ID.
    const botonNuevoTramite = document.getElementById('btn-nuevo-tramite');

    // Si el botón no existe en la página, no hacemos nada.
    if (!botonNuevoTramite) {
        return;
    }

    // Comparamos el día actual con el día de cierre.
    // Si hoy es día 25 o superior, deshabilitamos el botón.
    if (diaActual >= DIA_DE_CIERRE) {
        // En enlaces <a>, la clase 'disabled' de Bootstrap previene clics y cambia el estilo.
        botonNuevoTramite.classList.add('disabled');

        // Es una buena práctica añadir un 'title' para informar al usuario por qué está deshabilitado.
        botonNuevoTramite.setAttribute('title', 'La creación de nuevos trámites está cerrada por fin de mes.');

        // También es bueno para la accesibilidad.
        botonNuevoTramite.setAttribute('aria-disabled', 'true');
    }
}



window.modificarTramite = modificarTramite;
window.eliminarTramite = eliminarTramite;
window.generarQR = generarQR;
window.mostrarComentario = mostrarComentario;
window.turnarTramite = turnarTramite;
window.createRemesa = createRemesa;
window.editarTramite = editarTramite;