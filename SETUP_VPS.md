# 🚀 Guia de Setup - DeGustte na VPS

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ (Recomendado: DigitalOcean, Linode, etc)
- Domínio registrado (degustte.com.br)
- Acesso SSH à VPS

## 🔧 Passo 1: Conectar à VPS

```bash
ssh root@seu-ip-vps
```

## 🔄 Passo 2: Atualizar Sistema

```bash
apt update && apt upgrade -y
apt install -y build-essential curl wget git
```

## 📦 Passo 3: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
node --version  # Verificar instalação
npm --version
```

## 🐘 Passo 4: Instalar PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
sudo -u postgres createdb degustte
sudo -u postgres psql
```

**Inside PostgreSQL:**
```sql
CREATE USER degustte WITH PASSWORD 'sua_senha_forte';
ALTER ROLE degustte SET client_encoding TO 'utf8';
ALTER ROLE degustte SET default_transaction_isolation TO 'read committed';
ALTER ROLE degustte SET default_transaction_deferrable TO on;
ALTER ROLE degustte SET default_transaction_deferrable TO off;
ALTER ROLE degustte CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE degustte TO degustte;
\q
```

## 🔌 Passo 5: Clonar Repositório

```bash
cd /var/www
git clone https://github.com/filiperamosb/degustte.git
cd degustte
npm install
```

## 🔐 Passo 6: Configurar .env

```bash
cp .env.example .env
nano .env
```

**Editar com suas informações:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=degustte
DB_USER=degustte
DB_PASSWORD=sua_senha_forte

PORT=3000
NODE_ENV=production

PUBLIC_URL=https://degustte.com.br
ASAAS_API_KEY=sua_chave_asaas
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

## 💾 Passo 7: Importar Schema do Banco de Dados

```bash
sudo -u postgres psql degustte < database.sql
```

## 🚀 Passo 8: Instalar PM2 (Gerenciador de Processos)

```bash
npm install -g pm2
pm2 start server.js --name "degustte" --env production
pm2 startup
pm2 save
pm2 status  # Verificar status
```

## 🌐 Passo 9: Instalar Nginx

```bash
apt install -y nginx
cp nginx.conf /etc/nginx/sites-available/degustte
ln -s /etc/nginx/sites-available/degustte /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
```

**Testar configuração:**
```bash
nginx -t
systemctl restart nginx
```

## 🔒 Passo 10: Configurar SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx

certbot certonly --nginx -d degustte.com.br -d www.degustte.com.br

# Ou manualmente:
certbot certonly --standalone -d degustte.com.br -d www.degustte.com.br
```

**Configurar renovação automática:**
```bash
certbot renew --dry-run
systemctl enable certbot.timer
systemctl start certbot.timer
```

## 🌍 Passo 11: Configurar DNS

**No seu registrador (namecheap, godaddy, etc):**

```
Tipo: A
Nome: @
Valor: SEU-IP-VPS

Tipo: A
Nome: www
Valor: SEU-IP-VPS
```

**Ou para CNAME:**
```
Tipo: CNAME
Nome: www
Valor: degustte.com.br
```

## ✅ Passo 12: Verificar Funcionamento

```bash
# Verificar Node.js
pm2 logs degustte

# Verificar Nginx
systemctl status nginx

# Testar API
curl http://localhost:3000/api/health

# Acessar site
# https://degustte.com.br
# https://degustte.com.br/admin/login.html
```

## 🛡️ Passo 13: Configurar Firewall

```bash
ufw enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw status
```

## 📊 Passo 14: Monitoramento

```bash
# Ver logs em tempo real
pm2 logs degustte

# Reiniciar aplicação
pm2 restart degustte

# Parar aplicação
pm2 stop degustte

# Deletar PM2
pm2 delete degustte
```

## 🔄 Passo 15: Fazer Deploy de Atualizações

```bash
cd /var/www/degustte
git pull origin main
npm install
pm2 restart degustte
pm2 logs degustte
```

## 📈 Passo 16: Backup do Banco de Dados

```bash
# Backup manual
sudo -u postgres pg_dump degustte > backup-$(date +%Y%m%d).sql

# Backup automático (crontab)
0 2 * * * sudo -u postgres pg_dump degustte > /backups/degustte-$(date +\%Y\%m\%d).sql
```

## 🐳 Alternativa: Usar Docker (Recomendado)

Se preferir usar Docker:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install -y docker-compose

# Iniciar serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

## 🎯 Checklist Final

- [ ] VPS criada e SSH funcionando
- [ ] Node.js instalado
- [ ] PostgreSQL instalado e banco criado
- [ ] Repositório clonado
- [ ] .env configurado
- [ ] Banco de dados importado
- [ ] PM2 iniciado
- [ ] Nginx configurado
- [ ] SSL ativado
- [ ] DNS apontando para VPS
- [ ] Site acessível via HTTPS
- [ ] Admin painel funcionando
- [ ] Firewall configurado
- [ ] Backups automáticos configurados

## 🚨 Troubleshooting

### Porta 3000 não responde
```bash
sudo lsof -i :3000
pm2 restart degustte
```

### Nginx não inicia
```bash
nginx -t  # Ver erro
systemctl status nginx
```

### Certificado SSL erro
```bash
certbot renew --force-renewal
certbot certificates  # Listar certificados
```

### Banco de dados não conecta
```bash
sudo -u postgres psql -d degustte
\dt  # Listar tabelas
```

## 📞 Suporte

- PM2: `pm2 help`
- Nginx: `nginx -h`
- PostgreSQL: `psql --help`

**Pronto! Seu DeGustte está no ar! 🎉**
