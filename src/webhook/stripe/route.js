const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/api/stripe/webhook', (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Enviar evento a la API Gateway
        axios.post('https://ysg9cp7x1i.execute-api.eu-west-3.amazonaws.com/payment/wbehook', {
            body: JSON.stringify(event)
        })
        .then(response => {
            res.status(200).send('Success');
        })
        .catch(error => {
            console.error('Error sending webhook to API Gateway:', error);
            res.status(500).send('Internal Server Error');
        });
    } else {
        res.status(400).end();
    }
});

app.listen(3000, () => console.log('Running on port 3000'));
