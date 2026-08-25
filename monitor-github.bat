@echo off
REM ====================================
REM Launcher para monitor-github.ps1
REM ====================================

cd /d %~dp0

REM Executar PowerShell com o script
powershell.exe -ExecutionPolicy Bypass -File "monitor-github.ps1"

REM Se o script terminar, aguardar 5 segundos e reiniciar
timeout /t 5
goto start

:start
powershell.exe -ExecutionPolicy Bypass -File "monitor-github.ps1"
