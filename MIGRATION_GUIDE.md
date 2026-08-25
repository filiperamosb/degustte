# 📚 Guia de Migração - GitHub Pages para VPS

## 📋 O Que Foi Preparado

Todos os arquivos necessários para migrar para uma VPS foram criados:

### **Arquivos de Configuração**
- ✅ `server.js` - Backend Node.js completo com API
- ✅ `package.json` - Dependências atualizadas
- ✅ `.env.example` - Template de variáveis de ambiente
- ✅ `database.sql` - Schema do PostgreSQL

### **Deployment & DevOps**
- ✅ `deploy.sh` - Script de deployment automático
- ✅ `Dockerfile` - Containerização com Docker
- ✅ `docker-compose.yml` - Orquestração completa
- ✅ `nginx.conf` - Configuração do servidor web

### **Documentação**
- ✅ `SETUP_VPS.md` - Guia passo-a-passo
- ✅ `MIGRATION_GUIDE.md` - Este arquivo

## 🚀 Fluxo de Migração Rápido

### **Opção 1: Deployment Manual (Sem Docker)**

```bash
# 1. Na VPS - Clonar repositório
ssh root@seu-ip-vps
cd /var/www
git clone https://github.com/filiperamosb/degustte.git
cd degustte

# 2. Seguir SETUP_VPS.md passo-a-passo
nano SETUP_VPS.md

# Executar cada passo manualmente
```

**Tempo estimado:** 30-45 minutos

### **Opção 2: Deployment com Docker (Recomendado)**

```bash
# 1. Na VPS - Instalar Docker
ssh root@seu-ip-vps
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose

# 2. Clonar repositório
git clone https://github.com/filiperamosb/degustte.git
cd degustte

# 3. Configurar .env
cp .env.example .env
nano .env  # Editar com suas informações

# 4. Iniciar serviços
docker-compose up -d

# 5. Verificar logs
docker-compose logs -f
```

**Tempo estimado:** 10-15 minutos

## 📊 Arquitetura Resultante

```
┌─────────────────────────────────────────────┐
│         Cliente (Browser)                    │
│  https://degustte.com.br                    │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
                   ↓
┌─────────────────────────────────────────────┐
│    Nginx (Reverse Proxy + Load Balancer)    │
│    - SSL/TLS (Let's Encrypt)                │
│    - Gzip Compression                       │
│    - Static Files Cache                     │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
┌───────────────┐      ┌──────────────┐
│  Node.js      │      │  Node.js     │
│  Express      │      │  Express     │
│  :3000        │      │  :3001       │
└───────┬───────┘      └──────┬───────┘
        │                     │
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │   PostgreSQL        │
        │   :5432             │
        │                     │
        │ - empresas          │
        │ - usuarios_admin    │
        │ - pagamentos        │
        │ - logs              │
        └─────────────────────┘
```

## 🔄 Dados Existentes - Como Migrar

### **Dados do Admin Painel (localStorage)**

Os dados atualmente estão em localStorage do navegador. Para migrar:

```bash
# 1. No seu PC local, abrir console do navegador (F12)
# 2. Execute:
console.log(JSON.stringify(JSON.parse(localStorage.getItem('empresas')), null, 2))

# 3. Copie a saída JSON
# 4. Na VPS, no arquivo database.sql, atualize:
# INSERT INTO empresas (...)
```

### **Dados de Pagamentos**

Se houver histórico de pagamentos em localStorage:

```javascript
// No console do navegador
const pagamentos = JSON.parse(localStorage.getItem('pagamentos') || '[]');
console.log(JSON.stringify(pagamentos, null, 2));
```

Depois insira no banco:
```sql
INSERT INTO pagamentos (empresa_id, asaas_id, valor, status) 
VALUES (...);
```

## 🧪 Testar Localmente Primeiro

**Antes de fazer deploy na VPS, teste localmente:**

```bash
# 1. Seu computador
npm install

# 2. Instalar PostgreSQL localmente
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: apt install postgresql

# 3. Criar database
createdb degustte

# 4. Importar schema
psql degustte < database.sql

# 5. Configurar .env
cp .env.example .env
# Editar com dados locais

# 6. Iniciar servidor
npm start

# 7. Testar
curl http://localhost:3000/api/health
```

## 🔐 Segurança Pré-Deployment

**Antes de fazer deploy em produção:**

- [ ] Trocar senha padrão do admin no `.env`
- [ ] Usar chave SSH para autenticação na VPS (não senha)
- [ ] Habilitar firewall
- [ ] Configurar SSL/TLS
- [ ] Fazer backup do banco de dados
- [ ] Testar restore de backup
- [ ] Configurar monitoramento (PM2+, New Relic, etc)
- [ ] Usar variáveis de ambiente sensíveis (não no git)

## 📊 Performance Esperada

Com a VPS de **R$ 39,90/mês**:

| Métrica | Valor |
|---------|-------|
| **Requisições/segundo** | 100-200 |
| **Usuários simultâneos** | 50-100 |
| **Tempo resposta API** | <100ms |
| **Uptime** | 99.5%+ |
| **Empresas suportadas** | 1.000+ |

## 🚨 Se Algo Dar Errado

### **Node.js não inicia**
```bash
pm2 logs degustte
# Ou com Docker:
docker-compose logs backend
```

### **Banco de dados não conecta**
```bash
sudo -u postgres psql -d degustte -c "SELECT version();"
```

### **Certificado SSL erro**
```bash
certbot renew --force-renewal
```

### **Nginx não inicia**
```bash
nginx -t
systemctl status nginx
```

## 📈 Próximos Passos Após Deploy

1. **Configurar monitoring:**
   - PM2 Plus (monitoramento de processos)
   - Sentry (erro tracking)
   - New Relic (APM)

2. **Backups automáticos:**
   - PostgreSQL: AWS S3, Backblaze, etc
   - Scripts cron para backup diário

3. **Analytics:**
   - Google Analytics (frontend)
   - Datadog ou Prometheus (backend)

4. **CI/CD Pipeline:**
   - GitHub Actions para testes
   - Deploy automático ao fazer push

5. **Escalabilidade:**
   - Load balancer quando precisar
   - Read replicas de banco de dados
   - Cache Redis

## ✅ Checklist de Deploy

```
Pré-Deploy:
- [ ] Testar localmente
- [ ] Todos os arquivos prontos
- [ ] .env configurado

Deploy:
- [ ] VPS criada
- [ ] Node.js instalado
- [ ] PostgreSQL instalado
- [ ] Repositório clonado
- [ ] .env copiado e editado
- [ ] Banco de dados importado
- [ ] Aplicação iniciada
- [ ] Nginx configurado
- [ ] SSL ativado
- [ ] DNS apontando

Pós-Deploy:
- [ ] Testar todas as funcionalidades
- [ ] Verificar logs
- [ ] Configurar backups
- [ ] Documentar configuração
- [ ] Comunicar ao time
```

## 📞 Precisa de Ajuda?

Se algo não funcionar:

1. Verificar logs:
   ```bash
   pm2 logs degustte
   # ou
   docker-compose logs -f
   ```

2. Checar status dos serviços:
   ```bash
   systemctl status postgres
   systemctl status nginx
   pm2 status
   ```

3. Testar conectividade:
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:5432  # PostgreSQL
   ```

---

**Agora você tem tudo pronto para fazer deploy! Boa sorte! 🚀**
