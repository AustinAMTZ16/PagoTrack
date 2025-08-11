import os
import whisper

def transcribir_mp3_a_texto(ruta_audio, nombre_salida="transcripcion.txt"):
    """
    Toma la ruta de un archivo MP3, lo transcribe a texto usando Whisper
    y guarda el resultado en un archivo .txt.
    """
    # 1. Validar que el archivo de entrada exista
    if not os.path.exists(ruta_audio):
        print(f"[❌] Error: El archivo no se encontró en la ruta: {ruta_audio}")
        return

    try:
        # 2. Cargar el modelo y transcribir
        print("[+] Cargando modelo Whisper (base)...")
        # Para mayor precisión puedes cambiar 'base' por 'small', 'medium' o 'large'
        model = whisper.load_model("base") 
        
        print(f"[+] Transcribiendo el archivo: {ruta_audio}")
        resultado = model.transcribe(ruta_audio, language='es')
        texto_transcrito = resultado['text']
        print("[+] Transcripción completada.")

        # 3. Guardar el texto en un archivo
        with open(nombre_salida, "w", encoding="utf-8") as f:
            f.write(texto_transcrito)
        print(f"[✅] Transcripción guardada exitosamente en: {nombre_salida}")

    except Exception as e:
        print(f"[❌] Ocurrió un error durante el proceso: {e}")

if __name__ == "__main__":
    ruta_del_archivo_mp3 = input("📁 Ingresa la ruta de tu archivo .mp3: ").strip()
    
    # Llama a la función principal con la ruta proporcionada
    transcribir_mp3_a_texto(ruta_del_archivo_mp3)