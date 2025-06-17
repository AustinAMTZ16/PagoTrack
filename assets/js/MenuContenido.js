// assets/js/menu.js

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector("nav.navbar");
  if (!navbar) return;

  navbar.innerHTML = `
     <div class="container-fluid">
      <a class="navbar-brand text-white" href="#">Menú</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>


      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">

          <li id="Glosa" class="nav-item dropdown" style="display: none;">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">Trámites</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown"> 
              <li id="OP_Tramite" style="display: none;"><a class="dropdown-item" href="dashboard.html">Trámites</a></li>          
              <li id="OP_Tramite" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Listado de Turnados</a></li>
              <li id="OP_Tramite" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesa</a></li>

              <li id="OP_Remesa" style="display: none;"><a class="dropdown-item" href="dashboard.html">Trámites</a></li> 
              <li id="OP_Remesa" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesa</a></li>
              <li id="OP_Remesa" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Listado de Turnados</a></li>    
            </ul>
          </li>

          <li id="Presupuesto" class="nav-item dropdown" style="display: none;">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">Trámites</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown"> 
              <li id="OP_KPI" style="display: none;"><a class="dropdown-item" href="kpi.html">Indicadores Clave</a></li>          
              <li id="OP_KPI" style="display: none;"><a class="dropdown-item" href="dashboard.html">Trámites</a></li>          
              <li id="OP_KPI" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesas</a></li>
              <li id="OP_KPI" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelControl.html">Correspondencia</a></li>
              <li id="OP_KPI" style="display: none;"><a class="dropdown-item" href="ContestacionPanelControl.html">Respuestas</a></li>
              <li id="OP_Seguimiento" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesas</a></li>
              <li id="OP_Seguimiento" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Trámites</a></li>
              <hr>
              <li id="OP_KPI" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Tramites Turnados</a></li>
              <li id="OP_KPI" style="display: none;"><a class="dropdown-item" href="ContestacionPanelControl.html">Respuestas Turnadas</a></li>
            </ul>
          </li>

          <li id="OrdenesPago" class="nav-item dropdown" style="display: none;">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">Trámites</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown"> 
              <li id="OP_OrdenesPago" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Trámites</a></li>          
              <li id="OP_OrdenesPago" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesas</a></li>
            </ul>
          </li>























          <li id="Tramite" class="nav-item dropdown" style="display: none;">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">Trámite</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li id="Operador" style="display: none;"><a class="dropdown-item" href="dashboard.html">Inicio</a></li>
              <li id="Operador" style="display: none;"><a class="dropdown-item" href="createTramite.html">Crear Trámite</a></li>
              <li id="Operador" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesas</a></li>
              <li id="Operador" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Listado de Turnados</a></li>
              <li id="Analista" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Listado de Turnados</a></li>
            </ul>
          </li>
          <li id="KPI" class="nav-item dropdown" style="display: none;">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">Indicadores de Rendimiento</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li id="KPI" style="display: none;"><a class="dropdown-item" href="kpi.html">KPI</a></li>
              <li id="KPI" style="display: none;"><a class="dropdown-item" href="dashboard.html">Trámites</a></li>
              <li id="KPI" style="display: none;"><a class="dropdown-item" href="listadoTurnados.html">Turnado</a></li>
              <li id="KPI" style="display: none;"><a class="dropdown-item" href="seguimientoRemesas.html">Remesas</a></li>
              <li id="KPI" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelControl.html">Correspondencia</a></li>
              <li id="KPI" style="display: none;"><a class="dropdown-item" href="ContestacionPanelControl.html">Respuestas</a></li>
            </ul>
          </li>
          <li id="Oficios" class="nav-item dropdown" style="display: none;">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">Correspondencia y Oficios</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li id="Oficios" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelControl.html">Correspondencia</a></li>
              <li id="Oficios" style="display: none;"><a class="dropdown-item" href="ContestacionPanelControl.html">Respuestas</a></li>
              <li id="Oficios" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelAnalista.html">Panel Analista</a></li>
            </ul>
          </li>

          <li id="Suficiencias" class="nav-item dropdown" style="display: none;">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">Correspondencia y Oficios</a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">              
              <li id="Suficiencias" style="display: none;"><a class="dropdown-item" href="CorrespondenciaPanelAnalista.html">Correspondencia</a></li>
              <li id="Suficiencias" style="display: none;"><a class="dropdown-item" href="CorrespondenciaCrear.html">Crear Correspondencia</a></li>
            </ul>
          </li>


          <li><a class="nav-link" href="obtenerReportePrioridadTramites.html">Prioridad</a></li>
          <li><a class="nav-link" href="manual.html">Manual</a></li>
          <li><a class="nav-link" href="help.html">Estados</a></li>
          <li><a class="nav-link" href="#" onclick='cerrarSesion(); window.location.href = "index.html";'>Cerrar Sesión</a></li>
        </ul>
      </div>
    </div>
    `;
});
