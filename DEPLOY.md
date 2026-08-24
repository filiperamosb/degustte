# 🚀 Guia Completo de Deploy - DeGustte

## Passo 1: Preparar o Git Localmente

```bash
# Abra o PowerShell/CMD na pasta do projeto
cd "C:\Users\Administrator\Documents\deguste app"

# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: DeGustte platform online"

# Renomear branch para main
git branch -M main
```

## Passo 2: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha os campos:
   - **Repository name**: `deguste-app`
   - **Description**: `Plataforma de Gestão para Bares e Restaurantes`
   - **Public**: Marque como público
3. Clique em "Create repository"
4. NÃO inicialize com README (você já tem um)

## Passo 3: Fazer Push para GitHub

```bash
# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/deguste-app.git

# Fazer push
git push -u origin main
```

Pronto! Seu código está no GitHub.

---

## 🌐 Opção A: Deploy com GitHub Pages (Gratuito)

### Ativar GitHub Pages

1. Vá para seu repositório no GitHub
2. Clique em **Settings**
3. Desça até **Pages** (no menu lateral)
4. Em "Source", selecione:
   - Branch: **main**
   - Pasta: **/ (root)**
5. Clique em **Save**
6. Aguarde 1-2 minutos

**Seu site estará em:**
```
https://SEU_USUARIO.github.io/deguste-app
```

### Adicionar Domínio Personalizado no GitHub Pages

1. Va para **Settings > Pages**
2. Em "Custom domain", adicione seu domínio
3. Clique em **Save**
4. Aguarde o SSL ser gerado (5-10 minutos)
5. Configure no registrador:
   - Adicione um registro DNS **CNAME** apontando para seu GitHub Pages

---

## 🌐 Opção B: Deploy com Vercel (Recomendado - Mais Rápido)

### Passo 1: Conectar GitHub ao Vercel

1. Acesse https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel

### Passo 2: Fazer Deploy

1. Clique em "New Project"
2. Selecione o repositório "deguste-app"
3. Clique em "Import"
4. Clique em "Deploy"

**Pronto!** Seu site já está online em uma URL Vercel.

### Adicionar Domínio no Vercel

1. Vá para seu projeto no Vercel
2. Clique em **Settings**
3. Vá para **Domains**
4. Clique em "Add"
5. Digite seu domínio
6. Configure os registros DNS conforme indicado

---

## 🌐 Opção C: Deploy com Netlify (Alternativa Gratuita)

### Opção C.1: Deploy Manual (Mais Rápido)

1. Acesse https://netlify.com
2. Faça login ou crie uma conta
3. Arraste a pasta do projeto para a área de "drop files here"
4. Pronto! Seu site está online em alguns segundos

### Opção C.2: Deploy via GitHub

1. Acesse https://netlify.com
2. Clique em "New site from Git"
3. Conecte sua conta GitHub
4. Selecione o repositório "deguste-app"
5. Clique em "Deploy site"

---

## 🌍 Comprar e Configurar Domínio Personalizado

### Onde Comprar:

- **Namecheap** - https://namecheap.com (Recomendado)
- **Hostinger** - https://hostinger.com
- **GoDaddy** - https://godaddy.com
- **Google Domains** - https://domains.google

### Preço Aproximado:
- R$ 30-50 por ano (depende da extensão)

### Configurar DNS:

#### Para GitHub Pages:
```
Type: CNAME
Name: www (ou seu subdomínio)
Value: seu-usuario.github.io
```

#### Para Vercel:
```
Type: A
Name: @ (raiz)
Value: 76.76.19.131

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Para Netlify:
```
Type: A
Name: @
Value: 75.2.60.5
```

---

## 📊 Checklist de Deploy

- [ ] Código no GitHub
- [ ] GitHub Pages/Vercel/Netlify ativado
- [ ] Site online em URL temporária
- [ ] Domínio comprado
- [ ] DNS configurado
- [ ] Domínio apontando para site
- [ ] HTTPS ativado (automático)
- [ ] Google Analytics adicionado (opcional)
- [ ] Teste de responsividade em mobile
- [ ] Teste de performance

---

## 🔧 Atualizações Futuras

Sempre que fizer mudanças locais:

```bash
# Fazer as edições no index.html

# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição da mudança"

# Push
git push

# O site será automaticamente atualizado em poucos minutos!
```

---

## ❓ Dúvidas Comuns

**P: Qual opção devo escolher?**
R: Para começar, use **Vercel** (mais rápido). Depois considere GitHub Pages ou Netlify.

**P: Quanto tempo leva para o site ficar online?**
R: Vercel: 1-2 minutos | GitHub Pages: 5-10 minutos

**P: Preciso pagar para hospedar?**
R: Não! Todas as opções são gratuitas para projetos estáticos.

**P: Como atualizar o site?**
R: Faça as edições localmente, faça push no Git, e o site atualiza automaticamente.

---

**Sucesso no seu deploy! 🎉**
