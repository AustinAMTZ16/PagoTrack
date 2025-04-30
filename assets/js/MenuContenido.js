// assets/js/menu.js

document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector("nav.navbar");
    if (!navbar) return;

    navbar.innerHTML = `
    <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li id="Operador" style="display: none;" class="nav-item">
                    <a class='nav-link' href="dashboard.html">Inicio</a>
                </li>
                <li id="Tramite" class="nav-item dropdown" style="display: none;">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">Trámite</a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li id="Operador" style="display: none;"><a class="dropdown-item" href="dashboard.html">Inicio</a></li>
                        <li id="Operador" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Listado de Turnados</a></li>
                        <li id="Operador" style="display: none;"><a class="dropdown-item" href="createTramite.html">Crear Trámite</a></li>
                        <li id="Analista" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Listado de Turnados</a></li>
                        <li id="Operador" style="display: none;"><a class="dropdown-item" href="seguimientoOrdenesPago.html">Ordenes de Pago</a></li>
                        <li id="Operador" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesas</a></li>
                    </ul>
                </li>
                <li id="Pagos" class="nav-item dropdown" style="display: none;">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">Ordenes de Pago</a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li id="Pagos" style="display: none;"><a class="dropdown-item" href="seguimientoOrdenesPago.html">Ordenes de Pago</a></li>
                    </ul>
                </li>
                <li id="KPI" class="nav-item dropdown" style="display: none;">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">Indicadores de Rendimiento</a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li id="KPI" style="display: none;"><a class="dropdown-item" href="kpi.html">KPI</a></li>
                        <li id="KPI" style="display: none;"><a class="dropdown-item" href="dashboard.html">Trámites</a></li>
                        <li id="KPI" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Turnado</a></li>
                        <li id="KPI" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesas</a></li>
                        <li id="na" style="display: none;"><a class="dropdown-item" href="seguimientoOrdenesPago.html">Ordenes de Pago</a></li>
                        <li id="na" style="display: none;"><a class="dropdown-item" href="reportesquery.html">Reportes Query</a></li>
                        <li id="na" style="display: none;"><a class="dropdown-item" href="exploradorArchivos.html">Explorador de Archivos</a></li>
                        <li id="KPI" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelControl.html">Correspondencia Panel</a></li>
                        <li id="KPI" style="display: none;"><a class="dropdown-item" href="ContestacionPanelControl.html">Contestaciones Panel</a></li>
                    </ul>
                </li>
                <li id="Oficios" class="nav-item dropdown" style="display: none;">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">Correspondencia y Oficios</a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li id="Oficios" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelControl.html">Correspondencia</a></li>
                        <li id="Oficios" style="display: none;"><a class="dropdown-item" href="ContestacionPanelControl.html">Contestaciones</a></li>
                        <li id="Oficios" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelAnalista.html">Panel Analista</a></li>
                    </ul>
                </li>
                <li><a class="nav-link" href="manual.html">Manual</a></li>
                <li><a class="nav-link" href="help.html">Estados</a></li>
                <li><a class="nav-link" href="#" onclick='cerrarSesion(); window.location.href = "index.html";'>Cerrar Sesión</a></li>
            </ul>
        </div>
    </div>`;
});
