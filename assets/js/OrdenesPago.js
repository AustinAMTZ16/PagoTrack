// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;

// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el parámetro "id" de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    // Mostrar el ID en el campo de entrada
    if (id) {
        const inputField = document.getElementById('ID_CONTRATO');
        inputField.value = id;
    }
    // Evento para actualizar un trámite y Remesa
    const formUpdateTramiteRemesa = document.getElementById('formUpdateTramiteRemesa');
    if (formUpdateTramiteRemesa) {
        formUpdateTramiteRemesa.addEventListener("submit", function (e) {
            const btn = document.activeElement; // Obtiene el botón que activó el envío
            
            if (!btn || btn.id !== "btnGuardar") {
                e.preventDefault(); // Evita el envío si no es "Guardar Tramite"
                return;
            }

            e.preventDefault(); // Evita la recarga de la página

            const formData = new FormData(formUpdateTramiteRemesa);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            /* console.log('Datos del formulario:', data); */
            updateTramiteRemesa(data);
        });
    }

    // Obtener las remesas con trámites
    getRemesasWithTramites();
});
//getRemesasWithTramites
function getRemesasWithTramites() {
    fetch(URL_BASE + 'getRemesasWithTramites', {
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
            console.log('ResultgetRemesasWithTramites:', result);
            // Renderizar la tabla
            renderTable2(result.data);
        })
        .catch(error => {
            console.error('Error al obtener las remesas con trámites:', error.message);
        }); 
} 
// Función para formatear el importe como moneda (MXN - Peso Mexicano)
const formatoMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
});

function renderTable2(data) {
    const tableId = "tramitesTable2"; // ID de la tabla
    const table = document.getElementById(tableId);
    const tableHead = table.querySelector("thead tr");
    const tableBody = table.querySelector("tbody");

    // Limpiar la tabla antes de insertar nuevos datos
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='99'>No hay datos disponibles</td></tr>";
        return;
    }

    // Obtener las columnas dinámicas
    const columns = Object.keys(data[0]);

    // Generar encabezados de tabla dinámicos
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        tableHead.appendChild(th);
    });

    // Agregar encabezado de acciones
    const thAcciones = document.createElement("th");
    thAcciones.textContent = "Acciones";
    tableHead.appendChild(thAcciones);

    // Insertar filas con los datos
    data.forEach(row => {
        const tr = document.createElement("tr");

        columns.forEach(col => {
            const td = document.createElement("td");

            // Si es la columna "Importe", formatear como moneda
            if (col === "Importe") {
                td.textContent = row[col] ? formatoMoneda.format(row[col]) : "$0.00";
            } else {
                td.textContent = row[col] || 0; // Si no hay valor, muestra 0
            }

            tr.appendChild(td);
        });

        // Celda de acciones
        const tdAcciones = document.createElement("td");
        const btnActualizar = document.createElement("button");
        btnActualizar.textContent = "Actualizar";
        btnActualizar.classList.add("btn", "btn-primary");
        btnActualizar.onclick = function () {
            actualizarRegistro(row);
        };
        tdAcciones.appendChild(btnActualizar);
        tr.appendChild(tdAcciones);

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
        order: [[0, "asc"]],
    });
}

// Función de ejemplo para actualizar un registro
function actualizarRegistro(row) {
    window.location.href = `updateOrdenesPago.html?id=${row.ID_CONTRATO}`;
}
// Función para actualizar un trámite y remesa
function updateTramiteRemesa(data){
    fetch(URL_BASE + 'updateTramiteRemesa', {
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
        window.location.href = 'seguimientoOrdenesPago.html';
    })
    .catch(error => {
        console.error('Error al actualizar el trámite y remesa:', error.message);
    });
}