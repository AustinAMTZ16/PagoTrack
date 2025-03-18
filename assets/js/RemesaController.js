// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;


// Evento para cargar el contenido de la página
document.addEventListener("DOMContentLoaded", function () {

    // Obtener el parámetro "consecutivo" de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Validar si el parámetro consecutivo existe
    const consecutivo = urlParams.get('consecutivo');
    if (consecutivo) {
        console.log('consecutivo: ' + consecutivo);
        armarRemesa(consecutivo);
    }
    // Validar si el elemento tableListaRemesas existe
    const tableListaRemesas = document.getElementById('tableListaRemesas');
    if (tableListaRemesas) {
        // Obtener el listado de remesas y llenar la tabla
        obtenerListaRemesas().then(listadoRemesas => {
            llenarTablaRemesas(listadoRemesas);
        }).catch(error => {
            console.error("Error al obtener el listado de remesas:", error.message);
        });
    }
});


// Funcion para ver el detalle de las remesas
function verDetalleRemesa(consecutivo) {
    window.location.href = 'detalleRemesas.html?consecutivo=' + consecutivo;
}
// Funcion para llenar la tabla con los datos de la remesa
function llenarTablaRemesas(listadoRemesas) {
    console.log('listadoRemesas:', listadoRemesas);
    // Limpiar el contenido de la tabla
    tableListaRemesas.innerHTML = '';

    // Crear un nuevo encabezado
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = ` 
        <th>#</th>
        <th>Remesa</th>
        <th>No. Tramites</th>
        <th>Acciones</th>
    `;
    tableListaRemesas.appendChild(headerRow);

    // Llenar la tabla con los datos de la remesa
    listadoRemesas.forEach((remesa, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${remesa.Grupo}</td>
            <td>${remesa.TotalRegistros}</td>
            <td>
                <button class="btn btn-primary" onclick="verDetalleRemesa('${remesa.Grupo}')">Ver</button>
            </td>
        `;
        tableListaRemesas.appendChild(row);
    });
}
function mostrarRemesas(remesas) {
    // Mostrar el nombre del glosador
    // document.getElementById('nombreGlosador').innerHTML = remesas[0]?.Analista || 'N/A';

    // Obtener la fecha de remesas o usar la fecha por defecto
    let fecha = remesas[0]?.FechaRemesa || 'NA';
    // Convertir la fecha a un objeto Date
    let dateObj = new Date(fecha);
    // Opciones para formatear la fecha
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // Formatear la fecha
    let formattedDate = dateObj.toLocaleDateString('es-ES', options);

    // Mostrar la fecha formateada
    document.getElementById('FechaCreacion').innerHTML = formattedDate;
    document.getElementById('Grupo').innerHTML = 'Remesa: '+remesas[0]?.Grupo || 'N/A';

    const tabla = document.getElementById('tablaRemesa');
    const thead = tabla.querySelector('thead tr');
    const tbody = tabla.querySelector('tbody');

    tbody.innerHTML = '';

    // Obtener todas las claves de fondos presentes en todas las remesas
    const clavesFondos = [...new Set(remesas.flatMap(remesa => Object.keys(remesa.Fondo || {})))];

    // Limpiar y construir el encabezado dinámico
    thead.innerHTML = `
        <th style="width: 20px;">#</th>
        <th>ID</th>
        <th>Of. Petición</th>
        <th>Fecha Recepción</th>
        <th>Integra</th>
        <th>Docto. SAP</th>
        <th>Tipo</th>
        <th># Trámite</th>
        <th>Institución</th>
        <th>Beneficiario</th>
        <th>Concepto</th>
        <th>Doctación. Anexa</th>
        <th>Importe total</th>
        ${clavesFondos.map(clave => `<th>${clave}</th>`).join('')}
        <th>Glosador</th>
        <th>Firma</th>
    `;

    // Objeto para almacenar totales
    const totales = {
        fondos: {},
        granTotal: 0
    };

    // Inicializar totales de cada fondo en 0
    clavesFondos.forEach(clave => {
        totales.fondos[clave] = 0;
    });

    // Generar filas de la tabla con datos
    remesas.forEach((remesa, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${remesa.ID_CONTRATO}</td>
            <td>${remesa.OfPeticion}</td>
            <td>${remesa.FechaRecepcion.split(" ")[0]}</td>
            <td>${remesa.IntegraSAP}</td>
            <td>${remesa.DocSAP}</td>
            <td>${remesa.TipoTramite}</td>
            <td>${remesa.NoTramite}</td>
            <td>${remesa.Dependencia}</td>
            <td>${remesa.Proveedor}</td>
            <td>${remesa.Concepto}</td>
            <td>${remesa.DoctacionAnexo}</td>
            

            <td>${formatoMoneda(
                Object.values(remesa.Fondo || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
            )}</td>


            ${clavesFondos.map(clave => {
                const valorFondo = parseFloat(remesa.Fondo?.[clave]) || 0;
                totales.fondos[clave] += valorFondo;
                return `<td>${formatoMoneda(valorFondo)}</td>`;
            }).join('')}
            <td>${remesa.Analista}</td>
            <td><br><br>______________</td>
        `;
        tbody.appendChild(tr);
        
        // Sumar al gran total
        totales.granTotal += parseFloat(remesa.Importe) || 0;
    });

    // Fila de totales
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td colspan="12">TOTALES</td>
        <td>${formatoMoneda(totales.granTotal)}</td>
        ${clavesFondos.map(clave => `<td>${formatoMoneda(totales.fondos[clave])}</td>`).join('')}
        <td></td>
        <td></td>
    `;
    tbody.appendChild(totalRow);
}
// Función para formatear moneda
function formatoMoneda(valor) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(valor);
}
// Funcion para armar la remesa 
async function armarRemesa(consecutivo) {
    const data = { consecutivo: consecutivo };
    try {
        const response = await fetch(URL_BASE + 'getDetalleRemesas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        // Mostrar la respuesta original
        const result = await response.json();
        if (!Array.isArray(result.data)) {
            console.error("Error: La API no devolvió un array en 'data'");
            return;
        }
        
        // Convertir Fondo a objeto si es necesario
        const remesas = result.data.map(remesa => {
            if (typeof remesa.Fondo === "string") {
                try {
                    remesa.Fondo = JSON.parse(remesa.Fondo);
                } catch (error) {
                    console.error(`Error al parsear Fondo en remesa ${remesa.ID_CONTRATO}:`, error);
                    remesa.Fondo = {}; // Si falla, asignar objeto vacío
                }
            }
            return remesa;
        });  
        
        console.log('remesas:', remesas);
        mostrarRemesas(remesas);
    } catch (error) {
        console.error('Error al obtener el listado de remesas:', error.message);
    }
}
// Funcion para obtener el listado de remesas
async function obtenerListaRemesas() {
    try {
        const response = await fetch(URL_BASE + 'getListaRemesas', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        return result.data;  // Retorna los datos correctamente
    } catch (error) {
        console.error('Error al obtener el listado de remesas:', error.message);
        return [];  // Retorna un array vacío en caso de error
    }
}


