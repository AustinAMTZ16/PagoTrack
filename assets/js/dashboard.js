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
    if(tableTurnadosJS){
        getTramitesTurnados();
    }
    // Agregar el evento al select de estado
    if(estadoSelect){
        // Listener para capturar el cambio de selección
        estadoSelect.addEventListener("change", function () {
        const selectedValue = estadoSelect.value; // Obtiene el valor seleccionado
        if (selectedValue) {
            filtrarTramites(selectedValue); // Llama a la función con el valor seleccionado
        } else if (selectedValue === 'Todos') {
                actualizarTablaTramites(tramitesArray, "tableTramites"); 
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
});
// Función para obtener la lista de trámites
function getTramites() {
    fetch(URL_BASE + 'getTramites',{
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
            actualizarTablaTramites(tramitesArray, 'tableTramites'); // Pasar el array a la función
        } else {
            console.error('No se encontró un array en la propiedad "data".');
        }
    })
    .catch(error => {
        console.error('Error al obtener los trámites:', error.message);
        alert(`Error al obtener los trámites: ${error.message}`);
    });
}
//funcion para obtener la lista de trámites turnados
function getTramitesTurnados() {
    fetch(URL_BASE + 'getTramites',{
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
    
    // Obtener el cuerpo de la tabla dinámicamente usando el tableId
    const table = document.getElementById(tableId);

    // Validar que la tabla exista
    if (!table) {
        console.error(`No se encontró la tabla con el ID: ${tableId}`);
        alert('Error: No se encontró la tabla especificada.');
        return;
    }

    const tbBody = table.getElementsByTagName('tbody')[0];
    tbBody.innerHTML = ''; // Limpiar contenido existente

    // Validar que data es un array
    if (!Array.isArray(data)) {
        console.error('La respuesta no es un array:', data);
        alert('Error: La respuesta de la API no contiene datos válidos.');
        return;
    }

    // Iterar sobre los datos y agregarlos a la tabla
    data.forEach(item => {
        const newRow = tbBody.insertRow();
        // Determinar si el botón "Turnar" debe mostrarse
        const mostrarBotonTurnar = item.Estatus === 'Creado';
        // Determinar si el botón "VoBO" debe mostrarse
        const mostrarBotonVoBO = item.Estatus === 'VoBO';
        // Determinar si el botón "Eliminar" debe mostrarse
        // Obtener el usuario desde localStorage
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const mostrarBotonEliminar = usuario.RolUser === 'Admin';
        newRow.innerHTML = `
            <td hidden>${item.ID_CONTRATO || ''}</td>
            <td>${item.Mes || ''}</td>
            <td>${item.FechaRecepcion || ''}</td>
            <td>${item.TipoTramite || ''}</td>
            <td>${item.Dependencia || ''}</td>
            <td>${item.Proveedor || ''}</td>
            <td>${item.Concepto || ''}</td>
            <td>${item.Importe || ''}</td>
            <td>${item.AnalistaTurnado || ''}</td>
            <td>${item.Estatus || ''}</td>
            <td>${item.Comentarios || ''}</td>
            <td>
                ${mostrarBotonTurnar 
                    ? `<button class="btn btn-primary" onclick="turnarTramite(${item.ID_CONTRATO})">Turnar</button>` 
                    : ''}
                ${mostrarBotonEliminar 
                    ? `<button class="btn btn-danger" onclick="eliminarTramite(${item.ID_CONTRATO})">Eliminar</button>` 
                    : ''}
                ${mostrarBotonVoBO 
                    ? `<button class="btn btn-primary" onclick="editarTramite(${item.ID_CONTRATO})">VoBO</button>` 
                    : ''}
            </td>
        `;
    });
}
// Función para actualizar la tabla de trámites turnados
function actualizarTablaTurnados(data, tableId) {
    
    // Obtener el cuerpo de la tabla dinámicamente usando el tableId
    const table = document.getElementById(tableId);

    // Validar que la tabla exista
    if (!table) {
        console.error(`No se encontró la tabla con el ID: ${tableId}`);
        alert('Error: No se encontró la tabla especificada.');
        return;
    }

    const tbBody = table.getElementsByTagName('tbody')[0];
    tbBody.innerHTML = ''; // Limpiar contenido existente

    // Validar que data es un array
    if (!Array.isArray(data)) {
        console.error('La respuesta no es un array:', data);
        alert('Error: La respuesta de la API no contiene datos válidos.');
        return;
    }

    // Iterar sobre los datos y agregarlos a la tabla
    data.forEach(item => {
        const newRow = tbBody.insertRow();
        // Determinar si el botón "Actualizar Estado" debe mostrarse
        const mostrarBotonActualizarEstado = item.Estatus === 'Observaciones' || item.Estatus === 'Turnado';
        // Determinar si el botón "CrearRemesa" debe mostrarse
        const mostrarBotonCrearRemesa = item.Estatus === 'RegistradoSAP';
        newRow.innerHTML = `
            <td>${item.ID_CONTRATO || ''}</td>
            <td>${item.Mes || ''}</td>
            <td>${item.FechaRecepcion || ''}</td>
            <td>${item.TipoTramite || ''}</td>
            <td>${item.Dependencia || ''}</td>
            <td>${item.Proveedor || ''}</td>
            <td>${item.Concepto || ''}</td>
            <td>${item.Importe || ''}</td>
            <td>${item.AnalistaTurnado || ''}</td>
            <td>${item.Estatus || ''}</td>
            <td>${item.Comentarios || ''}</td>
            <td>
                ${mostrarBotonActualizarEstado 
                    ? `<button class="btn btn-primary" onclick="editarTramite(${item.ID_CONTRATO})">Actualizar Estado</button>` 
                    : ''}
                ${mostrarBotonCrearRemesa 
                    ? `<button class="btn btn-primary" onclick="editarTramite(${item.ID_CONTRATO})">Crear Remesa</button>` 
                    : ''}
            </td>
        `;
    });
}
// Filtrar trámites por estado
function filtrarTramites(status) {
    if (status === "Todos") {
        actualizarTablaTramites(tramitesArray, "tableTramites");
    } else {
        // Filtramos los trámites por el estado seleccionado
        const tramitesFiltrados = tramitesArray.filter(tramite => tramite.Estatus === status);
        actualizarTablaTramites(tramitesFiltrados, "tableTramites");
    }
}
//Filttrar trámites por AnalistaTurnado
function estadoTurnado() {
    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Obtener el rol del usuario y su departamento
    const nombreCompletoUser = usuario.NombreUser + ' ' + usuario.ApellidoUser;
    // Filtrar los trámites por el AnalistaTurnado
    const tramitesTurnados = tramitesArray.filter(tramite => tramite.AnalistaTurnado === nombreCompletoUser);
    // En caso de que el usuario.RolUser sea igual a 'Admin' debera mostrar todos los trámites
    if(usuario.RolUser === 'Admin'){
        actualizarTablaTurnados(tramitesArray, 'tableTurnados');
    }else{
        actualizarTablaTurnados(tramitesTurnados, 'tableTurnados');
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

