// Funciones globales y utilidades
import Global from './funcionesGlobales.js';
// Declarar una variable global
let dataContestaciones;

// Evento para cargar el contenido de la página
document.addEventListener('DOMContentLoaded', () => {
    // Funcion para cargar la app   
    cargarApp();
    // Verifica que existe el formulario de crear contestacion
    const formCrearContestacion = document.getElementById("formCrearContestacion");
    if (formCrearContestacion) {
        formCrearContestacion.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(formCrearContestacion);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            // console.log('data: ', data);
            crearContestacion(data);
            setTimeout(() => {
                window.location.href = "ContestacionPanelControl.html";
            }, 3000);
        });
    }

    // Referencia al botón de limpiar filtros
    const btnLimpiar = document.getElementById("btn-limpiar");
    // Referencia al botón de filtrar trámites
    const btnFiltrar = document.getElementById("btn-filtrar");
    // Limpiar filtros
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function () {
            document.querySelectorAll('.filtro-select, .filtro-input, .filtro-date').forEach(element => {
                if (element.tagName === 'SELECT') {
                    element.value = 'Todos';
                } else {
                    element.value = '';
                }
            });
            console.clear();
            const filtrosIniciales = {
                ID_RegistroOficios: '',
                TipoOficio: '',
                NumeroOficio: '',
                FechaRetroactivo: '',
                DirigidoA: '',
                Asunto: '',
                Institucion: '',
                Solicita: '',
                FolioInterno: '',
                Estado: '',
                FechaEntregaDGAnalista: '',
                Concepto: '',
                RespuestaA: '',
                Monto: '',
                FechaRecepcionDependencia: '',
                FechaEntregaAnalistaOperador: '',
                Comentario: '',
                ArchivoAdjunto: '',
                UsuarioRegistro: '',
                FechaRegistro: '',
                FechaActualizacion: '',
                FechaLimitePago: ''
            };
            filtrarTramites(filtrosIniciales);
        });
    }
    // Filtrar trámites
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function () {
            // Definir todos los filtros con su tipo
            const filterConfig = [
                { id: 'ID_RegistroOficios', type: 'text' },
                { id: 'TipoOficio', type: 'text' },
                { id: 'NumeroOficio', type: 'text' },
                { id: 'FechaRetroactivo', type: 'date' },
                { id: 'DirigidoA', type: 'text' },
                { id: 'Asunto', type: 'text' },
                { id: 'Institucion', type: 'text' },
                { id: 'Solicita', type: 'text' },
                { id: 'FolioInterno', type: 'text' },
                { id: 'Estado', type: 'text' },
                { id: 'FechaEntregaDGAnalista', type: 'date' },
                { id: 'Concepto', type: 'text' },
                { id: 'RespuestaA', type: 'text' },
                { id: 'Monto', type: 'number' },
                { id: 'FechaRecepcionDependencia', type: 'date' },
                { id: 'FechaEntregaAnalistaOperador', type: 'date' },
                { id: 'Comentario', type: 'text' },
                { id: 'ArchivoAdjunto', type: 'text' },
                { id: 'UsuarioRegistro', type: 'text' },
                { id: 'FechaRegistro', type: 'datetime-local' },
                { id: 'FechaActualizacion', type: 'datetime-local' },
                { id: 'FechaLimitePago', type: 'datetime-local' }
            ];

            // Objeto para almacenar los filtros aplicados
            const appliedFilters = {};

            filterConfig.forEach(config => {
                const element = document.getElementById(config.id);
                let value = element.value.trim();

                // Manejar diferentes tipos de inputs
                if (element.tagName === 'SELECT') {
                    if (value !== 'Todos') {
                        appliedFilters[config.id.replace('Select', '')] = value;
                    }
                } else {
                    if (value !== '' && !(config.type === 'number' && isNaN(value))) {
                        if (config.type === 'number') value = Number(value);
                        appliedFilters[config.id.replace('Select', '')] = value;
                    }
                }
            });

            //console.log('Filtros aplicados:', appliedFilters);
            filtrarTramites(appliedFilters);
        });
    }

    // Mostrar/ocultar filtros
    const btnExportar = document.getElementById('btn-mostrar-ocultar');
    const filtros = document.querySelector('.row.g-3');
    btnExportar.addEventListener('click', () => {
        if (filtros.hasAttribute('hidden')) {
            filtros.removeAttribute('hidden');
        } else {
            filtros.setAttribute('hidden', true);
        }
    });
});

