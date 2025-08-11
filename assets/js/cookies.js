const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js";

let visitorIdGlobal = ""; // Para atajo de teclado
let btnAcceso;

script.onload = () => {
    FingerprintJS.load().then(fp => {
        fp.get().then(result => {
            visitorIdGlobal = result.visitorId;
            const claveMaestra = "290910";

            // console.log("🆔 Visitor ID:", visitorIdGlobal);
            // console.log("📦 Fingerprint completo:", result);
            // console.log("🌐 User Agent:", navigator.userAgent);
            // console.log("📍 Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
            // console.log("🖥 Resolución:", `${screen.width}x${screen.height}`);
            // console.log("🌍 Idioma:", navigator.language);

            const whitelist = [
                "5a5bc0414c03faf85a985bffff9fb237",    // Agustín
                "0a317255c61c52f15fd6c5ec5c9b21ac",    // Agustin
                "739d7b903cbe6567d09e11b91910e95b",    // Agustin LOCAL
                "cf437df9f438d0474c3f7203cd3022d0",    // Blanca
                "f4b46335ae10a3e59ed2f48ef2965efd",    // Daniel
                "2b7ca5ab2a507e654abce73169c46f5e",    // Ofelia
                "de9f20b576911488068681867c28fd93",    // Carmen
                "c55fdea7eb76814cbbccc6158820cc88",    // Nahim
                "b5bd0d8e90e5908da4a26500e581cfb8",    // Valeria
                "41e1175e02794f9975e96f28e05a1551",    // Paco
                "674a8c1cea7e857bbbb7f3a183092abd",    // Isabel
                "7bfc7246e4104b55f162adf6e2101dd8",    // Ari
                "2fce800d34c4917e1fc1715008d0de3c",    // Alan
                "305295528e8e023087ddad2c96ae059d",    // Molina
                "9cfb4fad0890c561aea8b11a5f517123",    // Gutierrez
                "4fef2ff09ec9cb1f2010e1c49ba6ecb3",    // Juan Carlos
                "5ef81ea4d0093fe57bfd4a016ca9a10d",    // Elisa
                "b7e7f5da5a740930b63e3fe311b3d072",    // Cesar
                "4f5834fb7346ec692910d32d0ed3e12c",    // Carlos
                "4c3b976712a05284576ff81fac3f7e8d",    // Diego
                "6c5fe32c534712a096c1b3069e6f57d6",    // Ricardo
                "ebfd722f72b4296a52119bfba474bd24",    // Roberta
                "7cf389debc829f7b1caf12a260e72869",    // Emilio
                "d326ede516745f2a78d27f39015b534d",    // Gonzalo
                "623c1c2fef4df2010bd95c162f20e5bb",    // Concepcion
                "bcda8c98d04f63e76ba25036a836d337",    // Leo
                "7a2d8df04379c76296f0d1b26e6870ff",    // Laura A
                "4f2f91dd44a059dbcaf4399167f09830",    // Antonio
                "61700bde95227827876dc30ba8d5751a",    // Eugenia
                "9e358d1df8f0dbb55b7092009aafcf44"     // Gloria

            ];

            const p = document.getElementById("fingerprint-info");
            if (p) {
                p.innerText = `🆔: ${visitorIdGlobal}`;
                p.style.color = "white";
                p.style.fontWeight = "bold";
            }

            btnAcceso = document.getElementById("acceso");
            const overrideBtn = document.getElementById("adminOverride");

            const isNotAuthorized = !whitelist.includes(visitorIdGlobal);
            const isLaptopOrPC = esLaptop(); // ✅ Si es laptop o PC, se espera Ctrl+Alt+A

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
