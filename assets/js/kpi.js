// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;
// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerKPI();
});

function obtenerKPI() {
    fetch(URL_BASE + 'obtenerKPI', {
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
        console.log('Respuesta de la API:', result);

        // Verificar si 'result.data' es una cadena JSON válida antes de intentar parsearla
        try {
            const data = JSON.parse(result.data);
            console.log('Datos parseados:', data);

            // Verificar si 'totales' y 'tramites' existen en 'data'
            if (data) {
                // Rellenar los totales
                document.getElementById('total_hoy').textContent = data.total_hoy || 0;
                document.getElementById('total_vencidos').textContent = data.total_vencidos || 0;
                document.getElementById('total_futuros').textContent = data.total_futuros || 0;

                // Convertir la lista en un objeto clave-valor para un acceso más fácil
                // Verifica si `conteo_estatus` es un array antes de iterarlo
                if (Array.isArray(data.conteo_estatus)) {
                    const conteo_estatus = {};
                    
                    data.conteo_estatus.forEach(item => {
                        conteo_estatus[item.Estatus] = item.total_registros;
                    });

                    // Asignar los valores a los elementos HTML
                    document.getElementById('estatus_remesa').textContent = conteo_estatus.Remesa || 0;
                    document.getElementById('estatus_devueltoOrdenesPago').textContent = conteo_estatus.DevueltoOrdenesPago || 0;
                    document.getElementById('estatus_registradoSAP').textContent = conteo_estatus.RegistradoSAP || 0;
                    document.getElementById('estatus_devuelto').textContent = conteo_estatus.Devuelto || 0;
                    document.getElementById('estatus_cancelado').textContent = conteo_estatus.Cancelado || 0;
                    document.getElementById('estatus_turnado').textContent = conteo_estatus.Turnado || 0;
                    document.getElementById('estatus_juntasAuxiliares').textContent = conteo_estatus.JuntasAuxiliares || 0;
                } else {
                    console.error("conteo_estatus no es un array:", data.conteo_estatus);
                }


                // Rellenar las tablas
                rellenarTabla('tabla_hoy', data.tramites_hoy || []);
                rellenarTabla('tabla_vencidos', data.tramites_vencidos || []);
                rellenarTabla('tabla_futuros', data.tramites_futuros || []);
            } else {
                console.error('Error: Datos incompletos, faltan propiedades "totales" o "tramites".');
            }
        } catch (error) {
            console.error('Error al parsear los datos de la API:', error);
        }
    })
    .catch(error => {
        console.error('Error al obtener las remesas con trámites:', error.message);
    });
}

function rellenarTabla(idTabla, tramites) {
    const tabla = document.getElementById(idTabla);
    tabla.innerHTML = ''; // Limpiar la tabla antes de llenarla

    tramites.forEach(tramite => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${tramite.ID_CONTRATO}</td>
            <td>${tramite.Estatus}</td>
            <td>${tramite.FechaLimite}</td>
            <td>${tramite.NombreUser} ${tramite.ApellidoUser}</td>
        `;
        tabla.appendChild(fila);
    });
}


