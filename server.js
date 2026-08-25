import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 3000;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

app.post('/api/create-payment', async (req, res) => {
  try {
    const { nomeEmpresa, email, valor } = req.body;

    const response = await axios.post(
      'https://api.asaas.com/v3/paymentLinks',
      {
        name: `DeGustte - ${nomeEmpresa}`,
        billingType: 'CREDIT_CARD',
        value: Math.max(valor, 5.00),
        dueDate: new Date().toISOString().split('T')[0]
      },
      {
        headers: { 'access_token': ASAAS_API_KEY }
      }
    );

    res.json({ link: response.data.url });
  } catch (error) {
    console.error('Erro:', error.response?.data?.errors || error.message);
    res.status(500).json({ error: error.response?.data?.errors?.[0]?.description || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor na porta ${PORT}`);
});
