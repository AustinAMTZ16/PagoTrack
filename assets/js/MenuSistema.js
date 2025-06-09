// Cargar el menú del sistema
document.addEventListener("DOMContentLoaded", function() {
    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Si no hay sesión o no se pudo obtener el usuario, redirige al login
    if (!usuario) {
        window.location.href = 'index.html';
        return;
    }
    // Obtener el rol del usuario y su departamento
    const rolUsuario = usuario.RolUser;
    const departamentoUsuario = usuario.DepartamentoUser;
    // Mostrar u ocultar los elementos del menú según el rol y departamento
    gestionarMenu(rolUsuario, departamentoUsuario);
});
// Función para gestionar el menú del sistema
function gestionarMenu(rolUsuario, departamentoUsuario) {
    // Configuración del menú por departamento
    const departamentos = {
        'Tramite': '#Tramite',
        'Admin': '#Admin',
        'Ordenes': '#Ordenes',
        'Pagos': '#Pagos',
        'Suficiencias': '#Suficiencias',
        'KPI': '#KPI',
        'Oficios': '#Oficios',


        'Glosa': '#Glosa',
        'Presupuesto': '#Presupuesto',
        'OrdenesPago': '#OrdenesPago',
    };
    // Inicialmente ocultar todos los menús y submenús
    document.querySelectorAll('.nav-item').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('.dropdown-menu li').forEach(item => {
        item.style.display = 'none';
    });
    // Lógica para Admin/Admin: Mostrar todos los menús y submenús
    if (rolUsuario === 'Admin' && departamentoUsuario === 'Admin') {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'block';
        });
        document.querySelectorAll('.dropdown-menu li').forEach(item => {
            item.style.display = 'block';
        });
        return; // Terminar aquí, ya que Admin/Admin puede ver todo
    }
    // Mostrar el menú y submenús según el departamento del usuario
    if (departamentos[departamentoUsuario]) {
        const menuPadre = document.querySelector(departamentos[departamentoUsuario]);
        // Mostrar el menú principal del departamento
        if (menuPadre) menuPadre.style.display = 'block';
        // Mostrar opciones según el rol del usuario
        const selectorBase = `${departamentos[departamentoUsuario]} .dropdown-menu li`;
        if (rolUsuario === 'Analista' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#Analista`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'Operador' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#Operador`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'Pagos' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#Pagos`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'Suficiencias' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#Suficiencias`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'KPI' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#KPI`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'Oficios' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#Oficios`).forEach(item => {
                item.style.display = 'block';
            });
        }






        if (rolUsuario === 'OP_Tramite' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#OP_Tramite`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'OP_Remesa' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#OP_Remesa`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'OP_KPI' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#OP_KPI`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'OP_Seguimiento' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#OP_Seguimiento`).forEach(item => {
                item.style.display = 'block';
            });
        }
        if (rolUsuario === 'OP_OrdenesPago' || rolUsuario === 'Admin') {
            document.querySelectorAll(`${selectorBase}#OP_OrdenesPago`).forEach(item => {
                item.style.display = 'block';
            });
        }
    }
}