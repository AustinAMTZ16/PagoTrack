CREATE TABLE RegistroOficios (
    ID_RegistroOficios INT AUTO_INCREMENT PRIMARY KEY, -- ID DEL OFICIO
    TipoOficio ENUM(
        'Oficios',
        'Memos',
        'Circulares',
        'Recalendarizaciones',
        'Transferencias',
        'Usos de partida',
        'Oficios DGE',
        'Memos DGE',
        'Circulares DGE',
        'Ampliaciones',
        'Disposiciones',
        'Disposiciones y Reasignaciones',
        'Reducciones',
        'Resignación',
        'Lic Romay',
        'Transparencia',
        'Multi Anuales',
        'Apertura de fondo fijo',
        'Disposicion',
        'Disposicion y Reasignacion',
        'Ampliación Liquida',
        'Ampliación Presupuestal'
    ) NOT NULL, -- TIPO DE OFICIO
    NumeroOficio VARCHAR(100) NOT NULL, -- NUMERO DE OFICIO
    FechaRetroactivo DATE NOT NULL, -- FECHA RETROACTIVA DEL OFICIO
    DirigidoA VARCHAR(255) NOT NULL, -- A QUIEN ESTA DIRIGIDO EL OFICIO
    Asunto TEXT NOT NULL, -- ASUNTO DEL OFICIO
    Solicita TEXT, -- SOLICITA EL OFICIO
    FolioInterno VARCHAR(100), -- NUMERO INTERNO DEL OFICIO
    Estado ENUM(
        'Registrado',
        'Turnado',
        'Acuse de recibo',
        'Archivado',
        'Rechazado',
        'Cancelado'
    ) NOT NULL, -- ESTADO DEL OFICIO

    FechaEntregaDGAnalista DATE, -- FECHA CUANDO LA DG ENTREGA A MARU
    Concepto TEXT, -- DESCRIPCION DEL PAGO 
    Monto DECIMAL(15, 2), -- MONTO DEL OFICIO
    FechaRecepcionDependencia DATE, -- FECHA DEL SELLO DEL ACUSE
    FechaEntregaAnalistaOperador DATE, -- FECHA DE ENTREGA DEL EXPEDIENTE 

    Comentario TEXT, -- COMENTARIO DEL OFICIO
    ArchivoAdjunto VARCHAR(255), -- ARCHIVO ADJUNTO
    UsuarioRegistro VARCHAR(100), -- USUARIO QUE REGISTRO EL OFICIO
    FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP -- FECHA DE REGISTRO DEL OFICIO
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;