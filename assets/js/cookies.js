const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js";

let visitorIdGlobal = ""; // Para atajo de teclado
let btnAcceso;

script.onload = () => {
    FingerprintJS.load().then(fp => {
        fp.get().then(result => {
            visitorIdGlobal = result.visitorId;
            const claveMaestra = "290910";

            console.log("🆔 Visitor ID:", visitorIdGlobal);
            console.log("📦 Fingerprint completo:", result);
            console.log("🌐 User Agent:", navigator.userAgent);
            console.log("📍 Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
            console.log("🖥 Resolución:", `${screen.width}x${screen.height}`);
            console.log("🌍 Idioma:", navigator.language);

            const whitelist = [
                "0a317255c61c52f15fd6c5ec5c9b21ac",
                "1ddc7191214cf7dffcc5be5c5335e7c7",
                "ab23630e8cc464df090e48126fb2eb0a",
                "cbcacfd248ffa338567c8b7e72567472"
            ];

            const p = document.getElementById("fingerprint-info");
            if (p) {
                p.innerText = `🆔: ${visitorIdGlobal}`;
                p.style.color = "white";
                p.style.fontWeight = "bold";
            }

            // btnAcceso = document.getElementById("acceso");
            // const overrideBtn = document.getElementById("adminOverride");

            // const isNotAuthorized = !whitelist.includes(visitorIdGlobal);
            // const isLaptopOrPC = esLaptop(); // ✅ Si es laptop o PC, se espera Ctrl+Alt+A

            // if (isNotAuthorized) {
            //     console.warn("🚫 Dispositivo no autorizado. Botón deshabilitado.");
            //     if (btnAcceso) {
            //         btnAcceso.disabled = true;
            //         btnAcceso.innerText = "Acceso restringido";
            //         btnAcceso.style.backgroundColor = "#ccc";
            //         btnAcceso.style.cursor = "not-allowed";
            //         btnAcceso.title = "Este dispositivo no está autorizado para acceder";
            //     }

            //     // Mostrar override automáticamente si NO es laptop o PC
            //     if (overrideBtn && !isLaptopOrPC) {
            //         overrideBtn.style.display = "inline-block";
            //         console.log("📱 Dispositivo móvil o tablet. Mostrando botón override automáticamente.");
            //     }

            //     // Evento de validación de clave
            //     if (overrideBtn) {
            //         overrideBtn.addEventListener("click", () => {
            //             const clave = prompt("Introduce la clave de acceso:");
            //             if (clave === claveMaestra) {
            //                 if (btnAcceso) {
            //                     btnAcceso.disabled = false;
            //                     btnAcceso.innerText = "Acceder";
            //                     btnAcceso.style.backgroundColor = "#7D2447";
            //                     btnAcceso.style.cursor = "pointer";
            //                     btnAcceso.title = "Acceso otorgado vía clave de emergencia";
            //                 }
            //                 overrideBtn.style.display = "none";
            //                 alert("✅ Acceso habilitado como administrador.");
            //             } else {
            //                 alert("❌ Clave incorrecta.");
            //             }
            //         });
            //     }
            // } else {
            //     console.log("✅ Dispositivo autorizado");
            // }
        });
    });
};

// Tecla secreta Ctrl+Alt+A para mostrar botón override manualmente
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key === "a") {
        const overrideBtn = document.getElementById("adminOverride");
        if (overrideBtn && visitorIdGlobal) {
            overrideBtn.style.display = "inline-block";
        }
    }
});

document.head.appendChild(script);

// 🔍 Identifica si es laptop o PC (para **NO** mostrar override automáticamente)
function esLaptop() {
    const { userAgent } = navigator;
    const width = screen.width;
    const height = screen.height;
    const mem = navigator.deviceMemory || 4;

    const resolucionesLaptop = [
        [1366, 768],
        [1440, 900],
        [1536, 864],
        [1600, 900],
        [1920, 1080],
        [1280, 800]
    ];

    const esWindows = userAgent.includes("Windows NT 10");
    const esMac = userAgent.includes("Macintosh");
    const esLaptopPorResolucion = resolucionesLaptop.some(([w, h]) => width === w && height === h);
    const esLaptopPorMemoria = mem >= 4;

    return (esWindows || esMac) && esLaptopPorResolucion && esLaptopPorMemoria;
}
