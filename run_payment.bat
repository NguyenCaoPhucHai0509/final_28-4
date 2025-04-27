@ECHO OFF

uvicorn payment.main:app --host 127.0.0.1 --port 8005 --reload --reload-dir ./payment 
