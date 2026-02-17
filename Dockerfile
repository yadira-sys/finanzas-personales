FROM python:3.10-slim

WORKDIR /app

ARG CACHEBUST=20251110-1800

COPY webhook-server/requirements.txt /app/webhook-server/

RUN pip install --no-cache-dir -r webhook-server/requirements.txt

COPY . /app/

EXPOSE 8080

CMD ["python", "/app/webhook-server/server.py"]
