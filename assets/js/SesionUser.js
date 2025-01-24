// Evento para cargar el contenido de la página
document.addEventListener("DOMContentLoaded", function() {
    // Verificar si hay una sesión activa
    if (!sesionActiva()) {
        window.location.href = 'index.html';
    }

    // Resto del código para la página panel.html
});
// Función para comprobar si hay una sesión activa
function sesionActiva() {
    // Obtiene la información del usuario desde localStorage
    const usuario = localStorage.getItem('usuario');
    // Verifica si usuario es una cadena no vacía y puede ser parseada a un objeto JSON
    if (usuario && usuario.trim() !== "") {
        try {
            const usuarioObj = JSON.parse(usuario);
            // Verifica si usuarioObj es un objeto
            return (typeof usuarioObj === 'object' && usuarioObj !== null);
        } catch (error) {
            // Error al parsear JSON, por lo tanto no es un objeto válido
            return false;
        }
    }

    // Si la información del usuario no existe o no es válida, la sesión no está activa
    return false;
}
// Función para cerrar sesión
function cerrarSesion() {
    // Elimina la información del usuario de localStorage
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}