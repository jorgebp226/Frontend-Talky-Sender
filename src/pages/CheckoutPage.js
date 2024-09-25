import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plans } from '../components/plans'; // Asegúrate de que la ruta de importación sea correcta

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectToStripeCheckout = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('localStorage.getItem("userAttributes"):', localStorage.getItem('userAttributes'));

        const userAttributesStr = localStorage.getItem('userAttributes');

        if (!userAttributesStr) {
          throw new Error('User attributes not found in local storage');
        }

        let userAttributes;
        try {
          userAttributes = JSON.parse(userAttributesStr);
        } catch (error) {
          throw new Error('Failed to parse user attributes from local storage: ' + error.message);
        }

        const userId = userAttributes.sub;
        const selectedPriceId = localStorage.getItem('selectedPriceId');
        const selectedPlanName = localStorage.getItem('selectedPlanName');
        const coupon = localStorage.getItem('couponCode');
        let selectedBillingCycle = localStorage.getItem('selectedBillingCycle');

        console.log('selectedPriceId:', selectedPriceId);
        console.log('selectedPlanName:', selectedPlanName);
        console.log('selectedBillingCycle:', selectedBillingCycle);
        console.log('coupon:', coupon);

        // Determine if it's a one-time payment or a subscription
        const isOneTimePayment = selectedPlanName === 'Custom';

        // Prepare the request body
        const requestBody = {
          user_id: userId,
          price_id: selectedPriceId,
          mode: isOneTimePayment ? 'payment' : 'subscription',
          // Only include billing_cycle for subscriptions
          ...(isOneTimePayment ? {} : { billing_cycle: selectedBillingCycle || null }),
          // Include coupon if it exists
          ...(coupon ? { coupon: coupon } : {})
        };

        console.log('Creating session with:', requestBody);

        const response = await fetch('https://tkzarlqsh9.execute-api.eu-west-3.amazonaws.com/dev/stripeapi/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network response was not ok. Status: ${response.status}. Error: ${errorText}`);
        }

        const session = await response.json();

        if (session.id) {
          if (!window.Stripe) {
            throw new Error('Stripe.js not loaded');
          }
          const stripe = window.Stripe('pk_test_51PgiHgCNobZETuuSYPVgYF897M954AejyqzEeQarLNmjlj3fYXZZ5GTKH0xxyzxduvGcbDbpZHOaH0aYHZ25aS7C00B4Dmei9w'); 
          
          const { error } = await stripe.redirectToCheckout({
            sessionId: session.id
          });

          if (error) {
            throw new Error('Error redirecting to Stripe checkout: ' + error.message);
          }
        } else {
          throw new Error('Error creating Stripe checkout session: Session ID not received');
        }
      } catch (error) {
        console.error('Error in checkout process:', error);
        setError(error.message);
      }
    };

    redirectToStripeCheckout();
  }, [navigate]);

  if (error) {
    return (
      <div>
        <h1>Error en el proceso de pago</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/pricing')}>Volver a la página de precios</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Preparando tu pago...</h1>
      <p>Por favor, espera mientras te redirigimos a la página de pago seguro.</p>
    </div>
  );
};

export default CheckoutPage;