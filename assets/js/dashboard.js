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
// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    // Referencia al Select de Estado
    const estadoSelect = document.getElementById("estadoSelect");
    // Referencia a la tabla de trámites
    const tableTramitesJS = document.getElementById('tableTramites');
    // Referencia a la tabla de trámites turnados
    const tableTurnadosJS = document.getElementById('tableTurnados');

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
        // Listener para capturar el cambio de selección
        estadoSelect.addEventListener("change", function () {
            const selectedValue = estadoSelect.value; // Obtiene el valor seleccionado
            if (selectedValue) {
                filtrarTramites(selectedValue); // Llama a la función con el valor seleccionado
            } else if (selectedValue === 'Todos') {
                //console.log('Todos');
                //actualizarTablaTramites(tramitesArray, "tableTramites"); 
                filtrarTramitesOperador();
            }
        });
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
    // Verifica si el botón existe antes de agregar el listener
    const downloadButton = document.getElementById("downloadExcelTramites");
    if (downloadButton) {
        downloadButton.addEventListener("click", exportToExcel);
    }

    // Obtener el seguimiento de trámites
    getSeguimientoTramites();
    /* getConteoEstatus();
    getReporteEstatusComentarios(); */
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
            console.log('Result:', result);
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
            console.log('Result:', result);
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
            { data: "FechaRecepcion" },
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
            { data: null, render: function (data) { return data.NombreUser + " " + data.ApellidoUser; } },
            { data: "Estatus" },
            { data: "Comentarios" },
            { data: "Fondo" },
            { data: "FechaLimite" },
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
            { data: "FechaRecepcion" },
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
            { data: null, render: function (data) { return data.NombreUser + " " + data.ApellidoUser; } },
            { data: "Estatus" },
            { data: "Comentarios" },
            { data: "Fondo" },
            { data: "FechaLimite" },
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    if (data.Estatus === "Devuelto" || data.Estatus === "Turnado") {
                        botones += `<button class="btn btn-primary" onclick="editarTramite(${data.ID_CONTRATO})">Actualizar Estado</button> `;
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
function filtrarTramites(status) {
    if (status === "Todos") {
        filtrarTramitesOperador();
        //actualizarTablaTramites(tramitesArray, "tableTramites");
    } else {
        console.log('Seleccionado:', status);

        // Obtener el usuario desde localStorage
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        // Obtener el id del usuario
        const idUser = usuario.InicioSesionID;
        const CorreoUser = usuario.CorreoUser;


        if (CorreoUser === 'gonzalo.ochoa@ayuntamientopuebla.gob.mx') {
            // Filtrar los trámites por TipoTramite
            const tramitesOperador = tramitesArray.filter(tramite => tramite.TipoTramite === 'OCO' || tramite.TipoTramite === 'Obra' || tramite.TipoTramite === 'OPO' && tramite.Estatus === status);
            actualizarTablaTramites(tramitesOperador, 'tableTramites');
        } else if (CorreoUser === 'juan.garcia@ayuntamientopuebla.gob.mx') {
            // Filtrar los trámites excepto los de tipo Obra
            const tramitesOperador = tramitesArray.filter(tramite => tramite.TipoTramite !== 'Obra' && tramite.TipoTramite !== 'OCO' && tramite.TipoTramite !== 'OPO' && tramite.Estatus === status);
            actualizarTablaTramites(tramitesOperador, 'tableTramites');
        } else {
            // Mostrar todos los trámites
            const tramitesOperador = tramitesArray.filter(tramite => tramite.Estatus === status);
            actualizarTablaTramites(tramitesOperador, 'tableTramites');
        }
        // Filtramos los trámites por el estado seleccionado
        //const tramitesFiltrados = tramitesArray.filter(tramite => tramite.Estatus === status);

        //actualizarTablaTramites(tramitesFiltrados, "tableTramites");
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
        actualizarTablaTurnados(tramitesArray, 'tableTurnados');
    } else {
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
function editarTramite(id) {
    console.log('Editar tramite:', id);
    window.location.href = `turnadoUpdateTramite.html?id=${id}`;
}
// Eliminar tramite por id
function eliminarTramite(id) {
    console.log('Eliminar tramite:', id);

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
    tableHead.innerHTML = "<th>Analista</th>";
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='99'>No hay datos disponibles</td></tr>";
        return;
    }

    // Obtener los nombres de los tipos de trámites dinámicamente
    const columns = Object.keys(data[0]).filter(key => key !== "Analista");

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
        tdAnalista.textContent = row.Analista;
        tr.appendChild(tdAnalista);

        // Celdas de conteo de trámites
        columns.forEach(col => {
            const td = document.createElement("td");
            td.textContent = row[col] || 0; // Si no hay valor, pone 0
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
        pageLength: 10, // Número de filas por página
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        order: [[0, "asc"]],
    });
}