@ECHO OFF

uvicorn restaurant.main:app --host 127.0.0.1 --port 8002 --reload --reload-dir restaurant