// Funcion para cargar la app
async function cargarApp() {
    // Obtener contestaciones
    await listarContestaciones();
    // Verifica si existe la tabla de tableContestaciones para cargar los datos
    const tableContestaciones = document.getElementById("tableContestaciones");
    if (tableContestaciones) {
        // Llenar tabla de oficios
        llenarTablaContestaciones(dataContestaciones, "tableContestaciones");
    }
    // Verifica si el botón existe crear oficio
    const crearContestacion = document.getElementById("crearContestacion");
    if (crearContestacion) {
        crearContestacion.addEventListener("click", () => {
            window.location.href = "ContestacionCrear.html";
        });
    }
    // Verifica si el botón existe crear downloadExcel
    const downloadButton = document.getElementById("descargarExcelOficios");
    if (downloadButton) {
        downloadButton.addEventListener("click", () => exportToExcel("tableContestaciones"));
    }
    // Evento para validar el formulario de edición de contestaciones
    const formEditarContestacion = document.getElementById("formEditarContestacion");
    if (formEditarContestacion) {
        // Primero se obtiene el id del contestacion
        const urlParams = new URLSearchParams(window.location.search);
        const contestacionID = urlParams.get('ID_RegistroOficios');
        // Llenar el formulario con los datos del contestacion
        llenarformEditarContestaciones(contestacionID);
        document.getElementById("Comentario").value = "";


        formEditarContestacion.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(this); // ✅ FormData original

            // Quitar campo innecesario (opcional)
            formData.delete('ArchivoAdjuntoName');

            actualizarContestacion(formData); // Enviar FormData directamente
            setTimeout(() => {
                window.location.href = "ContestacionPanelControl.html";
            }, 3000); // 5 segundos
        });
    }
    // Evento para validar el formulario de ver contestacion
    const formVerContestacion = document.getElementById("formVerContestacion");
    if (formVerContestacion) {
        const urlParams = new URLSearchParams(window.location.search);
        const contestacionID = urlParams.get('ID_RegistroOficios');
        // Llenar el formulario con los datos del contestacion
        llenarformEditarContestaciones(contestacionID);
    }
}
// Funcion para obtener los oficios
async function listarContestaciones() {
    let resContestaciones = await fetch(Global.URL_BASE + 'listarRegistroOficios');
    let jsonContestaciones = await resContestaciones.json();
    // Guardar respuesta en variable global
    dataContestaciones = jsonContestaciones.data;
    // console.log('Contestaciones: ', dataContestaciones);
}
// Función para llenar la tabla de contestaciones
function llenarTablaContestaciones(data, tableId) {
    // Verificar si DataTable ya está inicializado y destruirlo para actualizar
    if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
        $(`#${tableId}`).DataTable().clear().destroy();
    }

    // Formatear el importe a moneda
    const formatoMoneda = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });

    // Inicializar DataTable con los datos obtenidos
    $(`#${tableId}`).DataTable({
        data: data,
        columns: [
            {
                data: null,
                render: function (data) {
                    let botones = "";
                    const usuario = JSON.parse(localStorage.getItem("usuario"));
                    if (usuario && usuario.RolUser === "Admin" || usuario.RolUser === "OP_Correspondencia" || usuario.RolUser === "OP_Suficiencias") {
                        // BTN de editar
                        botones += `<button class="btn-icon primary" title="Editar" onclick="window.location.href='ContestacionEditar.html?ID_RegistroOficios=' + ${data.ID_RegistroOficios}"><i class="fas fa-edit"></i></button>`;
                        // BTN de ver
                        botones += `<button class="btn-icon primary" title="Ver Detalles" onclick="window.location.href='ContestacionVer.html?ID_RegistroOficios=' + ${data.ID_RegistroOficios}"><i class="fas fa-eye"></i></button>`;
                        // BTN de eliminar
                        botones += `<button class="btn-icon primary" title="Eliminar" onclick="eliminarContestacion(${data.ID_RegistroOficios})"><i class="fas fa-trash"></i></button>`;
                    }
                    // BTN COMENTARIOS
                    const comentarioEscapado = encodeURIComponent(data.Comentario || "");
                    botones += `<button class="btn-icon primary" title="Comentarios" onclick="mostrarComentario('${comentarioEscapado}')"><i class="fas fa-comment-dots"></i></button>`;
                    // BTN VER ARCHIVO ESCANEADO
                    const archivo = data.ArchivoAdjunto || "N/A";
                    if (archivo !== "N/A" && archivo !== "Array") {
                        // C:\xampp\htdocs\DigitalOcean\Egresos\BackEndPagoTrack
                        // /var/www/html/apipagotrack
                        // const basePath = '../BackEndPagoTrack/assets/uploads/oficios/';
                        const basePath = 'https://apipagotrack.mexiclientes.com/assets/uploads/oficios/';
                        botones += `<button class="btn-icon primary" title="Ver archivo" onclick="window.open('${basePath}${archivo}', '_blank')"><i class="fas fa-file-pdf"></i></button>`;
                    }
                    return botones;
                }
            },
            { data: "ID_RegistroOficios" },
            { data: "FechaRegistro" },
            { data: "TipoOficio" },
            { data: "NumeroOficio" },
            { data: "FechaRetroactivo" },
            { data: "DirigidoA" },
            { data: "Asunto" },
            { data: "Institucion" },
            { data: "TurnadoNombreCompleto" },
            { data: "FolioInterno" },
            { data: "Estado" },
            { data: "FechaEntregaDGAnalista" },
            { data: "Concepto" },
            { data: "RespuestaA" },
            {
                data: "Monto",
                render: function (data) {
                    return data ? formatoMoneda.format(data) : "$0.00";
                }
            },
            { data: "FechaRecepcionDependencia" },
            { data: "FechaEntregaAnalistaOperador" },
            { data: "UsuarioRegistroNombreCompleto" },
            { data: "FechaActualizacion" },

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
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        responsive: true,
        order: [[2, "DESC"]],
    });
}
// Función para crear una contestacion
function crearContestacion(data) {
    fetch(Global.URL_BASE + 'crearRegistroOficio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
        })
        .then(response => {
            const raw = response.data;
            const json = typeof raw === 'string' ? JSON.parse(raw) : raw;

            alert(json.message || "Contestación procesada");
        })
        .catch(error => {
            console.error("Error al crear la contestacion:", error);
            alert("Error de red o del servidor: " + error.message);
        });
}
// Función para generar y descargar el archivo Excel
function exportToExcel(tableId) {
    const table = document.querySelector(`#${tableId}`); // Usamos el ID dinámico
    if (table) { // Verifica si la tabla existe
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" }); // Convierte la tabla en un libro de Excel
        XLSX.writeFile(wb, "datos_contestaciones.xlsx"); // Descarga el archivo Excel con el nombre especificado
    } else {
        console.error("La tabla no existe en el DOM.");
    }
}
// Función para llenar el formulario de edición de oficios
function setValueIfExists(id, value) {
    const input = document.getElementById(id);
    if (input) {
        input.value = value || '';
    }
}
// Función para llenar el formulario de edición de contestaciones
function llenarformEditarContestaciones(contestacionID) {
    const idNumerico = Number(contestacionID);
    const contestacion = dataContestaciones.find(contestacion => contestacion.ID_RegistroOficios === idNumerico);

    if (!contestacion) {
        console.error("No se encontró la contestacion con ID:", contestacionID);
        return;
    }
    setValueIfExists("ID_RegistroOficios", contestacion.ID_RegistroOficios);
    setValueIfExists("TipoOficio", contestacion.TipoOficio);
    setValueIfExists("NumeroOficio", contestacion.NumeroOficio);
    setValueIfExists("FechaRetroactivo", contestacion.FechaRetroactivo?.substring(0, 10));
    setValueIfExists("DirigidoA", contestacion.DirigidoA);
    setValueIfExists("Asunto", contestacion.Asunto);
    setValueIfExists("Institucion", contestacion.Institucion);
    setValueIfExists("Solicita", contestacion.Solicita);
    setValueIfExists("FolioInterno", contestacion.FolioInterno);
    setValueIfExists("Estado", contestacion.Estado);
    setValueIfExists("FechaEntregaDGAnalista", contestacion.FechaEntregaDGAnalista?.substring(0, 10));
    setValueIfExists("Concepto", contestacion.Concepto);
    setValueIfExists("RespuestaA", contestacion.RespuestaA);
    setValueIfExists("Monto", contestacion.Monto);
    setValueIfExists("FechaRecepcionDependencia", contestacion.FechaRecepcionDependencia?.substring(0, 10));
    setValueIfExists("FechaEntregaAnalistaOperador", contestacion.FechaEntregaAnalistaOperador?.substring(0, 10));
    setValueIfExists("Comentario", contestacion.Comentario);
    setValueIfExists("ArchivoAdjuntoName", contestacion.ArchivoAdjunto);
    setValueIfExists("UsuarioRegistro", contestacion.UsuarioRegistro);
    setValueIfExists("FechaRegistro", contestacion.FechaRegistro?.substring(0, 10));
    setValueIfExists("FechaActualizacion", contestacion.FechaActualizacion?.substring(0, 10));
}
// Función para actualizar un contestacion
function actualizarContestacion(data) {
    const fetchOptions = {
        method: 'POST',
        body: data // ✅ Si es FormData, no uses JSON.stringify
    };

    // Solo añadir headers si es JSON
    if (!(data instanceof FormData)) {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify(data);
    }


    fetch(Global.URL_BASE + 'actualizarRegistroOficioArchivo', fetchOptions)
        .then(async response => {
            const text = await response.text();
            try {
                const json = JSON.parse(text);
                alert(json.message || "✅ Actualización exitosa");
                return json;
            } catch (err) {
                console.warn("⚠ Respuesta no JSON:", text);
                alert("⚠ Respuesta inesperada del servidor:\n" + text);
                return { success: false, message: text };
            }
        })
        .catch(error => {
            alert("❌ Error de red:\n" + error.message);
            return { success: false, message: error.message };
        });
}
// Funcion para validar el archivo PDF
function validarArchivoPDF(formularioId, archivoInputId) {
    const archivoInput = document.getElementById(archivoInputId);
    const archivo = archivoInput?.files?.[0];

    if (!archivo) {
        alert('⚠ Por favor selecciona un archivo antes de continuar.');
        return false;
    }

    const extensionValida = archivo.name.toLowerCase().endsWith('.pdf');
    if (!extensionValida) {
        alert('❌ El archivo debe ser un PDF (.pdf).');
        return false;
    }

    const maxSize = 3 * 1024 * 1024; // 3 MB
    if (archivo.size > maxSize) {
        alert('❌ El archivo supera el tamaño máximo permitido de 3 MB.');
        return false;
    }

    //console.log('✅ Validación de archivo PDF exitosa');
    return true;
}
// Eliminar oficio por ID_RegistroOficios
window.eliminarContestacion = function (ID_RegistroOficios) {
    if (confirm("¿Estás seguro de eliminar este oficio?")) {
        fetch(Global.URL_BASE + 'eliminarRegistroOficio', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ID_RegistroOficios: ID_RegistroOficios })
        })
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Error en la solicitud");
                }

                if (data.success) {
                    alert(data.message);
                    window.location.reload();
                } else {
                    throw new Error(data.message || "No se pudo eliminar");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("❌ " + error.message);
            });
    }
}
// Mostrar comentario en modal
function mostrarComentario(comentario) {
    const comentarioDecoded = decodeURIComponent(comentario);
    let htmlContenido = '';

    try {
        const comentarios = JSON.parse(comentarioDecoded);

        if (Array.isArray(comentarios)) {
            htmlContenido = comentarios.map(entry => {
                return `
                    <div class="comentario-card mb-3 p-3 border rounded shadow-sm">
                        ${entry.ID_OFICIO ? `<div><strong># Oficio:</strong> ${entry.ID_OFICIO}</div>` : ''}
                        <div><strong>Fecha:</strong> ${entry.Fecha || 'N/A'}</div>
                        <div><strong>Estatus:</strong> ${entry.Estatus || 'N/A'}</div>
                        ${entry.Modificado_Por ? `<div><strong>Modificado Por:</strong> ${entry.Modificado_Por}</div>` : ''}
                        ${entry.Usuario ? `<div><strong>Usuario:</strong> ${entry.Usuario}</div>` : ''}
                        <div><strong>Comentario:</strong><br><div class="comentario-texto">${entry.Comentario || 'Sin comentario'}</div></div>
                    </div>
                `;
            }).join('');
        } else {
            htmlContenido = `
                <div class="comentario-card p-3 border rounded shadow-sm">
                    <div><strong>Comentario:</strong><br><div class="comentario-texto">${comentarios.Comentario || comentarioDecoded}</div></div>
                </div>
            `;
        }
    } catch (e) {
        console.error('El comentario no es un JSON válido:', e);
        htmlContenido = `<div class="alert alert-warning">El formato del comentario no es válido.</div>`;
    }

    $('#comentarioModal .modal-body').html(htmlContenido);
    $('#comentarioModal').modal('show');
}
// Filtrar trámites por estado
function filtrarTramites(filtros) {
    let base = dataContestaciones;
    console.log('Datos en Memoria:', base);

    const mapaCampos = {
        DirigidoA : 'DirigidoA',
        Asunto : 'Asunto',
        Concepto : 'Concepto',
        Comentario : 'Comentario'
    };

    const camposExactos = [
        'ID_RegistroOficios',
        'TipoOficio',
        'NumeroOficio',
        'FechaRetroactivo',
        'Institucion',
        'Solicita',
        'FolioInterno',
        'Estado',
        'FechaEntregaDGAnalista',
        'RespuestaA',
        'Monto',
        'FechaRecepcionDependencia',
        'FechaEntregaAnalistaOperador',
        'ArchivoAdjunto',
        'UsuarioRegistro',
        'FechaRegistro',
        'FechaActualizacion',
        'FechaLimitePago'
    ];

    const filtrados = base.filter(tramite => {
        for (let campo in filtros) {
            const valorFiltro = filtros[campo];
            if (valorFiltro === '' || valorFiltro === 'Todos') continue;

            const campoReal = mapaCampos[campo] || campo;
            const valorTramite = tramite[campoReal];

            // Comparación numérica
            if (campo === 'Monto') {
                if (parseFloat(valorTramite) !== parseFloat(valorFiltro)) return false;

            // Comparación por fecha (solo fecha sin hora)
            } else if (['FechaRecepcion', 'FechaVencimiento', 'FechaRetroactiva', 'FechaEntregaAcuse', 'FechaLimitePago'].includes(campo)) {
                const fechaBase = valorTramite ? valorTramite.split(' ')[0] : '';
                if (fechaBase !== valorFiltro) return false;

            // Comparación exacta o parcial
            } else if (typeof valorTramite === 'string') {
                if (camposExactos.includes(campo)) {
                    if (valorTramite !== valorFiltro) return false;
                } else {
                    if (!valorTramite.toLowerCase().includes(valorFiltro.toLowerCase())) return false;
                }

            } else {
                if (valorTramite != valorFiltro) return false;
            }
        }
        return true;
    });

    console.log('Filtrados:', filtrados);
    llenarTablaContestaciones(filtrados, 'tableContestaciones');
}
// Agrega esta línea al final de tu archivo Oficios.js
window.eliminarContestacion = eliminarContestacion;
window.mostrarComentario = mostrarComentario;