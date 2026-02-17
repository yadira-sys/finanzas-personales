     1	# Usar imagen oficial de Python
     2	FROM python:3.10-slim
     3	
     4	# Establecer directorio de trabajo
     5	WORKDIR /app
     6	
     7	# CACHE BUSTER - Cambiar este número para forzar rebuild: 20251110-1800
     8	# Esto invalida la caché de Docker y fuerza reinstalación de dependencias
     9	ARG CACHEBUST=20251110-1800
    10	
    11	# Copiar primero solo requirements para aprovechar caché de Docker
    12	COPY webhook-server/requirements.txt /app/webhook-server/
    13	
    14	# Instalar dependencias (se ejecutará de nuevo por el CACHEBUST)
    15	RUN pip install --no-cache-dir -r webhook-server/requirements.txt
    16	
    17	# Copiar TODOS los archivos del proyecto (HTML, CSS, JS, webhook-server)
    18	COPY . /app/
    19	
    20	# Exponer puerto
    21	EXPOSE 8080
    22	
    23	# Comando de inicio
    24	CMD ["python", "/app/webhook-server/server.py"]
    25	
