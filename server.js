import express from 'express';
import stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.set('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

const PORT = process.env.PORT || 3000;
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Criar sessão de pagamento Stripe
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { nomeEmpresa, email, telefone, valor, dados } = req.body;

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano DeGustte - ${nomeEmpresa}`,
              description: `Empresa: ${nomeEmpresa}\nEmail: ${email}\nTelefone: ${telefone}`
            },
            unit_amount: Math.round(valor * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        nomeEmpresa,
        email,
        telefone,
        dados: JSON.stringify(dados)
      },
      mode: 'payment',
      success_url: 'http://localhost:8001/sucesso.html',
      cancel_url: 'http://localhost:8001/erro.html'
    });

    console.log('Sessão Stripe criada:', session.id);

    res.json({
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Erro ao criar sessão:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// Webhook para confirmação de pagamento
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Pagamento confirmado:', session.id);
      console.log('Metadados:', session.metadata);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em /api/create-checkout-session`);
});
