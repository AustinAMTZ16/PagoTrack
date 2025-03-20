document.getElementById('btnGenerarComentario').addEventListener('click', function() {
    let prompt = document.getElementById('inputTexto').value;

    fetch('../api/gpt_request.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ 'prompt': prompt })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Respuesta de la API:", data); // Imprime la respuesta en consola para depuración

        if (data.error) {
            document.getElementById('resultado').innerText = "Error: " + data.error;
        } else if (data.choices && data.choices.length > 0) {
            document.getElementById('resultado').innerText = data.choices[0].message.content;
        } else {
            document.getElementById('resultado').innerText = "Error: Respuesta inesperada de OpenAI.";
        }
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
        document.getElementById('resultado').innerText = "Error en la solicitud al servidor.";
    });
});
