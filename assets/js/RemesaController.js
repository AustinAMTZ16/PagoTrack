// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Evento para cargar el contenido de la página
document.addEventListener("DOMContentLoaded", function() {
    // Obtener el parámetro "id" de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    // Mostrar el ID en el campo de entrada
    if (id) {
        const inputField = document.getElementById('FK_CONTRATO');
        inputField.value = id;
    }
    // Evento para crear un trámite
    const formTramite = document.getElementById("formcreateRemesa");
    if (formTramite) {
        formTramite.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(formTramite);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            // console.log(data);
            createRemsa(data);
        });
    }

});
// Función para crear un Remesa
function createRemsa(data){
    fetch(URL_BASE + 'createRemesa', {
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