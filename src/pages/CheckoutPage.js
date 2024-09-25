import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToStripeCheckout = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulamos un pequeño delay de 3 segundos para UX

        // Obtener los datos del usuario, el price_id y el cupón del localStorage
        const userAttributesStr = localStorage.getItem('userAttributes');
        const selectedPriceId = localStorage.getItem('selectedPriceId');
        const couponCode = localStorage.getItem('couponCode'); // Obtenemos el código de cupón si existe

        if (!userAttributesStr || !selectedPriceId) {
          console.error('User attributes or price_id missing');
          navigate('/pricing'); // Redirigir a la página de precios si no hay datos suficientes
          return;
        }

        let userAttributes;
        try {
          userAttributes = JSON.parse(userAttributesStr);
        } catch (error) {
          console.error('Failed to parse user attributes:', error);
          navigate('/pricing');
          return;
        }

        const userId = userAttributes.sub;

        // Crear una sesión de checkout en Stripe llamando a la API del backend
        const response = await fetch('https://tkzarlqsh9.execute-api.eu-west-3.amazonaws.com/dev/stripeapi/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            price_id: selectedPriceId,
            coupon_id: couponCode || null, // Si hay un cupón lo enviamos, si no, enviamos null
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const session = await response.json();

        if (session.id) {
          // Redirigir al usuario a la página de pago de Stripe en una nueva ventana
          const stripe = window.Stripe('tu_clave_publica_de_stripe'); // Reemplaza por tu clave pública de Stripe
          const { error } = await stripe.redirectToCheckout({
            sessionId: session.id
          });

          if (error) {
            console.error('Error redirecting to Stripe checkout:', error);
            navigate('/pricing');
          }
        } else {
          console.error('Error: session.id not found');
          navigate('/pricing');
        }
      } catch (error) {
        console.error('Error during checkout:', error);
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
