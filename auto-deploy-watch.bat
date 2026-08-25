@echo off
setlocal enabledelayedexpansion

REM ====================================
REM Auto-Deploy Watch - DeGustte
REM Fica rodando 24/7 e detecta mudanças automaticamente
REM ====================================

cd /d "C:\degustte"

echo.
echo ========================================
echo 🔄 AUTO-DEPLOY WATCH INICIADO
echo ========================================
echo Diretório: %cd%
echo.

:loop

REM Sincroniza com GitHub primeiro
git pull origin main >nul 2>&1

REM Verifica se há mudanças
for /f %%A in ('git status --porcelain 2^>nul ^| find /c /v ""') do set count=%%A

if %count% gtr 0 (
    echo.
    echo [%date% %time%] 📝 Mudanças detectadas! (%count% arquivos)
    echo.

    git add .
    git commit -m "Auto-deploy - %date% %time%"

    if errorlevel 0 (
        echo 📤 Enviando para GitHub...
        git pull origin main
        git push origin main
        echo ✅ Sincronizado com GitHub!
    ) else (
        echo ❌ Erro ao fazer commit
    )
) else (
    echo [%date% %time%] ⏸️  Aguardando mudanças...
)

REM Aguarda 30 segundos antes de verificar novamente
timeout /t 30 /nobreak

goto loop