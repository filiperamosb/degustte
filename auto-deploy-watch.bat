@echo off
setlocal enabledelayedexpansion

REM ====================================
REM Auto-Deploy Watch - DeGustte
REM Sincroniza a cada 5 segundos
REM ====================================

cd /d "C:\degustte"

cls
echo.
echo ========================================
echo 🔄 AUTO-DEPLOY INICIADO
echo ========================================
echo Diretório: %cd%
echo Intervalo: 5 segundos
echo ========================================
echo.

:loop

REM Sincroniza com GitHub
git pull origin main >nul 2>&1

REM Verifica se há mudanças
for /f %%A in ('git status --porcelain 2^>nul ^| find /c /v ""') do set count=%%A

if %count% gtr 0 (
    REM Há mudanças - limpa a tela para ficar limpo
    cls
    echo.
    echo ========================================
    echo 📝 MUDANÇAS DETECTADAS - %time%
    echo ========================================
    echo Arquivos: %count%
    echo.

    git add .
    git commit -m "Auto-deploy - %date% %time%"

    if errorlevel 0 (
        REM Captura o hash do commit
        for /f %%A in ('git rev-parse --short HEAD') do set hash=%%A

        echo ✅ COMMIT: %hash%
        echo.
        echo 📤 Sincronizando...

        git pull origin main >nul 2>&1
        git push origin main >nul 2>&1

        echo ✅ SUCESSO!
        echo.
        echo Aguardando próximas mudanças...
        echo.
    ) else (
        echo ❌ Erro ao fazer commit
        echo.
    )
) else (
    REM Sem mudanças
    echo [%time%] ⏸️  Aguardando...
)

REM Aguarda 5 segundos
timeout /t 5 /nobreak

goto loop
