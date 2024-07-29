const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());

// Middleware para parsear JSON, excepto para la ruta del webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/stripeapi/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Manejar el webhook de Stripe con raw body
app.post('/stripeapi/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Received session:', JSON.stringify(session, null, 2));

    const user_id = session.client_reference_id;
    const amount_total = session.amount_total;

    try {
      const response = await axios.post(`https://ysg9cp7x1i.execute-api.eu-west-3.amazonaws.com/payment/wbehook`, {
        user_id: user_id,
        price_id: amount_total
      });

      console.log(`API Gateway response: ${JSON.stringify(response.data)}`);
    } catch (apiError) {
      console.error('Error calling API Gateway:', apiError.message);
    }
  }

  res.json({received: true});
});

// Ruta para crear la sesión de checkout
app.post('/stripeapi/create-checkout-session', async (req, res) => {
  const { user_id, price_id } = req.body;

  console.log('Received request to create checkout session with:', { user_id, price_id });
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

  if (!user_id || !price_id) {
    console.error('Missing user_id or price_id in request body');
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const successUrl = `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/cancel`;

    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: price_id,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user_id
    });

    console.log('Stripe session created successfully:', session);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;