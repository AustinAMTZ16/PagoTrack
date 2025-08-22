// Funciones globales y utilidades
import Global from './funcionesGlobales.js';
// Obtener el nombre + apellido del usuario de LocalStorage
const usuario = JSON.parse(localStorage.getItem('usuario'));
const NombreUser = usuario.NombreUser + ' ' + usuario.ApellidoUser;
const idUser = usuario.InicioSesionID;
// obetener estaus del url 
const urlFlagVolante = new URLSearchParams(window.location.search);
const FlagVolante = urlFlagVolante.get('FlagVolante');
const VolantesVencidos = urlFlagVolante.get('VolantesVencidos');

// console.log("Estatus del URL:", FlagVolante);
// console.log("VolantesVencidos del URL:", VolantesVencidos);
// Evento para cargar el contenido de la página
document.addEventListener("DOMContentLoaded", function () {
    // FlagVolante != 0 inabilita el select estatus del tramite Estatus  y el btn guardar tramite  btnGuardar
    if (FlagVolante) {
        if (FlagVolante != 0) {
            const selectEstatus = document.getElementById("Estatus");
            if (selectEstatus) {
                selectEstatus.disabled = true; // Deshabilita el select
            }
            const btnGuardar = document.getElementById("btnGuardar");
            if (btnGuardar) {
                btnGuardar.disabled = true; // Deshabilita el botón
            }
        }

        // Tambien se valida VolantesVencidos != 0  si es diferente a 0 solo mostrara en Estatus Devuelto

        // Regla 2: si hay vencidos, mostrar SÓLO "Devuelto" y seleccionarlo
        if (Number(VolantesVencidos) !== 0) {

            const selectEstatus = document.getElementById("Estatus");
            const btnGuardar = document.getElementById("btnGuardar");
            if (!selectEstatus.dataset.originalHtml) {
                selectEstatus.dataset.originalHtml = selectEstatus.innerHTML;
            }


            // Intenta tomar la opción Devuelto de las opciones actuales;
            // si no existe (por cambios previos), la recrea.
            let devuelto = selectEstatus.querySelector('option#Devuelto') || null;

            // Limpia todas las opciones
            selectEstatus.innerHTML = "";

            // Si no estaba, créala
            if (!devuelto) {
                devuelto = document.createElement("option");
                devuelto.id = "Devuelto";
                devuelto.value = "Devuelto";
                devuelto.textContent = "Devuelto";
            }

            // Añade sólo Devuelto y selecciónalo
            selectEstatus.appendChild(devuelto);
            devuelto.selected = true;

            // Dado que sólo hay una opción válida, puedes mantener habilitado el select
            // para que el usuario vea el valor, o deshabilitarlo si así lo deseas:
            // selectEstatus.disabled = true; // opcional
        } 
    }
    // Evento para crear un trámite
    const formTramite = document.getElementById("formcreateTramite");
    if (formTramite) {
        formTramite.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(formTramite);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            // console.log('Datos enviados:', data);
            createTramite(data);
        });
    }
    // Obtener el parámetro "id" de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const ID_CONTRATO = urlParams.get('id');
    const Proveedor = urlParams.get('proveedor');
    const Concepto = urlParams.get('concepto');
    const Importe = urlParams.get('importe');
    const FechaLimite = urlParams.get('fechaLimite');
    const FechaRecepcion = urlParams.get('fechaRecepcion');
    const Dependencia = urlParams.get('dependencia');
    const NombreUser = urlParams.get('nombreUser');
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
    if (FechaLimite) {
        const inputField = document.getElementById('FechaLimite');
        inputField.value = FechaLimite;
    }
    if (FechaRecepcion) {
        const inputField = document.getElementById('FechaRecepcion');
        inputField.value = FechaRecepcion;
    }
    if (Dependencia) {
        const inputField = document.getElementById('Dependencia');
        inputField.value = Dependencia;
    }
    if (NombreUser) {
        const inputField = document.getElementById('NombreUser');
        inputField.value = NombreUser;
    }
    // Evento para turnar un trámite
    const formTurnarTramite = document.getElementById('formTurnarTramite');
    if (formTurnarTramite) {
        obtenerTramite(ID_CONTRATO);
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
            // 👇 Fuerza que TinyMCE copie el contenido al <textarea>
            tinymce.triggerSave();

            const formData = new FormData(formUpdateTramite);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            console.log('Datos enviados para actualizar el trámite:', data);

            updateTramite(data);
        });
    }
    // Evento para Actualizat todo el un trámite
    const formUpdateTramiteCompleto = document.getElementById("formUpdateTramiteCompleto");
    if (formUpdateTramiteCompleto) {
        obtenerTramite(ID_CONTRATO);
        formUpdateTramiteCompleto.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(formUpdateTramiteCompleto);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            // Llamar la función con el objeto 'data'
            // console.log('Datos enviados para actualizar el trámite completo:', data);
            updateTramiteCompleto(data);
        });
    }

    const rolesConPermisosCompletos = ['Admin', 'OP_KPI', 'Analista'];
    const rolesConPermisoRemesa = ['OP_Remesa', ...rolesConPermisosCompletos];

    const mostrarElemento = id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute("hidden");
    };

    if (rolesConPermisosCompletos.includes(usuario.RolUser)) {
        mostrarElemento("docsap");
        mostrarElemento("integra");
    }

    if (rolesConPermisoRemesa.includes(usuario.RolUser)) {
        mostrarElemento("remesa");
    }

});
// Función para crear un trámite
function createTramite(data) {
    data.Analista = NombreUser;
    fetch(Global.URL_BASE + 'createTramite', {
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
function turnarTramite(data) {
    // Obtener la fecha y hora actual en formato ISO
    const fechaActual = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Agregar la fecha al objeto data
    data.FechaTurnado = fechaActual;
    data.Analista = NombreUser;

    fetch(Global.URL_BASE + 'updateTramite', {
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
// Función Actualizar Tramite Completo
async function updateTramiteCompleto(data) {
    data.Analista = NombreUser;
    return fetch(Global.URL_BASE + 'updateTramiteCompleto', {
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
    // console.log('Obteniendo trámite con ID:', ID_CONTRATO);
    //console.log('ID_CONTRATO: ', ID_CONTRATO);
    return fetch(Global.URL_BASE + 'getTramites', {
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
            //console.log('idTramite: ', ID_CONTRATO);
            try {
                const tramite = result.data.find(tramite => tramite.ID_CONTRATO == ID_CONTRATO);
                //console.log('Tramite obtenido:', tramite);
                // console.log('Trámite encontrado:', tramite.VolantesPorSolventar);
                if (tramite.VolantesPorSolventar != 0) {
                    const selectEstatus = document.getElementById("Estatus");
                    if (selectEstatus) {
                        selectEstatus.disabled = true; // Deshabilita el select
                    }
                    const btnGuardar = document.getElementById("btnGuardar");
                    if (btnGuardar) {
                        btnGuardar.disabled = true; // Deshabilita el botón
                    }
                }

                if (tramite) {
                    // console.log('Trámite encontrado:', tramite);
                    document.getElementById("ID_CONTRATO").value = tramite.ID_CONTRATO || "";
                    document.getElementById("AnalistaID").value = tramite.AnalistaID || "";
                    document.getElementById("Mes").value = tramite.Mes || "";
                    document.getElementById("FechaRecepcion").value = tramite.FechaRecepcion ? tramite.FechaRecepcion.split(" ")[0] : new Date().toISOString().split("T")[0];
                    document.getElementById("TipoTramite").value = tramite.TipoTramite || "";
                    document.getElementById("DependenciaID").value = tramite.DependenciaID || "";
                    document.getElementById("Proveedor").value = tramite.Proveedor || "";
                    document.getElementById("Concepto").value = tramite.Concepto || "";
                    document.getElementById("Importe").value = tramite.Importe || "";
                    document.getElementById("Estatus").value = tramite.Estatus || "";
                    document.getElementById("FK_SRF").value = tramite.FK_SRF || "";
                    renderComentariosEnTextarea(tramite.Comentarios);
                    document.getElementById("Fondo").value = tramite.Fondo || "";

                    if (tramite.Fondo) {
                        try {
                            importesFF = JSON.parse(tramite.Fondo);
                            actualizarTabla();       // renderiza la tabla de fondos
                            actualizarCampoOculto(); // actualiza input oculto y total
                        } catch (e) {
                            console.error("Error al cargar los fondos:", e);
                            importesFF = {};
                        }
                    }
                    const FechaLimitePago = document.getElementById("FechaLimitePago");
                    if (FechaLimitePago) {
                        FechaLimitePago.value = tramite.FechaLimitePago ? tramite.FechaLimitePago.split(" ")[0] : "";
                    }
                    const FechaTurnado = document.getElementById("FechaTurnado");
                    if (FechaTurnado) {
                        FechaTurnado.value = tramite.FechaTurnado ? tramite.FechaTurnado.split(" ")[0] : "";
                    }
                    const FechaTurnadoEntrega = document.getElementById("FechaTurnadoEntrega");
                    if (FechaTurnadoEntrega) {
                        FechaTurnadoEntrega.value = tramite.FechaTurnadoEntrega ? tramite.FechaTurnadoEntrega.split(" ")[0] : "";
                    }
                    const FechaDevuelto = document.getElementById("FechaDevuelto");
                    if (FechaDevuelto) {
                        FechaDevuelto.value = tramite.FechaDevuelto ? tramite.FechaDevuelto.split(" ")[0] : "";
                    }
                    document.getElementById("AnalistaID").value = tramite.AnalistaID || "";
                    const RemesaNumero = document.getElementById("RemesaNumero");
                    if (RemesaNumero) {
                        RemesaNumero.value = tramite.RemesaNumero || "";
                    }
                    const DocSAP = document.getElementById("DocSAP");
                    if (DocSAP) {
                        DocSAP.value = tramite.DocSAP || "";
                    }
                    const IntegraSAP = document.getElementById("IntegraSAP");
                    if (IntegraSAP) {
                        IntegraSAP.value = tramite.IntegraSAP || "";
                    }
                    const OfPeticion = document.getElementById("OfPeticion");
                    if (OfPeticion) {
                        OfPeticion.value = tramite.OfPeticion || "";
                    }
                    const NoTramite = document.getElementById("NoTramite");
                    if (NoTramite) {
                        NoTramite.value = tramite.NoTramite || "";
                    }
                    const DoctacionAnexo = document.getElementById("DoctacionAnexo");
                    if (DoctacionAnexo) {
                        DoctacionAnexo.value = tramite.DoctacionAnexo || "";
                    }
                    const NumeroObra = document.getElementById("NumeroObra");
                    if (NumeroObra) {
                        NumeroObra.value = tramite.NumeroObra || "";
                    }
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
// Función para renderizar los comentarios en el textarea
function renderComentariosEnTextarea(comentariosJSON) {
    const textarea = document.getElementById("ComentariosFeed");

    try {
        const comentarios = JSON.parse(comentariosJSON);
        if (!Array.isArray(comentarios)) throw new Error();

        let textoFinal = "";
        comentarios.reverse().forEach((comentario, index) => {
            textoFinal += `📝 Comentario ${comentarios.length - index}:\n`;
            textoFinal += `📅 Fecha: ${comentario.Fecha || "Sin fecha"}\n`;
            textoFinal += `👤 Por: ${comentario.Modificado_Por || "Desconocido"}\n`;
            textoFinal += `📌 Estatus: ${comentario.Estatus || "N/A"}\n`;
            textoFinal += `🗒️ Detalle: ${comentario.Comentario || "Sin comentario"}\n`;
            textoFinal += `-----------------------------\n`;
        });

        textarea.value = textoFinal;
    } catch (e) {
        textarea.value = "⚠️ No se pudieron cargar los comentarios correctamente.";
    }
}
// Función para actualizar un trámite
async function updateTramite(data) {
    try {
        // --- 1. PRIMERA LLAMADA: ACTUALIZAR EL TRÁMITE PRINCIPAL ---

        // Añadimos el nombre del analista a los datos.
        data.Analista = NombreUser;

        const responseUpdate = await fetch(Global.URL_BASE + 'updateTramite', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!responseUpdate.ok) {
            // Si esta llamada falla, lanzamos un error y nos detenemos.
            const errorData = await responseUpdate.json();
            throw new Error(errorData.message || `Error al actualizar el trámite: ${responseUpdate.status}`);
        }

        const resultUpdate = await responseUpdate.json();

        // --- 2. LÓGICA CONDICIONAL: CREAR VOLANTE SI ES NECESARIO ---
        if (data.Estatus === 'Observaciones') {
            // console.log("Estatus es 'Observaciones', procediendo a crear volante...");

            // Mapeamos los datos del trámite al formato que espera la API del volante.
            const volanteData = {
                TramiteID: data.ID_CONTRATO,
                ErrorID: 4,
                Observaciones: data.Comentarios.trim(),
                GlosadorNombre: idUser,
                FundamentoLegal: data.FundamentoLegal || '',
            };

            // --- SEGUNDA LLAMADA: CREAR EL VOLANTE ---
            const responseCrear = await fetch(Global.URL_VolanteObservaciones + 'crearNuevoVolante', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(volanteData)
            });

            if (!responseCrear.ok) {
                const errorData = await responseCrear.json();
                // Si la creación del volante falla, informamos al usuario.
                // Aquí yace el riesgo de inconsistencia.
                throw new Error(`El trámite se actualizó, pero falló la creación del volante: ${errorData.message}`);
            }

            const resultCrear = await responseCrear.json();
            // console.log("Volante creado exitosamente:", resultCrear);
        }

        // --- 3. FINALIZAR CON ÉXITO ---
        // Si todo fue bien, mostramos el mensaje de la primera llamada y redirigimos.
        alert(resultUpdate.message);
        window.location.href = 'listadoTurnados.html';

    } catch (error) {
        // Un único bloque 'catch' maneja cualquier error de ambas llamadas a la API.
        console.error("Error en la operación completa:", error);
        alert(`Error: ${error.message}`);
        // No redirigimos si hay un error, para que el usuario no pierda su trabajo.
    }
}