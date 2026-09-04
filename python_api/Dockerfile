FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY python_api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY python_api/app ./app
COPY python_api/tests ./tests
COPY python_api/pytest.ini ./
COPY frontend ./frontend

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]