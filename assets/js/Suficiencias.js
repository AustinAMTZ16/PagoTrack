// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `https://apipagotrack.mexiclientes.com/index.php?action=`;
// Declarar una variable global
let respuestaGlobal;
// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    getSuficiencias();

    //Obtener el ID del URL
    const urlParams = new URLSearchParams(window.location.search);
    const suficienciaID = urlParams.get('id');
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
    /// Evento para validar el formulario de creación de suficiencias
    const formCrearSuficiencias = document.getElementById("formCrearSuficiencias");
    if (formCrearSuficiencias) {
        formCrearSuficiencias.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(formCrearSuficiencias);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            registrarSuficiencia(data);
        });
    }
    /// Evento para validar el formulario de actualización de suficiencias  
    const formActualizarSuficiencias = document.getElementById("formActualizarSuficiencias");
    if (formActualizarSuficiencias) {
        llenarformActualizarSuficiencias(suficienciaID);
        formActualizarSuficiencias.addEventListener("submit", function(e) {
            e.preventDefault(); // Evita que se recargue la página          
            const formData = new FormData(formActualizarSuficiencias); // Obtiene los datos del formulario
            const data = {}; // Objeto para almacenar los datos 
            formData.forEach((value, key) => { // Recorre los datos del formulario
                data[key] = value; // Almacena los datos en el objeto
            });
            actualizarSuficiencia(data); // Llama a la función para actualizar la suficiencia
        });
    }







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
        llenarTablaSuficiencias(result.data);
        return result.data;
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
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && usuario.RolUser === "Admin" || usuario.RolUser === "Suficiencias") {
                        botones += `<button class="btn btn-primary" onclick="window.location.href='actualizarSuficiencias.html?id=' + ${data.SuficienciasID}">Actualizar</button>`;
                    }
                    if (usuario && usuario.RolUser === "Admin" || usuario.RolUser === "Suficiencias") {
                        botones += `<button class="btn btn-success" onclick="window.location.href='detallesSuficiencias.html?id=' + ${data.SuficienciasID}">Detalles</button> `;
                    }
                    if (usuario && usuario.RolUser === "Admin") {
                        botones += `<button class="btn btn-danger" onclick="eliminarSuficiencia(${data.SuficienciasID})">Eliminar</button>`;
                    }
                    return botones;
                }
            },
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
            { data: "Observaciones" }
            
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

function registrarSuficiencia(data){
    //console.log('registrarSuficienciaData: ',data);
    fetch(URL_BASE + 'registrarSuficiencia', {
        method: 'POST',
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
        alert(result.message);
        // window.location.href = 'CorrespondenciaPanelControl.html';
    })
    .catch(error => {
        console.error('Error al obtener las remesas con trámites:', error.message);
    });
}

function llenarformActualizarSuficiencias(suficienciaID) {
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
        //console.log(result.data);
        // Esperar que los datos se hayan cargado y luego buscar la suficiencia con el ID correspondiente
        const suficiencia = result.data.find(suficiencia => suficiencia.SuficienciasID == suficienciaID);

        
        // Solo proceder si se encuentra la suficiencia
        if (suficiencia) {
            // Asignar los valores a los campos del formulario
            document.getElementById("PersonaQuienSolicita").value = suficiencia.PersonaQuienSolicita;
            document.getElementById("Dependencia").value = suficiencia.Dependencia;
            document.getElementById("CentroGestor").value = suficiencia.CentroGestor;
            document.getElementById("AreaFuncional").value = suficiencia.AreaFuncional;
            document.getElementById("NoOficioSolicitud").value = suficiencia.NoOficioSolicitud;
            document.getElementById("FechaSolicitud").value = suficiencia.FechaSolicitud;
            document.getElementById("FechaRecepcion").value = suficiencia.FechaRecepcion;
            document.getElementById("NoOficioContestacion").value = suficiencia.NoOficioContestacion;
            document.getElementById("Tipo").value = suficiencia.Tipo;
            document.getElementById("FechaContestacion").value = suficiencia.FechaContestacion;
            document.getElementById("SolpedCompromisoGasto").value = suficiencia.SolpedCompromisoGasto;
            document.getElementById("ServicioSolicitado").value = suficiencia.ServicioSolicitado;
            document.getElementById("FuenteFinanciamiento").value = suficiencia.FuenteFinanciamiento;
            document.getElementById("PosPrecog").value = suficiencia.PosPrecog;
            document.getElementById("Requisito").value = suficiencia.Requisito;
            document.getElementById("Concepto").value = suficiencia.Concepto;
            document.getElementById("MontoSuficienciaPresupuestal2024").value = suficiencia.MontoSuficienciaPresupuestal2024;
            document.getElementById("Conac").value = suficiencia.Conac;
            document.getElementById("Cuenta").value = suficiencia.Cuenta;
            document.getElementById("Folio").value = suficiencia.Folio;
            document.getElementById("Mes").value = suficiencia.Mes;
            document.getElementById("Foja").value = suficiencia.Foja;
            document.getElementById("NoticiaAdministrativa").value = suficiencia.NoticiaAdministrativa;
            document.getElementById("NoContabilizarConsecutivo").value = suficiencia.NoContabilizarConsecutivo;
            document.getElementById("ConsecutivoMes").value = suficiencia.ConsecutivoMes;
            document.getElementById("Observaciones").value = suficiencia.Observaciones;
        } else {
            console.error('No se encontró la suficiencia con ID:', suficienciaID);
        }
    })
    .catch(error => {
        console.error('Error al obtener las suficiencias:', error.message);
    });
}

function actualizarSuficiencia(data){
    //Obtener el ID del URL
    const urlParams = new URLSearchParams(window.location.search);
    const SuficienciasID = urlParams.get('id');
    //console.log('actualizarSuficiencia', SuficienciasID);

    // Agregar el campo SuficienciasID a data
    data.SuficienciasID = SuficienciasID;


    fetch(URL_BASE + 'actualizarSuficiencia', {
        method: 'PATCH',
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
        alert(result.message);
        // window.location.href = 'CorrespondenciaPanelControl.html';
    })
    .catch(error => {
        console.error('Error al obtener las remesas con trámites:', error.message);
    });
}

function eliminarSuficiencia(SuficienciasID){
    // Confirmación del usuario antes de eliminar
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar la Suficiencia?");
    if (!confirmDelete) {
        return; // Si el usuario cancela, salimos de la función
    }
    const data = {
        SuficienciasID: SuficienciasID
    };
    fetch(URL_BASE + 'eliminarSuficiencia', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return response.json();
    })  
    .then(result => {
        alert("Suficiencia eliminada con éxito.");
        window.location.reload();  // Recargar la página
    })
    .catch(error => {
        console.error('Error al eliminar usuario:', error);
    }); 
}
