import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const { Pool } = pg;
const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// EMPRESAS
app.post('/api/empresas', async (req, res) => {
  try {
    const { nomeEmpresa, email, telefone, cnpj, tipo, nomeResponsavel, cpf, dataNascimento, emailResponsavel, telefoneResponsavel, plano } = req.body;

    const slug = nomeEmpresa.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').substring(0, 20);

    const result = await pool.query(
      'INSERT INTO empresas (slug, nome_empresa, email, telefone, cnpj, tipo, nome_responsavel, cpf, data_nascimento, email_responsavel, telefone_responsavel, plano, status, cardapio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
      [slug, nomeEmpresa, email, telefone, cnpj, tipo, nomeResponsavel, cpf, dataNascimento, emailResponsavel, telefoneResponsavel, plano, 'pendente_revisao', JSON.stringify({ categorias: [], produtos: [] })]
    );

    res.json({ ok: true, empresa: result.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(400).json({ erro: erro.message });
  }
});

app.get('/api/empresas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empresas ORDER BY data_criacao DESC');
    res.json(result.rows);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.get('/api/empresas/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM empresas WHERE slug = $1 AND status != $2', [slug, 'bloqueada']);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Empresa não encontrada' });
    res.json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.patch('/api/empresas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_empresa, email, telefone, cnpj, plano, slug } = req.body;
    const result = await pool.query(
      'UPDATE empresas SET nome_empresa = $1, email = $2, telefone = $3, cnpj = $4, plano = $5, slug = $6 WHERE id = $7 RETURNING *',
      [nome_empresa, email, telefone, cnpj, plano, slug, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Empresa não encontrada' });
    res.json({ ok: true, empresa: result.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(400).json({ erro: erro.message });
  }
});

app.patch('/api/empresas/:id/autorizar', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE empresas SET status = $1, data_autorizacao = NOW() WHERE id = $2 RETURNING *', ['autorizada', id]);
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Empresa não encontrada' });
    res.json(result.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// CARDÁPIO
app.post('/api/empresas/:slug/categorias', async (req, res) => {
  try {
    const { slug } = req.params;
    const { nome, descricao } = req.body;
    const empresaResult = await pool.query('SELECT * FROM empresas WHERE slug = $1', [slug]);
    if (empresaResult.rows.length === 0) return res.status(404).json({ erro: 'Empresa não encontrada' });
    const empresa = empresaResult.rows[0];
    const cardapio = empresa.cardapio || { categorias: [], produtos: [] };
    const categoria = { id: Date.now().toString(), nome, descricao };
    cardapio.categorias.push(categoria);
    await pool.query('UPDATE empresas SET cardapio = $1 WHERE slug = $2', [JSON.stringify(cardapio), slug]);
    res.json(categoria);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.post('/api/empresas/:slug/produtos', async (req, res) => {
  try {
    const { slug } = req.params;
    const { nome, categoriaId, descricao, preco, disponivel } = req.body;
    const empresaResult = await pool.query('SELECT * FROM empresas WHERE slug = $1', [slug]);
    if (empresaResult.rows.length === 0) return res.status(404).json({ erro: 'Empresa não encontrada' });
    const empresa = empresaResult.rows[0];
    const cardapio = empresa.cardapio || { categorias: [], produtos: [] };
    const produto = { id: Date.now().toString(), nome, categoriaId, descricao, preco: parseFloat(preco), disponivel: disponivel !== false };
    cardapio.produtos.push(produto);
    await pool.query('UPDATE empresas SET cardapio = $1 WHERE slug = $2', [JSON.stringify(cardapio), slug]);
    res.json(produto);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ADMIN
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (email === 'admin@degustte.com' && senha === 'admin123') {
      res.json({ ok: true, user: { email, nome: 'Administrador' } });
    } else {
      res.status(401).json({ erro: 'Credenciais inválidas' });
    }
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// HEALTH CHECK
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (erro) {
    res.status(500).json({ status: 'erro', message: erro.message });
  }
});

// SPA fallback - rotas como /alameda22 servem a página de loja
app.get(/^\/(?!api|admin).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loja.html'));
});

// 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Endpoint não encontrado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ DeGustte rodando em http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`🛡️  Admin: http://localhost:${PORT}/admin/login.html`);
});

// HTTPS (certificado api.degustte.com.br gerado via win-acme)
const CERT_KEY = 'C:\\degustte\\api.degustte.com.br-key.pem';
const CERT_CHAIN = 'C:\\degustte\\api.degustte.com.br-chain.pem';

if (fs.existsSync(CERT_KEY) && fs.existsSync(CERT_CHAIN)) {
  const httpsOptions = {
    key: fs.readFileSync(CERT_KEY),
    cert: fs.readFileSync(CERT_CHAIN),
  };

  https.createServer(httpsOptions, app).listen(443, () => {
    console.log('🔒 HTTPS rodando em https://api.degustte.com.br');
  });
}
