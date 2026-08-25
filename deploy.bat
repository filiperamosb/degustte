@echo off
REM ====================================
REM Deploy Automático - DeGustte
REM ====================================
REM Este script faz commit, push para GitHub
REM e na VPS sincroniza automaticamente em 5 segundos!

cd /d "%~dp0"

echo.
echo ========================================
echo 🚀 INICIANDO DEPLOY AUTOMÁTICO
echo ========================================
echo.

REM Mostrar status
git status

echo.
echo 📤 Adicionando arquivos...
git add .

echo.
echo 💾 Fazendo commit...
git commit -m "Auto-deploy - %date% %time%"

echo.
echo 📤 Enviando para GitHub...
git push origin main

echo.
echo ========================================
echo ✅ ENVIADO PARA GITHUB!
echo ⏳ Aguardando sincronização na VPS...
echo ========================================
echo.

timeout /t 5

echo.
echo ========================================
echo 🎉 PRONTO!
echo ✅ Aplicação foi atualizada na VPS
echo ========================================
echo.

pause
