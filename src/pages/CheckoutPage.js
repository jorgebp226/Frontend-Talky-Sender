import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectToStripeCheckout = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));

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

        // Verificar valores
        console.log('selectedPlanName:', selectedPlanName);
        console.log('selectedPriceId:', selectedPriceId);
        console.log('selectedBillingCycle:', selectedBillingCycle);
        console.log('coupon:', coupon);

        const isOneTimePayment = selectedPlanName === 'Custom';

        // Prepara el cuerpo de la solicitud
        const requestBody = {
          user_id: userId,
          price_id: selectedPriceId,
          mode: isOneTimePayment ? 'payment' : 'subscription',
          ...(isOneTimePayment ? {} : { billing_cycle: selectedBillingCycle || null }),
          ...(coupon ? { coupon_id: coupon } : {}) // Aquí asegúrate de enviar el cupón como "coupon_id"
        };
        
        // Mostrar el cuerpo de la solicitud para depuración
        console.log('Request Body:', requestBody);

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
          // Asegurarse de que Stripe.js esté cargado
          if (!window.Stripe) {
            const stripeScript = document.createElement('script');
            stripeScript.src = 'https://js.stripe.com/v3/';
            stripeScript.async = true;
            stripeScript.onload = async () => {
              const stripe = window.Stripe('pk_live_51PgiHgCNobZETuuSBoIXJUn8Mm93DcU4s4wFyoe4snCuNgJnxlFvxpkANa0ErQqQbdW714UQiCzCJzbAMdoLrR7V00zbVckZow');
              const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
              if (error) {
                throw new Error('Error redirecting to Stripe checkout: ' + error.message);
              }
            };
            document.body.appendChild(stripeScript);
          } else {
            const stripe = window.Stripe('pk_test_51PgiHgCNobZETuuSYPVgYF897M954AejyqzEeQarLNmjlj3fYXZZ5GTKH0xxyzxduvGcbDbpZHOaH0aYHZ25aS7C00B4Dmei9w');
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

            if (error) {
              throw new Error('Error redirecting to Stripe checkout: ' + error.message);
            }
          }
        } else {
          throw new Error('Error creating Stripe checkout session: Session ID not received');
        }
      } catch (error) {
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
