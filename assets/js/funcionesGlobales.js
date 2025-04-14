// funcionesGlobales.js

const Global = {
    /**
     * Exportar tabla HTML a Excel
     * @param {string} tableId - ID de la tabla en el DOM
     * @param {string} nombreArchivo - Nombre del archivo Excel resultante
     */
    exportToExcel: function (tableId, nombreArchivo = "Reporte") {
        const table = document.querySelector(`#${tableId}`);
        if (table) {
            const wb = XLSX.utils.table_to_book(table, { sheet: "Resumen" });
            XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
        } else {
            console.error("La tabla no existe:", tableId);
        }
    },

    /**
     * Filtra una lista de trámites con múltiples criterios.
     * @param {Array} base - Lista de trámites
     * @param {Object} filtros - Objeto de filtros clave-valor
     * @param {Array} camposExactos - Lista de campos que deben coincidir exactamente
     * @returns {Array} Lista filtrada
     */
    filtrarTramites: function (base, filtros, camposExactos = []) {
        return base.filter(tramite => {
            for (let campo in filtros) {
                const valorFiltro = filtros[campo];
                if (valorFiltro === '' || valorFiltro === 'Todos') continue;

                const valorTramite = tramite[campo];

                if (campo === 'importe') {
                    if (parseFloat(valorTramite) !== parseFloat(valorFiltro)) return false;

                } else if (campo === 'fechaRecepcion' || campo === 'fechaVencimiento') {
                    const fechaBase = valorTramite ? valorTramite.split(' ')[0] : '';
                    if (fechaBase !== valorFiltro) return false;

                } else if (typeof valorTramite === 'string') {
                    const filtroNormalizado = valorFiltro.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
                    const valorNormalizado = valorTramite.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

                    if (camposExactos.includes(campo)) {
                        if (valorNormalizado !== filtroNormalizado) return false;
                    } else {
                        if (!valorNormalizado.includes(filtroNormalizado)) return false;
                    }

                } else {
                    if (valorTramite != valorFiltro) return false;
                }
            }
            return true;
        });
    },



    holaMundo: function () {
        return "Hola mundo desde funcionesGlobales.js";
    }
};

export default Global;
