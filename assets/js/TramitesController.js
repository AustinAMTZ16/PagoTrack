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
    const id = urlParams.get('id');
    // Mostrar el ID en el campo de entrada
    if (id) {
        const inputField = document.getElementById('ID_CONTRATO');
        inputField.value = id;
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
            e.preventDefault(); // Evita la recarga de la página
            const formData = new FormData(formUpdateTramite);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            updateTramite(data);
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