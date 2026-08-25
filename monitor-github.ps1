# ====================================
# Monitor GitHub e Sync na VPS
# ====================================
# Este script roda na VPS e:
# 1. Verifica GitHub a cada 5 segundos
# 2. Se houver novo commit, faz pull
# 3. Reinicia aplicação
# 4. Faz commit de confirmação localmente

$APP_DIR = "C:\degustte"
$LAST_COMMIT = $null

Write-Host "🚀 Iniciando monitor de GitHub..." -ForegroundColor Green
Write-Host "📁 Diretório: $APP_DIR" -ForegroundColor Cyan
Write-Host "⏰ Checando a cada 5 segundos..." -ForegroundColor Cyan
Write-Host ""

while ($true) {
    try {
        cd $APP_DIR

        # Fetch do remoto sem fazer merge
        git fetch origin main 2>&1 | Out-Null

        # Pegar hash do último commit local e remoto
        $LOCAL_COMMIT = git rev-parse HEAD
        $REMOTE_COMMIT = git rev-parse origin/main

        # Se commits são diferentes, há atualização
        if ($LOCAL_COMMIT -ne $REMOTE_COMMIT) {
            if ($LAST_COMMIT -ne $REMOTE_COMMIT) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🔔 Novo commit detectado no GitHub!" -ForegroundColor Yellow
                Write-Host "  Local:  $($LOCAL_COMMIT.Substring(0, 7))" -ForegroundColor Gray
                Write-Host "  Remoto: $($REMOTE_COMMIT.Substring(0, 7))" -ForegroundColor Gray

                # Fazer pull
                Write-Host "  📥 Fazendo pull..." -ForegroundColor Cyan
                git pull origin main 2>&1 | Out-Null

                # Reinstalar dependências se package.json mudou
                Write-Host "  📦 Atualizando dependências..." -ForegroundColor Cyan
                npm install 2>&1 | Out-Null

                # Reiniciar aplicação
                Write-Host "  🔄 Reiniciando aplicação..." -ForegroundColor Cyan
                pm2 restart degustte 2>&1 | Out-Null

                # Fazer commit de sincronização
                git add . 2>&1 | Out-Null
                git commit -m "Auto-sync from GitHub - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>&1 | Out-Null

                # Opcional: fazer push de volta pro GitHub (se quiser)
                # git push origin main 2>&1 | Out-Null

                Write-Host "  ✅ Sincronização concluída!" -ForegroundColor Green
                Write-Host ""

                $LAST_COMMIT = $REMOTE_COMMIT
            }
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Aplicação atualizada" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ Erro: $_" -ForegroundColor Red
    }

    # Aguardar 5 segundos
    Start-Sleep -Seconds 5
}
