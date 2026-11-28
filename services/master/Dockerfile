FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
ENV PYTHONUNBUFFERED=1
ENV CLIPPER_DB_PATH=/data/clipper.sqlite3
ENV CLIPPER_ARTIFACT_DIR=/data/artifacts
RUN mkdir -p /data/artifacts
VOLUME ["/data"]
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
