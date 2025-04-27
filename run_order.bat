@ECHO OFF

uvicorn order.main:app --host 127.0.0.1 --port 8003 --reload --reload-dir order