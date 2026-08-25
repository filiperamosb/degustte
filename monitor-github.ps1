# Monitor GitHub e Sync na VPS
# Este script roda na VPS e verifica GitHub a cada 5 segundos

$APP_DIR = "C:\degustte"
$LAST_COMMIT = $null

Write-Host "Iniciando monitor de GitHub..." -ForegroundColor Green
Write-Host "Diretorio: $APP_DIR" -ForegroundColor Cyan
Write-Host "Checando a cada 5 segundos..." -ForegroundColor Cyan
Write-Host ""

while ($true) {
    try {
        cd $APP_DIR

        git fetch origin main 2>&1 | Out-Null

        $LOCAL_COMMIT = git rev-parse HEAD
        $REMOTE_COMMIT = git rev-parse origin/main

        if ($LOCAL_COMMIT -ne $REMOTE_COMMIT) {
            if ($LAST_COMMIT -ne $REMOTE_COMMIT) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Novo commit detectado!" -ForegroundColor Yellow
                Write-Host "  Local:  $($LOCAL_COMMIT.Substring(0, 7))" -ForegroundColor Gray
                Write-Host "  Remoto: $($REMOTE_COMMIT.Substring(0, 7))" -ForegroundColor Gray

                Write-Host "  Fazendo pull..." -ForegroundColor Cyan
                git pull origin main 2>&1 | Out-Null

                Write-Host "  Atualizando dependencias..." -ForegroundColor Cyan
                npm install 2>&1 | Out-Null

                Write-Host "  Reiniciando aplicacao..." -ForegroundColor Cyan
                pm2 restart degustte 2>&1 | Out-Null

                Write-Host "  Sincronizacao concluida!" -ForegroundColor Green
                Write-Host ""

                $LAST_COMMIT = $REMOTE_COMMIT
            }
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Aplicacao atualizada" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Erro: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds 5
}
