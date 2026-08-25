import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

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
        success: 'https://www.degustte.com.br/redirect.html',
        failure: 'https://www.degustte.com.br/erro.html',
        pending: 'https://www.degustte.com.br/pendente.html'
      },
      notification_url: 'https://deguuste.onrender.com/webhook'
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
    console.error('Erro ao criar preferência:', JSON.stringify(error.response?.data || error.message, null, 2));
    res.status(500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

const approvedPayments = new Set();

app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:', req.body);

  if (req.body.type === 'payment' && req.body.action === 'payment.created') {
    const reference = req.body.data?.id;
    if (reference) {
      approvedPayments.add(reference);
      console.log('Pagamento aprovado:', reference);
    }
  }

  res.json({ status: 'received' });
});

app.get('/api/check-payment', async (req, res) => {
  const reference = req.query.reference;
  console.log('Verificando pagamento:', reference);

  try {
    const response = await axios.get(
      'https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=100',
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const payments = response.data.results || [];
    const payment = payments.find(p =>
      p.description && p.description.includes(reference) && p.status === 'approved'
    );

    if (payment) {
      console.log('✅ Pagamento encontrado e aprovado:', payment.id);
      res.json({
        approved: true,
        paymentId: payment.id,
        amount: payment.transaction_amount
      });
    } else {
      res.json({
        approved: false,
        message: 'Aguardando confirmação...'
      });
    }
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error.message);
    res.json({
      approved: false,
      message: 'Erro ao verificar'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em /api/create-preference`);
});
