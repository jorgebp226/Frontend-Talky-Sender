import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import './Pricing.css';

const stripePromise = loadStripe('pk_live_51PgiHgCNobZETuuSBoIXJUn8Mm93DcU4s4wFyoe4snCuNgJnxlFvxpkANa0ErQqQbdW714UQiCzCJzbAMdoLrR7V00zbVckZow');

export const plans = {
  monthly: [
    {
      name: 'Básico',
      initialPrice: '150€/mes (los primeros 12 meses)',
      regularPrice: '192.32€/mes (después de los 12 meses)',
      features: [
        'Hasta 100 contactos',
        'Hasta 500 mensajes al mes',
        'Envío de mensajes personalizados sin imágenes',
        'Soporte por correo electrónico',
        'Informes básicos de entrega y lectura'
      ],
      priceId: 'price_1PgiSCCNobZETuuSNjMZMCso',
      stripeLink: 'https://buy.stripe.com/test_aEUeXC79rh2UafCfYY',
    },
    {
      name: 'Estándar',
      initialPrice: '300€/mes (los primeros 12 meses)',
      regularPrice: '348€/mes (después de los 12 meses)',
      features: [
        'Hasta 400 contactos',
        'Hasta 1,000 mensajes al mes',
        'Envío de mensajes personalizados con imágenes',
        'Soporte por correo electrónico y chat en vivo',
        'Informes avanzados de entrega y lectura',
        'Integración con CRM'
      ],
      priceId: 'price_1PgiSZCNobZETuuSXxbq64wW',
      stripeLink: 'https://buy.stripe.com/test_bIY16MctLh2U9byaEF',
    },
    {
      name: 'Premium',
      initialPrice: '600€/mes (los primeros 12 meses)',
      regularPrice: '678€/mes (después de los 12 meses)',
      features: [
        'Hasta 1,000 contactos',
        'Hasta 5,000 mensajes al mes',
        'Envío de mensajes personalizados con imágenes y multimedia (videos, documentos)',
        'Soporte prioritario 24/7',
        'Informes avanzados con analítica detallada',
        'Integración con CRM y herramientas de marketing',
        'Automatización de campañas'
      ],
      priceId: 'price_1PgiT7CNobZETuuSU4WZXITt',
      stripeLink: 'https://buy.stripe.com/test_4gw16M9hzcME5Zm28a',
    },
  ],
  yearly: [
    {
      name: 'Básico',
      price: '125€/mes',
      features: [
        'Hasta 100 contactos',
        'Hasta 500 mensajes al mes',
        'Envío de mensajes personalizados sin imágenes',
        'Soporte por correo electrónico',
        'Informes básicos de entrega y lectura'
      ],
      priceId: 'price_1PgiV3CNobZETuuSjYl75c62',
      stripeLink: 'https://buy.stripe.com/test_5kAg1GalD5kcdrObIN',
    },
    {
      name: 'Estándar',
      price: '249€/mes',
      features: [
        'Hasta 400 contactos',
        'Hasta 1,000 mensajes al mes',
        'Envío de mensajes personalizados con imágenes',
        'Soporte por correo electrónico y chat en vivo',
        'Informes avanzados de entrega y lectura',
        'Integración con CRM'
      ],
      priceId: 'price_1PgiUSCNobZETuuSidBlmy2J',
      stripeLink: 'https://buy.stripe.com/test_9AQ7vaeBT6ogfzWaEI',
    },
    {
      name: 'Premium',
      price: '499€/mes',
      features: [
        'Hasta 1,000 contactos',
        'Hasta 5,000 mensajes al mes',
        'Envío de mensajes personalizados con imágenes y multimedia (videos, documentos)',
        'Soporte prioritario 24/7',
        'Informes avanzados con analítica detallada',
        'Integración con CRM y herramientas de marketing',
        'Automatización de campañas'
      ],
      priceId: 'price_1PgiTtCNobZETuuSMIuumhXr',
      stripeLink: 'https://buy.stripe.com/test_cN22aQ1P73c487u4gj',
    },
  ],
};

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');
  
    const stripe = useStripe();
    const elements = useElements();
  
  
    const handleSubscribe = async (priceId) => {
      if (!stripe || !elements) {
        return;
      }
  
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
  
      if (error) {
        console.error(error);
        return;
      }
  
      const response = await fetch('/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId,
        }),
      });
  
      const subscription = await response.json();
  
      if (subscription.error) {
        console.error(subscription.error);
        return;
      }
  
      // Handle successful subscription (e.g., show confirmation message)
    };
  
    return (
        <div className="pricing-container">
          <div className="billing-cycle-toggle">
            <  button-pricing 
              className={billingCycle === 'monthly' ? 'active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >
              Mensual
            </  button-pricing >
            <  button-pricing 
              className={billingCycle === 'yearly' ? 'active' : ''}
              onClick={() => setBillingCycle('yearly')}
            >
              Anual
            </  button-pricing >
          </div>
          <div className="plans">
            {plans[billingCycle].map((plan, index) => (
              <div key={index} className="plan">
                <h3>{plan.name}</h3>
                <p className="price">
                  {billingCycle === 'monthly' ? (
                    <>
                      <span>{plan.initialPrice}</span>
                      <br />
                      <span>{plan.regularPrice}</span>
                    </>
                  ) : (
                    <span>{plan.price}</span>
                  )}
                </p>
                <ul className="features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <a href={plan.stripeLink} className="subscribe-button">Subscribe</a>
                <button onClick={() => handleSubscribe(plan.priceId)}>Subscribe with Payment Method</button>
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    const PricingWrapper = () => (
      <Elements stripe={stripePromise}>
        <Pricing />
      </Elements>
    );
    
    export default PricingWrapper;