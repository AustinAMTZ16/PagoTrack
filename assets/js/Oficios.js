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
        formCrearOficios.addEventListener("submit", function(e) {
            e.preventDefault(); // ✅ evita el envío automático
            const formData = new FormData(formCrearOficios);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            crearOficio(data);
        });
    }    
});

// Funcion para cargar la app
async function cargarApp(){    
    // Obtener oficios
    await listarOficios();

    // Verifica si existe la tabla de oficios
    const tableOficios = document.getElementById("tableOficios");
    if (tableOficios) {
        // Llenar tabla de oficios
        llenarTablaOficios(dataOficios);
    }

    // Verifica si el botón existe crear downloadExcelSuficiencias
    const downloadButton = document.getElementById("descargarExcelOficios");
    if (downloadButton) {
        downloadButton.addEventListener("click", exportToExcel);
    }

    // Verifica si el botón existe crear oficio
    const crearOficio = document.getElementById("crearOficio");
    if (crearOficio) {
        crearOficio.addEventListener("click", () => {
            window.location.href = "OficioCrear.html";
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
        formEditarOficios.addEventListener("submit", function(e) {
            e.preventDefault(); // ✅ evita el envío automático
            const formData = new FormData(formEditarOficios);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            actualizarOficio(data);
        });
    }   
}
// Funcion para obtener los oficios
async function listarOficios(){
    let resOficios = await fetch(URL_BASE + 'listarOficios');
    let jsonOficios = await resOficios.json();
    // Guardar respuesta en variable global
    dataOficios = jsonOficios.data;
    console.log('Oficios: ', dataOficios);
}
// Función para llenar la tabla de oficios
function llenarTablaOficios(data) {
    const tableId = "tableOficios";

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
            { data: "Comentarios" },
            { data: null,
                render: function (data) {
                    let botones = "";
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && usuario.RolUser === "Admin" || usuario.RolUser === "Oficios") {
                        botones += `<button class="btn btn-primary" onclick="window.location.href='OficioEditar.html?id=' + ${data.ID}">Actualizar</button>`;
                    }
                    if (usuario && usuario.RolUser === "Admin") {
                        botones += `<button class="btn btn-danger" onclick="eliminarOficio(${data.ID})">Eliminar</button>`;
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
function exportToExcel() {
    const table = document.querySelector("#tableOficios"); // Selecciona la tabla por su ID
    if (table) { // Verifica si la tabla existe
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" }); // Convierte la tabla en un libro de Excel
        XLSX.writeFile(wb, "datos_oficios.xlsx"); // Descarga el archivo Excel con el nombre especificado
    } else {
        console.error("La tabla no existe en el DOM.");
    }
}
// Función para crear un oficio
function crearOficio(data) {
    console.log('crearOficioData:', data);

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
        console.log('Respuesta del servidor:', res);

        // 🔍 Aquí se arregla: extraer mensaje del objeto 'data'
        let responseData = res.data;
        if (typeof responseData === 'string') {
            responseData = JSON.parse(responseData);
        }

        if (responseData.message === "Oficio creado correctamente") {
            console.log('Oficio creado correctamente');
            window.location.href = "OficiosPanelControl.html";
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
function llenarformEditarOficios(oficioID) {
    const idNumerico = Number(oficioID);
    const oficio = dataOficios.find(oficio => oficio.ID === idNumerico);

    if (!oficio) {
        console.error("No se encontró el oficio con ID:", oficioID);
        return;
    }

    // Llenar cada campo del formulario
    document.getElementById("ID").value = oficio.ID;
    document.getElementById("Folio").value = oficio.Folio || '';
    document.getElementById("FechaRecepcion").value = oficio.FechaRecepcion || '';
    document.getElementById("Solicitante").value = oficio.Solicitante || '';
    document.getElementById("Dependencia").value = oficio.Dependencia || '';
    document.getElementById("Departamento").value = oficio.Departamento || '';
    document.getElementById("NumeroOficio").value = oficio.NumeroOficio || '';
    document.getElementById("tipoOficio").value = oficio.tipoOficio || '';
    document.getElementById("Asunto").value = oficio.Asunto || '';
    document.getElementById("Concepto").value = oficio.Concepto || '';
    document.getElementById("Monto").value = oficio.Monto || '';
    document.getElementById("FechaVencimiento").value = oficio.FechaVencimiento || '';
    document.getElementById("Turnado").value = oficio.Turnado || '';
    document.getElementById("RespuestaConocimiento").value = oficio.RespuestaConocimiento || '';
    document.getElementById("FechaRetroactiva").value = oficio.FechaRetroactiva || '';
    document.getElementById("Estado").value = oficio.Estado || '';
    document.getElementById("UsuarioRegistro").value = oficio.UsuarioRegistro || '';
    document.getElementById("Comentarios").value = oficio.Comentarios || '';
}
// Función para actualizar un oficio
function actualizarOficio(data){
    console.log('actualizarOficioData:', data);

    fetch(URL_BASE + 'actualizarOficio', {
        method: 'PATCH',
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
        alert(res.data);
        window.location.href = "OficiosPanelControl.html";
    })  
    .catch(error => {
        console.error("Error al actualizar el oficio:", error);
        alert("Error de red o del servidor: " + error.message);
    });
}   
// Eliminar oficio por id
function eliminarOficio(id) {
    console.log('Eliminar oficio:', id);

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
