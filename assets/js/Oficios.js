// Oficios.js
import Global from './funcionesGlobales.js';
//console.log(Global.holaMundo());

// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `https://apipagotrack.mexiclientes.com/index.php?action=`;
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
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            crearOficio(data);
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
        //console.log('usuarioID: ', usuarioID);
        //Filtrar dataOficios por usuario
        const dataOficiosAnalista = dataOficios.filter(oficio => oficio.Turnado === String(usuarioID) && (oficio.Estado === "TURNADO" || oficio.Estado === "OBSERVACIONES" || oficio.Estado === "DEVUELTO"));
        // Llenar tabla de oficios analista
        llenarTablaOficios(dataOficiosAnalista, "tableOficiosAnalista");

        //console.log('dataOficiosAnalista: ', dataOficiosAnalista);
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
        // SI EL USUARIO ES ANALISTA Y TRAMITE FILTRAR POR FIRMA-DG
        if (RolUser === "Analista" && DepartamentoUser === "Tramite") {
            //Filtrar dataOficios por usuario
            const dataOficiosAnalistaArchivo = dataOficios.filter(oficio => oficio.Estado === "FIRMA-DG");
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
}
// Funcion para obtener los oficios
async function listarOficios() {
    let resOficios = await fetch(URL_BASE + 'listarOficios');
    let jsonOficios = await resOficios.json();
    // Guardar respuesta en variable global
    dataOficios = jsonOficios.data;
    //console.log('Oficios: ', dataOficios);
}
// Función para llenar la tabla de oficios
function llenarTablaOficios(data, tableId) {
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
            { data: "ID" },
            { data: "Folio" },
            { data: "FechaRecepcion" },
            { data: "Solicitante" },
            { data: "Dependencia" },
            { data: "Departamento" },
            { data: "NumeroOficio" },
            { data: "tipoOficio" },
            { data: "Asunto" },
            { data: "Concepto" },
            {
                data: "Monto",
                render: function (data) {
                    return data ? formatoMoneda.format(data) : "$0.00";
                }
            },
            { data: "FechaVencimiento" },
            { data: "Turnado" },
            { data: "RespuestaConocimiento" },
            { data: "FechaRetroactiva" },
            { data: "Estado" },
            { data: "FechaCreacion" },
            { data: "UsuarioRegistro" },
            {
                data: "Comentarios",
                render: function (data) {
                    if (!data) return '';
                    return data.length > 100 ? data.slice(-100) : data;
                }
            },
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && usuario.RolUser === "Admin" || usuario.RolUser === "Oficios") {
                        botones += `<button class="btn btn-primary" onclick="window.location.href='CorrespondenciaEditar.html?id=' + ${data.ID}">Actualizar</button>`;
                    }
                    if (usuario && usuario.RolUser === "Admin") {
                        botones += `<button class="btn btn-danger" onclick="eliminarOficio(${data.ID})">Eliminar</button>`;
                    }
                    if (data.Estado === "CREADO") {
                        botones += `<button class="btn btn-secondary" onclick="window.location.href='CorrespondenciaTurnado.html?id=' + ${data.ID}">TURNADO</button>`;
                        //RESULTADO DE LA VISTA OFICIOTURNADO = OBSERVACIONES, DEVUELTO O FIRMA-DG
                    }
                    if (data.Estado === "FIRMA-DG") {
                        botones += `<button class="btn btn-secondary" onclick="window.location.href='CorrespondenciaEditar.html?id=' + ${data.ID}">ACUSE</button>`;
                        //RESULTADO DE LA VISTA OFICIOSCANEOFIRMAS = ESCANEO-FIRMAS
                    }
                    if (data.Estado === "ESCANEO-FIRMAS") {
                        // botones += `<button class="btn btn-secondary" onclick="window.location.href='OficioRespuesta.html?id=' + ${data.ID}">ACUSE</button>`;
                        //RESULTADO DE LA VISTA OFICIORESPUESTA = ACUSE
                    }
                    if (data.Estado === "ACUSE") {
                        botones += `<button class="btn btn-secondary" onclick="window.location.href='CorrespondenciaScaneoFirmas.html?id=' + ${data.ID}">ESCANEO-SELLOS</button>`;
                        //RESULTADO DE LA VISTA OFICIOESCANEOSSELLOS = ESCANEO-SELLOS
                    }
                    if (data.Estado === "ESCANEO-SELLOS") {
                        botones += `<button class="btn btn-secondary" onclick="window.location.href='CorrespondenciaEditar.html?id=' + ${data.ID}">ARCHIVADO</button>`;
                        //RESULTADO DE LA VISTA OFICIOARCHIVADO = ARCHIVADO
                    }
                    if (data.Estado === "TURNADO" || data.Estado === "OBSERVACIONES" || data.Estado === "DEVUELTO") {
                        botones += `<button class="btn btn-secondary" onclick="window.location.href='CorrespondenciaAnalistaActualizar.html?id=' + ${data.ID}">ACTUALIZAR</button>`;
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

    if (!oficio) {
        console.error("No se encontró el oficio con ID:", oficioID);
        return;
    }

    // Llenar cada campo del formulario
    // Usar función segura para asignar valores
    setValueIfExists("ID", oficio.ID);
    setValueIfExists("Folio", oficio.Folio);
    setValueIfExists("FechaRecepcion", oficio.FechaRecepcion?.substring(0, 10));
    setValueIfExists("Solicitante", oficio.Solicitante);
    setValueIfExists("Dependencia", oficio.Dependencia);
    setValueIfExists("Departamento", oficio.Departamento);
    setValueIfExists("NumeroOficio", oficio.NumeroOficio);
    setValueIfExists("tipoOficio", oficio.tipoOficio);
    setValueIfExists("Asunto", oficio.Asunto);
    setValueIfExists("Concepto", oficio.Concepto);
    setValueIfExists("Monto", oficio.Monto);
    setValueIfExists("FechaVencimiento", oficio.FechaVencimiento);
    setValueIfExists("Turnado", oficio.Turnado);
    setValueIfExists("RespuestaConocimiento", oficio.RespuestaConocimiento);
    setValueIfExists("FechaRetroactiva", oficio.FechaRetroactiva);
    setValueIfExists("Estado", oficio.Estado);
    setValueIfExists("UsuarioRegistro", oficio.UsuarioRegistro);
    setValueIfExists("Comentarios", oficio.Comentarios);
    setValueIfExists("FechaEntregaAcuse", oficio.FechaEntregaAcuse?.substring(0, 10));
}
// Función para actualizar un oficio
function actualizarOficio(data) {
    //console.log('📤 Enviando oficio:', data);

    const fetchOptions = {
        method: 'POST'
    };

    // Detecta si ya es FormData (viene de un <form> con archivo)
    if (data instanceof FormData) {
        fetchOptions.body = data;
    } else {
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
window.eliminarOficio = function(id) {
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
        grupoRespuestaConocimiento.hidden = estatus !== 'FIRMA-DG';

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
// Agrega esta línea al final de tu archivo Oficios.js
window.eliminarOficio = eliminarOficio;