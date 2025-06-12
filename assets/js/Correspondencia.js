// Oficios.js
import Global from './funcionesGlobales.js';
//console.log(Global.holaMundo());

// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Declarar una variable global
let dataOficios;

// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    // Funcion para cargar la app   
    cargarApp();
    // Evento para validar el formulario de creación de oficios
    const formCrearOficios = document.getElementById("formCrearOficios");
    if (formCrearOficios) {
        formCrearOficios.addEventListener("submit", function (e) {
            e.preventDefault(); // ✅ evita el envío automático
            const formData = new FormData(formCrearOficios);
            // ⚠️ Interrumpir si la validación falla
            const esValido = validarArchivoPDF("formOficioAnalistaScaneoFirmas", "Archivo");
            if (!esValido) return;
            crearOficioArchivo(formData);
            setTimeout(() => {
                window.location.href = "CorrespondenciaPanelControl.html";
            }, 3000); // 5 segundos 
        });
    }
    // Evento para validar el formulario de turnado de oficios
    const formTurnarOficio = document.getElementById("formTurnarOficio");
    if (formTurnarOficio) {
        // Primero se obtiene el id del oficio
        const urlParams = new URLSearchParams(window.location.search);
        const oficioID = urlParams.get('id');
        // Llenar el formulario con los datos del oficio
        document.getElementById("ID").value = oficioID;

        formTurnarOficio.addEventListener("submit", function (e) {
            e.preventDefault(); // ✅ evita el envío automático
            const formData = new FormData(formTurnarOficio);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            actualizarOficio(data);
            setTimeout(() => {
                window.location.href = "CorrespondenciaPanelControl.html";
            }, 3000); // 5 segundos
        });
    }

    // Referencia al botón de limpiar filtros
    const btnLimpiar = document.getElementById("btn-limpiar");
    // Referencia al botón de filtrar trámites
    const btnFiltrar = document.getElementById("btn-filtrar");
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
            const filtrosIniciales = {
                ID: '',
                Folio: '',
                FechaRecepcion: '',
                Solicitante: '',
                Dependencia: '',
                Departamento: '',
                NumeroOficio: '',
                tipoOficio: '',
                Asunto: '',
                Concepto: '',
                Monto: '',
                FechaVencimiento: '',
                Turnado: '',
                RespuestaConocimiento: '',
                FechaRetroactiva: '',
                Estado: '',
                FechaCreacion: '',
                UsuarioRegistro: '',
                Comentarios: '',
                ArchivoScaneado: '',
                FechaEntregaAcuse: '',
                FechaLimitePago: ''
            };
            filtrarTramites(filtrosIniciales);
        });
    }
    // Filtrar trámites
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function () {
            // Definir todos los filtros con su tipo
            const filterConfig = [
                { id: 'ID', type: 'text' },
                { id: 'Folio', type: 'text' },
                { id: 'FechaRecepcion', type: 'date' },
                { id: 'Solicitante', type: 'text' },
                { id: 'Dependencia', type: 'text' },
                { id: 'Departamento', type: 'text' },
                { id: 'NumeroOficio', type: 'text' },
                { id: 'tipoOficio', type: 'select' },
                { id: 'Asunto', type: 'text' },
                { id: 'Concepto', type: 'text' },
                { id: 'Monto', type: 'number' },
                { id: 'FechaVencimiento', type: 'date' },
                { id: 'Turnado', type: 'text' },
                { id: 'RespuestaConocimiento', type: 'text' },
                { id: 'FechaRetroactiva', type: 'date' },
                { id: 'Estado', type: 'select' },
                { id: 'FechaCreacion', type: 'datetime-local' },
                { id: 'UsuarioRegistro', type: 'text' },
                { id: 'Comentarios', type: 'text' },
                { id: 'ArchivoScaneado', type: 'text' },
                { id: 'FechaEntregaAcuse', type: 'date' },
                { id: 'FechaLimitePago', type: 'datetime-local' }
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
});
// Funcion para cargar la app
async function cargarApp() {
    // Obtener oficios
    await listarOficios();
    // Verifica si existe la tabla de oficios
    const tableOficios = document.getElementById("tableOficios");
    if (tableOficios) {
        // Llenar tabla de oficios
        llenarTablaOficios(dataOficios, "tableOficios");
    }
    // Verifica si existe la tabla de oficios analista
    const tableOficiosAnalista = document.getElementById("tableOficiosAnalista");
    if (tableOficiosAnalista) {
        // Obtener el usuario logueado de localStorage
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const usuarioID = usuario.InicioSesionID;
        // console.log('usuarioID: ', usuarioID);
        //Filtrar dataOficios por usuario
        const dataOficiosAnalista = dataOficios.filter(oficio => oficio.Turnado === String(usuarioID));
        // Llenar tabla de oficios analista
        llenarTablaOficios(dataOficiosAnalista, "tableOficiosAnalista");
    }
    // Verifica si el botón existe crear downloadExcelSuficiencias
    const downloadButton = document.getElementById("descargarExcelOficios");
    if (downloadButton) {
        downloadButton.addEventListener("click", () => exportToExcel("tableOficios"));
    }
    const downloadButtonAnalista = document.getElementById("descargarExcelOficiosAnalista");
    if (downloadButtonAnalista) {
        downloadButtonAnalista.addEventListener("click", () => exportToExcel("tableOficiosAnalista"));
    }
    // Verifica si el botón existe crear oficio
    const crearOficio = document.getElementById("crearOficio");
    if (crearOficio) {
        crearOficio.addEventListener("click", () => {
            window.location.href = "CorrespondenciaCrear.html";
        });
    }
    // Evento para validar el formulario de edición de oficios
    const formEditarOficios = document.getElementById("formEditarOficios");
    if (formEditarOficios) {
        // Primero se obtiene el id del oficio
        const urlParams = new URLSearchParams(window.location.search);
        const oficioID = urlParams.get('id');
        // Llenar el formulario con los datos del oficio
        llenarformEditarOficios(oficioID);
        document.getElementById("Comentarios").value = "";
        formEditarOficios.addEventListener("submit", function (e) {
            e.preventDefault(); // ✅ evita el envío automático
            const formData = new FormData(formEditarOficios);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            actualizarOficio(data);
            setTimeout(() => {
                window.location.href = "CorrespondenciaPanelControl.html";
            }, 3000); // 5 segundos
        });
    }
    // Verifica si existe el formulario formOficioAnalistaActualizar
    const formOficioAnalistaActualizar = document.getElementById("formOficioAnalistaActualizar");
    if (formOficioAnalistaActualizar) {
        const urlParams = new URLSearchParams(window.location.search);
        const oficioID = urlParams.get('id');
        document.getElementById("ID").value = oficioID;

        llenarformEditarOficios(oficioID);
        document.getElementById("Comentarios").value = "";
        logicaEstatusTarjetaInformativa();


        formOficioAnalistaActualizar.addEventListener("submit", function (e) {
            e.preventDefault(); // ✅ evita el envío automático
            const formData = new FormData(formOficioAnalistaActualizar);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            actualizarOficio(data);
            setTimeout(() => {
                window.location.href = "CorrespondenciaPanelAnalista.html";
            }, 3000); // 5 segundos

        });
    }
    // Verifica si existe la tabla tableOficiosAnalistaArchivo
    const tableOficiosAnalistaArchivo = document.getElementById("tableOficiosAnalistaArchivo");
    if (tableOficiosAnalistaArchivo) {
        // Obtener el usuario logueado de localStorage
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const RolUser = usuario.RolUser;
        const DepartamentoUser = usuario.DepartamentoUser;
        // SI EL USUARIO ES ANALISTA Y TRAMITE FILTRAR POR PROCESO-FIRMA-TITULAR
        if (RolUser === "Analista" && DepartamentoUser === "Tramite") {
            //Filtrar dataOficios por usuario
            const dataOficiosAnalistaArchivo = dataOficios.filter(oficio => oficio.Estado === "PROCESO-FIRMA-TITULAR");
            // Llenar tabla de oficios analista archivo
            llenarTablaOficios(dataOficiosAnalistaArchivo, "tableOficiosAnalistaArchivo");
        }
    }
    // Verifica si existe la formOficioAnalistaScaneoFirmas
    const formOficioAnalistaScaneoFirmas = document.getElementById("formOficioAnalistaScaneoFirmas");
    if (formOficioAnalistaScaneoFirmas) {
        const urlParams = new URLSearchParams(window.location.search);
        const oficioID = urlParams.get('id');
        document.getElementById("ID").value = oficioID;

        llenarformEditarOficios(oficioID);

        formOficioAnalistaScaneoFirmas.addEventListener("submit", function (e) {
            e.preventDefault(); // ✅ evita el envío automático
            const formData = new FormData(formOficioAnalistaScaneoFirmas);

            // ⚠️ Interrumpir si la validación falla
            const esValido = validarArchivoPDF("formOficioAnalistaScaneoFirmas", "Archivo");
            if (!esValido) return;

            // ✅ Continúa si todo está bien
            actualizarOficio(formData);
            setTimeout(() => {
                window.location.href = "CorrespondenciaPanelControl.html";
            }, 3000); // 5 segundos 
        });
    }


    // Evento para validar el formulario de ver correspondencia
    const formVerCorrespondencia = document.getElementById("formVerCorrespondencia");
    if (formVerCorrespondencia) {
        const urlParams = new URLSearchParams(window.location.search);
        const correspondenciaID = urlParams.get('id');
        // Llenar el formulario con los datos del contestacion
        llenarformEditarCorrespondencia(correspondenciaID);
    }
}
// Funcion para obtener los oficios
async function listarOficios() {
    let resOficios = await fetch(URL_BASE + 'listarOficios');
    let jsonOficios = await resOficios.json();
    // Guardar respuesta en variable global
    dataOficios = jsonOficios.data;
    //console.log('Correspondencia: ', dataOficios);
}
// Función para llenar la tabla de oficios
function llenarTablaOficios(data, tableId) {
    // console.log('dataff: ', data);
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
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && usuario.RolUser === "Admin" || usuario.RolUser === "Oficios") {
                        // BTN ACTUALIZAR
                        botones += `<button class="btn-icon primary" title="Actualizar" onclick="window.location.href='CorrespondenciaEditar.html?id=' + ${data.ID}"><i class="fas fa-edit"></i></button>`;
                    }
                    if (usuario && usuario.RolUser === "Admin") {
                        // BTN ELIMINAR
                        botones += `<button class="btn-icon primary" title="Eliminar" onclick="eliminarOficio(${data.ID})"><i class="fas fa-trash"></i></button>`;
                    }
                    if (data.Estado === "CREADO" && usuario.RolUser === "Oficios") {
                        // BTN TURNAR
                        botones += `<button class="btn-icon primary" title="Turnar" onclick="window.location.href='CorrespondenciaTurnado.html?id=' + ${data.ID}"><i class="fa-solid fa-person-walking-arrow-loop-left"></i></button>`;
                        //RESULTADO DE LA VISTA OFICIOTURNADO = OBSERVACIONES, DEVUELTO O PROCESO-FIRMA-TITULAR
                    }
                    if (data.Estado === "PROCESO-FIRMA-TITULAR" && usuario.RolUser === "Oficios") {
                        // BTN ESCANEAR
                        botones += `<button class="btn-icon primary" title="Escanear" onclick="window.location.href='CorrespondenciaScaneoFirmas.html?id=' + ${data.ID}"><i class="fas fa-file-import"></i></button>`;
                        //RESULTADO DE LA VISTA OFICIOSCANEOFIRMAS = ESCANEO-FIRMAS
                    }
                    if (data.Estado === "ACUSE-EXPEDIENTE" && usuario.RolUser === "Oficios") {
                        // BTN ARCHIVAR
                        botones += `<button class="btn-icon primary" title="Archivar" onclick="window.location.href='CorrespondenciaEditar.html?id=' + ${data.ID}"><i class="fa-solid fa-box-archive"></i></button>`;
                        //RESULTADO DE LA VISTA OFICIOARCHIVADO = ARCHIVADO
                    }
                    if (data.Estado === "TURNADO" || data.Estado === "OBSERVACIONES" || data.Estado === "DEVUELTO") {
                        // BTN FIRMA TITULAR
                        botones += `<button class="btn-icon primary" title="Firma Titular" onclick="window.location.href='CorrespondenciaAnalistaActualizar.html?id=' + ${data.ID}"><i class="fas fa-file-signature"></i></button>`;
                    }
                    // BTN de ver
                    botones += `<button class="btn-icon primary" title="Ver Detalles" onclick="window.location.href='CorrespondenciaVer.html?id=' + ${data.ID}"><i class="fas fa-eye"></i></button>`;
                    // BTN COMENTARIOS
                    const comentarioEscapado = encodeURIComponent(data.Comentarios || "");
                    botones += `<button class="btn-icon primary" title="Comentarios" onclick="mostrarComentario('${comentarioEscapado}')"><i class="fas fa-comment-dots"></i></button>`;
                    // BTN VER ARCHIVO ESCANEADO
                    const archivo = data.ArchivoScaneado || "N/A";
                    if (archivo !== "N/A" && archivo !== "Array") {
                        const basePath = 'assets/uploads/Correspondencia/';
                        botones += `<button class="btn-icon primary" title="Ver archivo" onclick="window.open('${basePath}${archivo}', '_blank')"><i class="fas fa-file-pdf"></i></button>`;
                    }
                    return botones;
                }
            },
            { data: "ID" },
            { data: "Folio" },
            { data: "NumeroOficio" },
            { data: "FechaCreacion" },
            { data: "FechaRecepcion" },
            { data: "FechaRetroactiva" },
            { data: "FechaVencimiento" },
            { data: "tipoOficio" },
            { data: "Estado" },
            { data: "TurnadoNombreCompleto" },
            { data: "Dependencia" },
            { data: "Solicitante" },
            { data: "Departamento" },
            { data: "Asunto" },
            { data: "Concepto" },
            {
                data: "Monto",
                render: function (data) {
                    return data ? formatoMoneda.format(data) : "$0.00";
                }
            },
            { data: "RespuestaConocimiento" },
            { data: "UsuarioRegistroNombreCompleto" }
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
        order: [[4, "DESC"]],
    });
}
// Función para generar y descargar el archivo Excel
function exportToExcel(tableId) {
    const table = document.querySelector(`#${tableId}`); // Usamos el ID dinámico
    if (table) { // Verifica si la tabla existe
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" }); // Convierte la tabla en un libro de Excel
        XLSX.writeFile(wb, "datos_oficios.xlsx"); // Descarga el archivo Excel con el nombre especificado
    } else {
        console.error("La tabla no existe en el DOM.");
    }
}
// Función para crear un oficio
function crearOficio(data) {
    //console.log('crearOficioData:', data);

    fetch(URL_BASE + 'crearOficio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
        })
        .then(res => {
            //console.log('Respuesta del servidor:', res);

            // 🔍 Aquí se arregla: extraer mensaje del objeto 'data'
            let responseData = res.data;
            if (typeof responseData === 'string') {
                responseData = JSON.parse(responseData);
            }

            if (responseData.message === "Oficio creado correctamente") {
                //console.log('Oficio creado correctamente');
                window.location.href = "CorrespondenciaPanelControl.html";
            } else {
                alert("Error al crear el oficio: " + (responseData.error || "Error desconocido"));
            }
        })
        .catch(error => {
            console.error("Error al crear el oficio:", error);
            alert("Error de red o del servidor: " + error.message);
        });
}
// Función para llenar el formulario de edición de oficios
function setValueIfExists(id, value) {
    const input = document.getElementById(id);
    if (input) {
        input.value = value || '';
    }
}
// Función para llenar el formulario de edición de oficios
function llenarformEditarOficios(oficioID) {
    const idNumerico = Number(oficioID);
    const oficio = dataOficios.find(oficio => oficio.ID === idNumerico);
    // console.log('oficio: ', oficio);
    if (!oficio) {
        console.error("No se encontró el oficio con ID:", oficioID);
        return;
    }

    // Llenar cada campo del formulario
    // Usar función segura para asignar valores
    setValueIfExists("ID", oficio.ID);
    setValueIfExists("Folio", oficio.Folio);
    setValueIfExists("FechaRecepcion", oficio.FechaRecepcion);
    setValueIfExists("Solicitante", oficio.Solicitante);
    setValueIfExists("Dependencia", oficio.Dependencia);
    setValueIfExists("Departamento", oficio.Departamento);
    setValueIfExists("NumeroOficio", oficio.NumeroOficio);
    setValueIfExists("tipoOficio", oficio.tipoOficio);
    setValueIfExists("Asunto", oficio.Asunto);
    setValueIfExists("Concepto", oficio.Concepto);
    setValueIfExists("Monto", oficio.Monto);
    setValueIfExists("FechaVencimiento", oficio.FechaVencimiento?.substring(0, 10));
    setValueIfExists("Turnado", oficio.Turnado);
    setValueIfExists("RespuestaConocimiento", oficio.RespuestaConocimiento);
    setValueIfExists("FechaRetroactiva", oficio.FechaRetroactiva?.substring(0, 10));
    setValueIfExists("Estado", oficio.Estado);
    setValueIfExists("UsuarioRegistro", oficio.UsuarioRegistro);
    setValueIfExists("Comentarios", oficio.Comentarios);
    setValueIfExists("FechaEntregaAcuse", oficio.FechaEntregaAcuse?.substring(0, 10));
    setValueIfExists("FKOficio", oficio.FKOficio);
}
// Función para actualizar un oficio
function actualizarOficio(data) {
    const fetchOptions = {
        method: 'POST',
        body: data // ✅ Si es FormData, no uses JSON.stringify
    };

    // Solo añadir headers si es JSON
    if (!(data instanceof FormData)) {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify(data);
    }

    fetch(URL_BASE + 'actualizarOficioArchivo', fetchOptions)
        .then(async response => {
            const text = await response.text();
            try {
                const json = JSON.parse(text);
                alert(json.message || "✅ Actualización exitosa");
                return json;
            } catch (err) {
                console.warn("⚠ Respuesta no JSON:", text);
                alert("⚠ Respuesta inesperada del servidor:\n" + text);
                return { success: false, message: text };
            }
        })
        .catch(error => {
            alert("❌ Error de red:\n" + error.message);
            return { success: false, message: error.message };
        });
}
// Eliminar oficio por id
window.eliminarOficio = function (id) {
    //console.log('Eliminar oficio:', id);
    try {
        // Confirmación del usuario antes de eliminar
        const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este registro? \n\nEsta acción no se puede deshacer.");
        if (!confirmDelete) {
            return; // Si el usuario cancela, salimos de la función
        }
        const data = {
            ID: id
        };
        // Realizar la solicitud para eliminar el registro
        fetch(URL_BASE + 'eliminarOficio', {
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
                //recargar la pagina
                window.location.reload();
            })
            .catch(error => {
                console.error('Error al eliminar el oficio:', error.message);
            });
    } catch (error) {
        console.error("Error al eliminar el registro:", error);
        alert("Ocurrió un error al intentar eliminar el registro.");
    }
}
// Funcion para logica de estatus y tarjeta informativa
function logicaEstatusTarjetaInformativa() {
    const selectEstatus = document.getElementById('Estado');
    const grupoRespuestaConocimiento = document.getElementById('grupoRespuestaConocimiento');
    const botonWhatsApp = document.getElementById('enviarWhatsApp');

    // Evento de cambio del estatus
    selectEstatus.addEventListener('change', function () {
        const estatus = this.value;

        // Mostrar/ocultar campo SAP
        grupoRespuestaConocimiento.hidden = estatus !== 'PROCESO-FIRMA-TITULAR';

        // Mostrar/ocultar botón de WhatsApp
        botonWhatsApp.hidden = !['DEVUELTO', 'OBSERVACIONES'].includes(estatus);
    });

    // Evento del botón de WhatsApp
    botonWhatsApp.addEventListener('click', () => {
        const mensaje = `
                                    🔹 TARJETA INFORMATIVA OFICIOS🔹
                                        👤 Analista: ${document.getElementById('Turnado')?.value || 'N/A'}
                                        📌 ID Oficio: ${document.getElementById('ID')?.value || 'N/A'}
                                        🏛 Institución: ${document.getElementById('Dependencia')?.value || 'N/A'}
                                        👤 Solicitante: ${document.getElementById('Solicitante')?.value || 'N/A'}
                                        📄 Concepto: ${document.getElementById('Concepto')?.value || 'N/A'}
                                        💰 Monto: ${document.getElementById('Monto')?.value || 'N/A'}
                                        📄 Estatus: ${document.getElementById('Estado')?.value || "N/A"}
                                        ⏳ Fecha de Recepción: ${document.getElementById('FechaRecepcion')?.value || "N/A"}
                                        ⏳ Fecha de Vencimiento: ${document.getElementById('FechaVencimiento')?.value || "N/A"}
                                        ⚠ Acción Requerida: ${document.getElementById('Comentarios')?.value || 'Sin comentarios'}
                                        
                                        ✅ Solicito apoyo para seguimiento.
                                `.trim();

        navigator.clipboard.writeText(mensaje).then(() => {
            alert('Mensaje copiado al portapapeles. Al abrir el grupo, pega el mensaje directamente.');
            window.open('https://chat.whatsapp.com/DqWPIzn1J8lIoPGZmMTrQ2', '_blank');
        }).catch(() => {
            alert('Error al copiar. Por favor, copia manualmente el mensaje.');
            window.open('https://chat.whatsapp.com/DqWPIzn1J8lIoPGZmMTrQ2', '_blank');
        });
    });
}
function validarArchivoPDF(formularioId, archivoInputId) {
    const archivoInput = document.getElementById(archivoInputId);
    const archivo = archivoInput?.files?.[0];

    if (!archivo) {
        alert('⚠ Por favor selecciona un archivo antes de continuar.');
        return false;
    }

    const extensionValida = archivo.name.toLowerCase().endsWith('.pdf');
    if (!extensionValida) {
        alert('❌ El archivo debe ser un PDF (.pdf).');
        return false;
    }

    const maxSize = 3 * 1024 * 1024; // 3 MB
    if (archivo.size > maxSize) {
        alert('❌ El archivo supera el tamaño máximo permitido de 3 MB.');
        return false;
    }

    //console.log('✅ Validación de archivo PDF exitosa');
    return true;
}
// Función para crear un oficio
function crearOficioArchivo(data) {
    const fetchOptions = {
        method: 'POST',
        body: data // ✅ Si es FormData, no uses JSON.stringify
    };

    // Solo añadir headers si es JSON
    if (!(data instanceof FormData)) {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify(data);
    }

    fetch(URL_BASE + 'crearOficioArchivo', fetchOptions)
        .then(async response => {
            const text = await response.text();
            try {
                const json = JSON.parse(text);
                alert(json.message || "Registro de oficio.");
                return json;
            } catch (err) {
                console.warn("⚠ Respuesta no JSON:", text);
                alert("⚠ Respuesta inesperada del servidor:\n" + text);
                return { success: false, message: text };
            }
        })
        .catch(error => {
            alert("❌ Error de red:\n" + error.message);
            return { success: false, message: error.message };
        });
}
// Mostrar comentario en modal
function mostrarComentario(comentario) {
    const comentarioDecoded = decodeURIComponent(comentario);
    let htmlContenido = '';

    try {
        const comentarios = JSON.parse(comentarioDecoded);

        if (Array.isArray(comentarios)) {
            htmlContenido = comentarios.map(entry => {
                return `
                    <div class="comentario-card mb-3 p-3 border rounded shadow-sm">
                        ${entry.ID_CONTRATO ? `<div><strong># Contrato:</strong> ${entry.ID_CONTRATO}</div>` : ''}
                        <div><strong>Fecha:</strong> ${entry.Fecha || 'N/A'}</div>
                        <div><strong>Estatus:</strong> ${entry.Estatus || 'N/A'}</div>
                        ${entry.Modificado_Por ? `<div><strong>Modificado Por:</strong> ${entry.Modificado_Por}</div>` : ''}
                        ${entry.Usuario ? `<div><strong>Usuario:</strong> ${entry.Usuario}</div>` : ''}
                        <div><strong>Comentario:</strong><br><div class="comentario-texto">${entry.Comentario || 'Sin comentario'}</div></div>
                    </div>
                `;
            }).join('');
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
// Filtrar trámites por estado
function filtrarTramites(filtros) {
    let base = dataOficios;
    console.log('Datos en Memoria:', base);

    const mapaCampos = {
        Solicitante: 'Solicitante',
        Asunto: 'Asunto',
        Concepto: 'Concepto',
        Comentarios: 'Comentarios'
    };

    const camposExactos = [
        'ID', 'Folio', 'FechaRecepcion', 'Dependencia', 'Departamento', 'NumeroOficio',
        'tipoOficio', 'Monto', 'FechaVencimiento', 'Turnado', 'RespuestaConocimiento',
        'FechaRetroactiva', 'Estado', 'FechaCreacion', 'UsuarioRegistro', 'ArchivoScaneado',
        'FechaEntregaAcuse', 'FechaLimitePago'
    ];

    const filtrados = base.filter(tramite => {
        for (let campo in filtros) {
            const valorFiltro = filtros[campo];
            if (valorFiltro === '' || valorFiltro === 'Todos') continue;

            const campoReal = mapaCampos[campo] || campo;
            const valorTramite = tramite[campoReal];

            // Comparación numérica
            if (campo === 'Monto') {
                if (parseFloat(valorTramite) !== parseFloat(valorFiltro)) return false;

                // Comparación por fecha (solo fecha sin hora)
            } else if (['FechaRecepcion', 'FechaVencimiento', 'FechaRetroactiva', 'FechaEntregaAcuse', 'FechaLimitePago'].includes(campo)) {
                const fechaBase = valorTramite ? valorTramite.split(' ')[0] : '';
                if (fechaBase !== valorFiltro) return false;

                // Comparación exacta o parcial
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

    console.log('Filtrados:', filtrados);
    llenarTablaOficios(filtrados, 'tableOficios');
}
// Función para llenar el formulario de edición de contestaciones
function llenarformEditarCorrespondencia(correspondenciaID) {
    const idNumerico = Number(correspondenciaID);
    const correspondencia = dataOficios.find(item => item.ID === idNumerico);

    console.log('Correspondencia: ', correspondencia);

    if (!correspondencia) {
        console.error("No se encontró la correspondencia con ID:", correspondenciaID);
        return;
    }

    // Helper
    const setValueIfExists = (id, valor) => {
        const el = document.getElementById(id);
        if (el && valor !== undefined && valor !== null) {
            el.value = valor;
        }
    };

    // DATOS GENERALES
    setValueIfExists("Folio", correspondencia.Folio);
    setValueIfExists("FechaRecepcion", correspondencia.FechaRecepcion);
    setValueIfExists("Solicitante", correspondencia.Solicitante);
    setValueIfExists("Dependencia", correspondencia.Dependencia);
    setValueIfExists("Departamento", correspondencia.Departamento);
    setValueIfExists("UsuarioRegistro", correspondencia.UsuarioRegistro);

    // INFORMACIÓN DEL OFICIO
    setValueIfExists("NumeroOficio", correspondencia.NumeroOficio);
    setValueIfExists("tipoOficio", correspondencia.tipoOficio);
    setValueIfExists("Asunto", correspondencia.Asunto);
    setValueIfExists("Monto", correspondencia.Monto);
    setValueIfExists("Concepto", correspondencia.Concepto);

    // FECHAS
    setValueIfExists("FechaVencimiento", formatDateInput(correspondencia.FechaVencimiento));
    setValueIfExists("FechaRetroactiva", formatDateInput(correspondencia.FechaRetroactiva));
    setValueIfExists("FechaEntregaAcuse", formatDateInput(correspondencia.FechaEntregaAcuse));
    setValueIfExists("FechaLimitePago", formatDateTimeInput(correspondencia.FechaLimitePago));

    // FLUJO DEL OFICIO
    setValueIfExists("Turnado", correspondencia.Turnado);
    setValueIfExists("RespuestaConocimiento", correspondencia.RespuestaConocimiento);
    setValueIfExists("Estado", correspondencia.Estado);
    setValueIfExists("Comentarios", correspondencia.Comentarios);

    // RELACIONES
    setValueIfExists("FKOficio", correspondencia.FKOficio);
}
// Funciones auxiliares para formato
function formatDateInput(fechaStr) {
    if (!fechaStr) return "";
    const d = new Date(fechaStr);
    return d.toISOString().split("T")[0]; // yyyy-mm-dd
}
function formatDateTimeInput(fechaStr) {
    if (!fechaStr) return "";
    const d = new Date(fechaStr);
    const pad = n => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Agrega esta línea al final de tu archivo Oficios.js
window.eliminarOficio = eliminarOficio;
window.mostrarComentario = mostrarComentario;

