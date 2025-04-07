// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Evento para cargar el contenido de la página
document.addEventListener("DOMContentLoaded", function() {
    // Verificar si hay un formulario de inicio de sesión en la página actual
    const formInicioSesion = document.getElementById("formInicioSesion");
    if (formInicioSesion) {
        formInicioSesion.addEventListener("submit", function(e) {
            e.preventDefault();
            const CorreoUserForm = document.getElementById("inputEmail");
            const ClaveUserForm = document.getElementById("inputclave");
            inicioSesion(CorreoUserForm.value, ClaveUserForm.value);
        });
    }

});
// Función para iniciar sesión
function inicioSesion(CorreoUserForm, ClaveUserForm){
    const data = { CorreoUser: CorreoUserForm, ClaveUser: ClaveUserForm};
    fetch(URL_BASE + 'loginUser', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors'
    })
    .then(response => {
        // Verifica si el código de estado indica éxito
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return response.json(); // Convierte la respuesta a JSON si es exitosa
    })
    .then(result => {
        // Verifica si el mensaje es exitoso
        if (result.message === 'Usuario logueado.') {
            // Guardar datos del usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify(result.data));
            // console.log('Datos guardados en localStorage:', result.data);
            switch(result.data.RolUser){
                case 'Admin' :     
                    window.location.href = 'dashboard.html';
                    break;
                case 'Operador' :
                    window.location.href = 'dashboard.html';
                    break;
                case 'Analista' :
                    window.location.href = 'listadoTurnados.html';
                    break;
                case 'Pagos' :
                    window.location.href = 'seguimientoOrdenesPago.html';
                    break;
                case 'Suficiencias' :
                    window.location.href = 'OficiosPanelControl.html';
                    break;  
                case 'KPI' :
                    window.location.href = 'kpi.html';
                    break;
                case 'Oficios' :
                    window.location.href = 'OficiosPanelControl.html';
                    break;
            }
        } else {
            console.error('Error en la respuesta:', result.message);
            alert(result.message); // Muestra un mensaje de error al usuario
        }
    })
    .catch(error => {
        // Manejo de errores en la solicitud
        console.error('Error al procesar la solicitud:', error.message);
        alert('Hubo un problema al procesar la solicitud. Por favor, inténtalo de nuevo.');
    });
}
