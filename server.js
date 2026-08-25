import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.set('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

const PORT = process.env.PORT || 3000;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// Criar link de pagamento Asaas
app.post('/api/create-payment-link', async (req, res) => {
  try {
    const { nomeEmpresa, email, telefone, valor, dados } = req.body;

    const response = await axios.post(
      'https://api.asaas.com/v3/paymentLinks',
      {
        billingType: 'UNDEFINED',
        customer: email,
        dueDate: new Date().toISOString().split('T')[0],
        value: valor,
        description: `Plano DeGustte - ${nomeEmpresa}`,
        externalReference: `degustte-${Date.now()}`,
        allowedPaymentMethods: ['PIX', 'CREDIT_CARD', 'BOLETO']
      },
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Link de pagamento criado:', response.data.id);

    res.json({
      paymentLink: response.data.url,
      paymentId: response.data.id
    });
  } catch (error) {
    console.error('Erro ao criar link de pagamento:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.message || error.message
    });
  }
});

// Webhook para confirmação de pagamento
app.post('/webhook', express.json(), async (req, res) => {
  try {
    const { event, payment } = req.body;

    if (event === 'PAYMENT_CONFIRMED') {
      console.log('✅ Pagamento confirmado:', payment.id);
      console.log('Referência:', payment.externalReference);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em /api/create-payment-link`);
});
