import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plans } from '../components/pricing'; // Asegúrate de que la ruta de importación sea correcta

const CheckoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToStripeCheckout = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
        const userId = userAttributes.sub;

        const selectedPriceId = localStorage.getItem('selectedPriceId');
        const selectedBillingCycle = localStorage.getItem('selectedBillingCycle');

        if (!userId || !selectedPriceId || !selectedBillingCycle) {
          console.error('Missing required information for checkout');
          navigate('/pricing');
          return;
        }

        const selectedPlan = plans[selectedBillingCycle].find(plan => plan.priceId === selectedPriceId);

        if (!selectedPlan) {
          console.error('Selected plan not found');
          navigate('/pricing');
          return;
        }

        console.log('Creating session with price_id:', selectedPriceId); // Log del price_id
        console.log('Creating session with userID:', userId); // Log del userId

        // Crear una sesión de checkout en Stripe a través de tu backend
        const response = await fetch('https://60y1arez3h.execute-api.eu-west-3.amazonaws.com/dev/api/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            price_id: selectedPriceId
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const session = await response.json();

        if (session.id) {
          // Redirigir a la página de pago de Stripe en una nueva ventana
          const stripe = window.Stripe('pk_test_51PgiHgCNobZETuuSYPVgYF897M954AejyqzEeQarLNmjlj3fYXZZ5GTKH0xxyzxduvGcbDbpZHOaH0aYHZ25aS7C00B4Dmei9w'); // Asegúrate de usar tu clave pública de Stripe
          const { error } = await stripe.redirectToCheckout({
            sessionId: session.id
          });

          if (error) {
            console.error('Error redirecting to Stripe checkout:', error);
            navigate('/pricing');
          }
        } else {
          console.error('Error creating Stripe checkout session');
          navigate('/pricing');
        }
      } catch (error) {
        console.error('Error redirecting to Stripe checkout:', error);
        navigate('/pricing');
      }
    };

    redirectToStripeCheckout();
  }, [navigate]);

  return (
    <div>
      <h1>Preparando tu pago...</h1>
      <p>Por favor, espera mientras te redirigimos a la página de pago seguro.</p>
    </div>
  );
};

export default CheckoutPage;
