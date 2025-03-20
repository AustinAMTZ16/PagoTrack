<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto llenado GPT</title>
    <script src="script.js" defer></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        textarea { width: 100%; height: 100px; }
        button { padding: 10px; background-color: blue; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h2>Generar Comentarios con ChatGPT</h2>
    <textarea id="inputTexto" placeholder="Escribe el contexto..."></textarea>
    <button id="btnGenerarComentario">Generar Comentario</button>
    <p>Respuesta GPT:</p>
    <div id="resultado" style="border: 1px solid #ddd; padding: 10px; margin-top: 10px;"></div>
</body>
</html>
