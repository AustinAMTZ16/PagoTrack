CREATE TABLE Oficios (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Folio VARCHAR(50) NOT NULL UNIQUE,
    FechaRecepcion DATE NOT NULL,
    Solicitante VARCHAR(150) NOT NULL,
    Dependencia VARCHAR(100) NOT NULL,
    Departamento VARCHAR(150),
    NumeroOficio VARCHAR(100) NOT NULL UNIQUE,
    tipoOficio ENUM(
        'Suficiencia Presupuestal',
        'Suficiencia Compromiso Gasto',
        'Suficiencia Anticipada',
        'Modificaciones Suficiencia Presupuestal',
        'Suficiencia Ampliación'
    ) NOT NULL,
    Asunto VARCHAR(100),
    Concepto TEXT,
    Monto DECIMAL(12,2),
    FechaVencimiento DATE DEFAULT NULL,
    Turnado VARCHAR(100),
    RespuestaConocimiento VARCHAR(150),
    FechaRetroactiva DATE DEFAULT NULL,
    Estado ENUM(
        'CREADO',
        'TURNADO',
        'OBSERVACIONES',
        'DEVUELTO',
        'APROBADO',
        'RECHAZADO',
        'CANCELADO',
        'PAGADO'
    ) NOT NULL,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UsuarioRegistro VARCHAR(100),
    Comentarios TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
