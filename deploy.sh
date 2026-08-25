#!/bin/bash

# ============================
# DeGustte Deployment Script
# ============================

set -e

echo "🚀 Iniciando deploy do DeGustte..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check requirements
echo -e "${YELLOW}Verificando pré-requisitos...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js não instalado${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ NPM não instalado${NC}"
  exit 1
fi

if ! command -v psql &> /dev/null; then
  echo -e "${RED}❌ PostgreSQL não instalado${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Todos os pré-requisitos OK${NC}"

# Install dependencies
echo -e "${YELLOW}Instalando dependências...${NC}"
npm install

# Setup environment
if [ ! -f .env ]; then
  echo -e "${YELLOW}Copiando .env.example para .env${NC}"
  cp .env.example .env
  echo -e "${RED}⚠️  Edite o arquivo .env com suas configurações${NC}"
  exit 1
fi

# Create database
echo -e "${YELLOW}Preparando banco de dados...${NC}"

DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)
DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2)

# Check if database exists
if psql -h $DB_HOST -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo -e "${GREEN}✅ Database já existe${NC}"
else
  echo -e "${YELLOW}Criando database...${NC}"
  psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
  echo -e "${GREEN}✅ Database criada${NC}"
fi

# Run migrations
echo -e "${YELLOW}Executando migrations...${NC}"

DB_CONNECTION="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST/$DB_NAME"

# Import schema using node script
node -e "
  const fs = require('fs');
  const { Pool } = require('pg');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schema = fs.readFileSync('database.sql', 'utf8');

  pool.query(schema, (err) => {
    if (err) console.error('Erro na migration:', err);
    else console.log('✅ Migrations executadas');
    pool.end();
  });
"

# Install PM2
echo -e "${YELLOW}Instalando PM2...${NC}"
npm install -g pm2

# Start application
echo -e "${YELLOW}Iniciando aplicação...${NC}"
pm2 start server.js --name "degustte" --env production
pm2 startup
pm2 save

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${GREEN}🌐 Acesse: http://localhost:3000${NC}"
echo -e "${GREEN}📊 Admin: http://localhost:3000/admin/login.html${NC}"
