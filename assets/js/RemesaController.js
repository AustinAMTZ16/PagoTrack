// Obtener la URL base dinámicamente
const URL_B = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '/')}`;
// Completar con la URI
const URL_BASE = `${URL_B}index.php?action=`;

let ltRemesas = [];

// Obtener el nombre + apellido del usuario de LocalStorage
const usuario = JSON.parse(localStorage.getItem('usuario'));
const NombreUser = usuario.NombreUser + ' ' + usuario.ApellidoUser;
const DeoartametoUserLocalStorage = usuario.DepartamentoUser;


// Evento para cargar el contenido de la página
document.addEventListener("DOMContentLoaded", function () {
    // Obtener el parámetro "consecutivo" de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Validar si el parámetro consecutivo existe
    const consecutivo = urlParams.get('consecutivo');
    if (consecutivo) {
        //console.log('consecutivo: ' + consecutivo);
        armarRemesa(consecutivo);
    }
    // Validar si el elemento tableListaRemesas existe
    const tableListaRemesas = document.getElementById('tableListaRemesas');
    if (tableListaRemesas) {
        // Obtener el listado de remesas y llenar la tabla
        obtenerListaRemesas().then(listadoRemesas => {
            actualizarTablaRemesas(listadoRemesas, 'tableListaRemesas');

            // llenarTablaRemesas(listadoRemesas);
        }).catch(error => {
            console.error("Error al obtener el listado de remesas:", error.message);
        });
    }

    // Obtener el parámetro "ID_REMESA" de la URL
    const ID_REMESA = urlParams.get('ID_REMESA');
    const DepartamentoTurnado = urlParams.get('DepartamentoTurnado');
    const rawFechaRemesa = urlParams.get('FechaRemesa');
    const FechaRemesa = rawFechaRemesa ? rawFechaRemesa.split(' ')[0] : '';
    const FKNumeroRemesa = urlParams.get('FKNumeroRemesa');
    const rawFechaPago = urlParams.get('FechaPago');
    const FechaPago = rawFechaPago ? rawFechaPago.split(' ')[0] : '';
    const Estatus = urlParams.get('Estatus');
    const Comentarios = urlParams.get('Comentarios');
    if (document.getElementById('ID_REMESA')) {
        document.getElementById('ID_REMESA').value = ID_REMESA;
        document.getElementById('DepartamentoTurnado').value = DepartamentoTurnado;
        document.getElementById('FechaRemesa').value = FechaRemesa;
        document.getElementById('FKNumeroRemesa').value = FKNumeroRemesa;
        document.getElementById('FechaPago').value = FechaPago;
        document.getElementById('Estatus').value = Estatus;
        document.getElementById('Comentarios').value = Comentarios && Comentarios.trim() !== '' ? Comentarios : 'Nota: ';
    }

    // Validar formConfigurarRemesa 
    const formConfigurarRemesa = document.getElementById('formConfigurarRemesa');
    if (formConfigurarRemesa) {
        formConfigurarRemesa.addEventListener('submit', function (event) {
            event.preventDefault();
            const data = {
                ID_REMESA: document.getElementById('ID_REMESA').value,
                DepartamentoTurnado: document.getElementById('DepartamentoTurnado').value,
                FechaPago: document.getElementById('FechaPago').value,
                Estatus: document.getElementById('Estatus').value,
                Comentarios: document.getElementById('Comentarios').value,
                Analista: NombreUser
            };
            //updateRemesa
            updateRemesa(data);
        });
    }

    //validar si existe el formulario de asignar remesa
    const formAsignarRemesa = document.getElementById('formAsignarRemesa');
    if (formAsignarRemesa) {
        //Obtener el ID_TRAMITE de la URL 
        const ID_TRAMITE = urlParams.get('id');
        if (ID_TRAMITE) {
            document.getElementById('ID_TRAMITE').value = ID_TRAMITE;
        }
        formAsignarRemesa.addEventListener('submit', function (event) {
            event.preventDefault();
            const data = {
                ID_CONTRATO: document.getElementById('ID_TRAMITE').value,
                Estatus: document.getElementById('Estatus').value,
                RemesaNumero: document.getElementById('NumeroRemesa').value,
                MotivoModificacion: document.getElementById('Comentarios').value,
                Analista: NombreUser
            };
            updateTramiteCompleto(data);
        });
    }

    const urlParamsRemesa = new URLSearchParams(window.location.search);
    const remesaRaw = urlParamsRemesa.get("remesa");
    if (remesaRaw) {
        // 🧠 Cortar remesa por el segundo guion
        const partes = remesaRaw.split("-");
        const remesaBuscada = partes.length >= 2 ? `${partes[0]}-${partes[1]}` : remesaRaw;

        // Esperar a que DataTable esté cargada (esperamos 100ms)
        setTimeout(() => {
            // Buscar input de búsqueda global de DataTable
            const inputBusqueda = document.querySelector('input[type="search"]');
            if (inputBusqueda) {
                inputBusqueda.value = remesaBuscada;
                const evento = new Event('input', { bubbles: true });
                inputBusqueda.dispatchEvent(evento);
            }
        }, 100);
    }
});

// Funcion para ver el detalle de las remesas
function verDetalleRemesa(consecutivo) {
    // window.location.href = 'detalleRemesas.html?consecutivo=' + consecutivo;
    window.open('detalleRemesas.html?consecutivo=' + consecutivo, '_blank');
}
// Funcion para cambiar el estatus de los trámites de la remesa
async function cambiarEstatusRemesa(consecutivo, estatus) {
    await armarRemesa(consecutivo);

    // Obtener solo los ID_CONTRATO en formato string separados por coma
    const idsContrato = ltRemesas.map(remesa => remesa.ID_CONTRATO).join(',');

    const data = {
        FKNumeroRemesa: consecutivo,
        Estatus: estatus,
        ID_CONTRATO: idsContrato, // ✅ Aquí ya estás pasando todos los IDs
        Analista: NombreUser
    };

    try {
        const response = await fetch(URL_BASE + 'updateRemesaTramites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        alert('Trámites actualizados correctamente' + result.message);
        location.reload();
    } catch (error) {
        console.error('Error al actualizar los trámites:', error.message);
    }
}
// Funcion para mostrar las remesas
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
    document.getElementById('Grupo').innerHTML = 'Remesa: ' + remesas[0]?.Grupo || 'N/A';

    // Mostrar los comentarios
    document.getElementById('Comentarios').innerHTML = remesas[0]?.Comentarios || ' ';

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
    const data = {
        consecutivo: consecutivo,
        Analista: NombreUser
    };
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

        // console.log('remesas:', remesas);
        ltRemesas = remesas;
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
// Funcion para crear una nueva remesa
async function configurarRemesa(grupo) {
    const data = {
        DepartamentoTurnado: 'GLOSA',
        FKNumeroRemesa: grupo,
        Estatus: 'Pendiente',
        Comentarios: '',
        Analista: NombreUser
    }

    try {
        const response = await fetch(URL_BASE + 'createRemesa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        if (result.message === 'La remesa ya existe en el sistema.') {
            window.location.href = 'configurarRemesa.html?ID_REMESA=' + result.data[0].ID_REMESA + '&DepartamentoTurnado=' + result.data[0].DepartamentoTurnado + '&FechaRemesa=' + result.data[0].FechaRemesa + '&FKNumeroRemesa=' + result.data[0].FKNumeroRemesa + '&FechaPago=' + result.data[0].FechaPago + '&Estatus=' + result.data[0].Estatus + '&Comentarios=' + result.data[0].Comentarios;
        } else {
            alert('Remesa creada correctamente');
            location.reload();
        }

    } catch (error) {
        console.error('Error al crear la remesa:', error.message);
        return null;
    }
}
// Funcion para actualizar la remesa
async function updateRemesa(data) {
    try {
        const response = await fetch(URL_BASE + 'updateRemesa', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        alert('Remesa actualizada correctamente' + result.message);
        window.location.href = 'seguimientoRemesas.html';
    } catch (error) {
        console.error('Error al actualizar la remesa:', error.message);
    }
}
// Función Actualizar Tramite Completo
async function updateTramiteCompleto(data) {
    try {
        // Paso 1: Actualiza el trámite
        const response = await fetch(URL_BASE + 'updateTramiteCompleto', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        const result = await response.json();
        if (result.message === 'Tramite modificados.') {
            alert('✅ Trámite actualizado correctamente: ' + result.message);
            // Paso 4: Redirige al dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error("Error en el proceso:", error);
        alert('❌ Error durante la operación.\n' + error.message);
    }
}
// Funcion para llenar la tabla con los datos de la remesa
function actualizarTablaRemesas(data, tableId) {
    if (!Array.isArray(data)) {
        console.error("Error: La respuesta no es un array válido.", data);
        alert("Error: Datos inválidos.");
        return;
    }

    // Destruir tabla si ya está inicializada
    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().clear().destroy();
    }

    // Inicializar DataTable
    $(`#${tableId}`).DataTable({
        data: data,
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1; // Índice numérico
                }
            },
            { data: "Grupo" },
            { data: "TotalRegistros" },
            {
                data: "Estatus",
                render: function (data, type, row) {
                    return (data && data.trim()) ? data : "No creada";
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    const grupo = data.Grupo;
                    const estatus = (data.Estatus && data.Estatus.trim()) ? data.Estatus : "No creada";

                    let buttons = `
                                        <button class="btn btn-primary toggleButton" onclick="configurarRemesa('${grupo}')">Configurar</button>
                                    `;

                    if (estatus !== "No creada") {
                        buttons += `
                                        <button class="btn btn-primary toggleButton" onclick="verDetalleRemesa('${grupo}')">Imprimir</button>
                                    `;
                        if (usuario.RolUser === 'Admin') {
                            buttons += `
                                        <button class="btn btn-primary toggleButton" onclick="verDetalleRemesaCorte('${grupo}')">IMP_CORTE</button>
                                    `;
                        }
                    }

                    if (estatus === "Pendiente" &&
                        DeoartametoUserLocalStorage === 'Presupuesto' || DeoartametoUserLocalStorage === 'Admin' || DeoartametoUserLocalStorage === 'Tramite') {
                        buttons += `
                                        <button class="btn btn-success toggleButton" onclick="cambiarEstatusRemesa('${grupo}', 'RemesaAprobada')">Aprobar Remesa</button>
                                    `;
                    }

                    if (
                        estatus === "RemesaAprobada" &&
                        (DeoartametoUserLocalStorage === 'OrdenesPago' || DeoartametoUserLocalStorage === 'Admin')
                    ) {
                        buttons += `
                                        <button class="btn btn-warning toggleButton" onclick="cambiarEstatusRemesa('${grupo}', 'OrdenesPago')">Órdenes Pago</button>
                                    `;
                    }


                    return buttons;
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
        lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "Todos"]],
        responsive: true,
        order: [[0, "asc"]],

        initComplete: function () {
            const urlParams = new URLSearchParams(window.location.search);
            const remesaRaw = urlParams.get("remesa");

            if (remesaRaw) {
                const partes = remesaRaw.split("-");
                const remesaBuscada = partes.length >= 2 ? `${partes[0]}-${partes[1]}` : remesaRaw;

                // Aplica el filtro al campo de búsqueda
                this.api().search(remesaBuscada).draw();
            }
        }

    });
}
function llenarTablaRemesas(listadoRemesas) {
    tableListaRemesas.innerHTML = '';

    // Encabezado
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = ` 
        <th>#</th>
        <th>Remesa</th>
        <th>No. Trámites</th>
        <th>Acciones</th>
    `;
    tableListaRemesas.appendChild(headerRow);

    // Función para extraer fecha si tiene formato válido
    function extraerFecha(remesa) {
        let match8 = remesa.Grupo.match(/^(\d{8})-\d+$/); // 05062025-100
        if (match8) return match8[1];

        let match6 = remesa.Grupo.match(/^(\d{6})-\d+$/); // 050625-100
        if (match6) {
            let raw = match6[1]; // 050625
            let dia = raw.slice(0, 2);
            let mes = raw.slice(2, 4);
            let anioCorto = raw.slice(4, 6);
            let anio = parseInt(anioCorto) >= 50 ? `19${anioCorto}` : `20${anioCorto}`;
            return `${dia}${mes}${anio}`; // Devuelve 05062025
        }

        return null;
    }

    // Ordenar remesas
    listadoRemesas.sort((a, b) => {
        const fechaA = extraerFecha(a);
        const fechaB = extraerFecha(b);

        // Si ambas tienen fecha válida
        if (fechaA && fechaB) {
            return parseInt(fechaB) - parseInt(fechaA); // más reciente primero
        }

        // Si solo A tiene formato válido
        if (fechaA) return -1;

        // Si solo B tiene formato válido
        if (fechaB) return 1;

        // Ninguno tiene formato válido, mantener orden original
        return 0;
    });

    // Llenar tabla
    listadoRemesas.forEach((remesa, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${remesa.Grupo}</td>
            <td>${remesa.TotalRegistros}</td>
            <td>
                <button class="btn btn-primary toggleButton" onclick="configurarRemesa('${remesa.Grupo}')">Configurar</button>
                <button class="btn btn-primary toggleButton" onclick="verDetalleRemesa('${remesa.Grupo}')">Imprimir</button>
                <button class="btn btn-primary toggleButton" onclick="cambiarEstatusRemesa('${remesa.Grupo}', 'RemesaAprobada')">Aprobar Remesa</button>
            </td>
        `;
        tableListaRemesas.appendChild(row);
    });
}
async function crearRemesa(RemesaNumero, Analista) {
    // Paso 2: Extrae ID de remesa (ej. "04062025-1-1" => "04062025-1")
    const remesaID = RemesaNumero.split('-').slice(0, 2).join('-');
    // Paso 3: Estructura completa
    const data = {
        FKNumeroRemesa: remesaID,
        Analista: Analista
    };
    const remesaResponse = await fetch(URL_BASE + 'createRemesa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!remesaResponse.ok) {
        throw new Error(`Error en la solicitud: ${remesaResponse.status}`);
    }
    const result = await remesaResponse.json();
    console.log('Resultado de la actualización del trámite:', result);
    if (result.message === 'Remesa registrada.') {
        alert('✅ Trámite actualizado correctamente: ' + result.message);
        // Paso 4: Redirige al dashboard
        window.location.href = 'dashboard.html';
    }

    if (!remesaResponse.ok) {
        throw new Error(`Error al crear la remesa: ${remesaResponse.status}`);
    }



}



// Funcion para ver el detalle de las remesas
function verDetalleRemesaCorte(consecutivo) {
    // window.location.href = 'corte.html?consecutivo=' + consecutivo;
    window.open('corte.html?consecutivo=' + consecutivo, '_blank');
}
// Funcion para mostrar las remesas
function mostrarRemesasCorte(remesas) {
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
    document.getElementById('Grupo').innerHTML = 'Remesa: ' + remesas[0]?.Grupo || 'N/A';

    // Mostrar los comentarios
    document.getElementById('Comentarios').innerHTML = remesas[0]?.Comentarios || ' ';

    const tabla = document.getElementById('tablaRemesaCorte');
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
    `;
    tbody.appendChild(totalRow);
}