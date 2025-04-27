@ECHO OFF

uvicorn delivery.main:app --host 127.0.0.1 --port 8004 --reload
