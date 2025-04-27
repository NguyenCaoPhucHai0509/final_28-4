@ECHO OFF

uvicorn auth.main:app --host 127.0.0.1 --port 8001 --reload --reload-dir auth