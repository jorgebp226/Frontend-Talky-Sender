const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// Definimos la URL del API Gateway correcta

app.post('/create-checkout-session', async (req, res) => {
  const { user_id, price_id } = req.body;

  console.log('Received request to create checkout session with:', { user_id, price_id });

  if (!user_id || !price_id) {
    console.error('Missing user_id or price_id in request body');
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: price_id,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user_id}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: user_id
    });

    console.log('Stripe session created successfully:', session);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Received session:', JSON.stringify(session, null, 2));

    const user_id = session.client_reference_id;
    const amount_total = session.amount_total;

    try {
      // Llamar a la API de API Gateway correcta
      const response = await axios.post(`https://ysg9cp7x1i.execute-api.eu-west-3.amazonaws.com/payment/wbehook`, {
        user_id: user_id,
        price_id: amount_total // Enviar la cantidad total pagada como price_id
      });

      console.log(`API Gateway response: ${JSON.stringify(response.data)}`);
    } catch (apiError) {
      console.error('Error calling API Gateway:', apiError.message);
    }
  }

  // Return a response to acknowledge receipt of the event
  res.json({received: true});
});

module.exports = app;