import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-8018838157806850-082413-4f1e94a51f821e71f5e05a88b2ae4e8c-1234567890';

app.post('/api/create-preference', async (req, res) => {
  try {
    const { nomeEmpresa, email, valor, dados } = req.body;

    const preference = {
      items: [
        {
          title: `Plano DeGustte - ${nomeEmpresa}`,
          quantity: 1,
          unit_price: valor
        }
      ],
      payer: {
        email: email
      },
      external_reference: `degustte-${Date.now()}`,
      back_urls: {
        success: 'http://localhost:8001/sucesso.html?external_reference={external_reference}',
        failure: 'http://localhost:8001/erro.html',
        pending: 'http://localhost:8001/pendente.html'
      },
      notification_url: `http://localhost:${PORT}/webhook`
    };

    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      preference,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Preferência criada:', response.data.id);
    res.json({
      initPoint: response.data.init_point,
      preferenceId: response.data.id
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:', req.body);
  res.json({ status: 'received' });
});

app.get('/sucesso', (req, res) => {
  res.send('<h1>Pagamento Realizado com Sucesso!</h1>');
});

app.get('/erro', (req, res) => {
  res.send('<h1>Pagamento Falhou</h1>');
});

app.get('/pendente', (req, res) => {
  res.send('<h1>Pagamento Pendente</h1>');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api/create-preference`);
});
