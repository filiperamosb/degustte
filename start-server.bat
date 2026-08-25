@echo off
:loop
node server.js
echo Servidor encerrou, reiniciando...
timeout /t 2
goto loop
