// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Evento para cargar el contenido de la página
document.addEventListener("DOMContentLoaded", function() {
    // Evento para crear un trámite
    const formTramite = document.getElementById("formcreateTramite");
    if (formTramite) {
        formTramite.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(formTramite);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            createTramite(data);
        });
    }
    // Obtener el parámetro "id" de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const ID_CONTRATO = urlParams.get('id');
    const Proveedor = urlParams.get('proveedor');
    const Concepto = urlParams.get('concepto');
    const Importe = urlParams.get('importe');
    // Mostrar el ID en el campo de entrada
    if (ID_CONTRATO) {
        const inputField = document.getElementById('ID_CONTRATO');
        inputField.value = ID_CONTRATO;
    }
    if (Proveedor) {
        const inputField = document.getElementById('Proveedor');
        inputField.value = Proveedor;
    }
    if (Concepto) {
        const inputField = document.getElementById('Concepto');
        inputField.value = Concepto;
    }
    if (Importe) {
        const inputField = document.getElementById('Importe');
        inputField.value = Importe;
    }
    // Evento para turnar un trámite
    const formTurnarTramite = document.getElementById('formTurnarTramite');
    if (formTurnarTramite) {
        formTurnarTramite.addEventListener("submit", function (e) {
            e.preventDefault(); // Evita la recarga de la página
            const formData = new FormData(formTurnarTramite);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            // console.log('Datos enviados:', data);
            turnarTramite(data);
        });
    }
    // Evento para actualizar un trámite
    const formUpdateTramite = document.getElementById('formUpdateTramite');
    if (formUpdateTramite) {
        formUpdateTramite.addEventListener("submit", function (e) {
            const btn = document.activeElement; // Obtiene el botón que activó el envío
            
            if (!btn || btn.id !== "btnGuardar") {
                e.preventDefault(); // Evita el envío si no es "Guardar Tramite"
                return;
            }

            e.preventDefault(); // Evita la recarga de la página

            const formData = new FormData(formUpdateTramite);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            updateTramite(data);
        });
    }
    // Evento para Actualizat todo el un trámite
    const formUpdateTramiteCompleto = document.getElementById("formUpdateTramiteCompleto");
    if (formUpdateTramiteCompleto) {
        obtenerTramite(ID_CONTRATO);
        formUpdateTramiteCompleto.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(formUpdateTramiteCompleto);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            // Llamar la función con el objeto 'data'
            updateTramiteCompleto(data);
        });
    }
});
// Función para crear un trámite
function createTramite(data){
    fetch(URL_BASE + 'createTramite', {
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
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        console.error('Error al crear el trámite:', error.message);
    });
}
// Función para turnar un trámite
function turnarTramite(data){
    // Obtener la fecha y hora actual en formato ISO
    const fechaActual = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Agregar la fecha al objeto data
    data.FechaTurnado = fechaActual;

    fetch(URL_BASE + 'updateTramite', {
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
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        console.error('Error al crear el trámite:', error.message);
    });
}
// Función para actualizar un trámite
function updateTramite(data){
    fetch(URL_BASE + 'updateTramite', {
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
        window.location.href = 'listadoTurnados.html';
    })
    .catch(error => {
        console.error('Error al crear el trámite:', error.message);
    });
}
// Función Actualizar Tramite Completo
async function updateTramiteCompleto(data) {
    return fetch(URL_BASE + 'updateTramiteCompleto', {
        method: 'PATCH',
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
        try {
            alert(result.message);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error("Error al actualizar el trámite:", error);
        }
    })
    .catch(error => {
        alert('Error al actualizar el trámite. Asegurese de que el numero de remesa sea unico.', error.message);
        throw error; // Importante para que el error se propague y pueda ser capturado
    });
}
// Función para obtener un trámite
async function obtenerTramite(ID_CONTRATO) {
    console.log('ID_CONTRATO: ', ID_CONTRATO);
    return fetch(URL_BASE + 'getTramites', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log('idTramite: ', ID_CONTRATO);
        try {
            const tramite = result.data.find(tramite => tramite.ID_CONTRATO == ID_CONTRATO);
            console.log('Tramite obtenido:', tramite);

            if (tramite) {
                document.getElementById("ID_CONTRATO").value = tramite.ID_CONTRATO || "";
                document.getElementById("Mes").value = tramite.Mes || "";
                document.getElementById("FechaRecepcion").value = tramite.FechaRecepcion ? tramite.FechaRecepcion.split(" ")[0] : new Date().toISOString().split("T")[0];
                document.getElementById("TipoTramite").value = tramite.TipoTramite || "";
                document.getElementById("Dependencia").value = tramite.Dependencia || "";
                document.getElementById("Proveedor").value = tramite.Proveedor || "";
                document.getElementById("Concepto").value = tramite.Concepto || "";
                document.getElementById("Importe").value = tramite.Importe || "";
                document.getElementById("Estatus").value = tramite.Estatus || "";
                document.getElementById("Comentarios").value = tramite.Comentarios || "";
                document.getElementById("Fondo").value = tramite.Fondo || "";
                document.getElementById("FechaLimite").value = tramite.FechaLimite ? tramite.FechaLimite.split(" ")[0] : "";
                document.getElementById("FechaTurnado").value = tramite.FechaTurnado ? tramite.FechaTurnado.split(" ")[0] : new Date().toISOString().split("T")[0];
                document.getElementById("FechaTurnadoEntrega").value = tramite.FechaTurnadoEntrega ? tramite.FechaTurnadoEntrega.split(" ")[0] : new Date().toISOString().split("T")[0];
                document.getElementById("FechaDevuelto").value = tramite.FechaDevuelto ? tramite.FechaDevuelto.split(" ")[0] : new Date().toISOString().split("T")[0];
                document.getElementById("AnalistaID").value = tramite.AnalistaID || "";
                document.getElementById("RemesaNumero").value = tramite.RemesaNumero || "";
                document.getElementById("DocSAP").value = tramite.DocSAP || "";
                document.getElementById("IntegraSAP").value = tramite.IntegraSAP || "";
                document.getElementById("OfPeticion").value = tramite.OfPeticion || "";
                document.getElementById("NoTramite").value = tramite.NoTramite || "";
                document.getElementById("DoctacionAnexo").value = tramite.DoctacionAnexo || "";
            } else {
                console.error("Trámite no encontrado");
            }
        } catch (error) {
            console.error("Error en obtenerTramite:", error);
        }
    })
    .catch(error => {
        console.error('Error al obtener lista de trámites:', error);
        throw error; 
    });
}
