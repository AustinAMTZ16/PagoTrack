import openai

# Cargar clave de API (reemplázala con tu clave real)
openai.api_key = "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"

# Ruta del archivo de audio
audio_path = "resumensemanauno.mp3"

# Enviar el audio a la API de OpenAI
with open(audio_path, "rb") as audio_file:
    response = openai.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )

# Imprimir transcripción
print(response.text)
