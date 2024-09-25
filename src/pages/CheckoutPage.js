import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plans } from '../components/pricing'; // Make sure the import path is correct

const CheckoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToStripeCheckout = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('localStorage.getItem("userAttributes"):', localStorage.getItem('userAttributes'));

        const userAttributesStr = localStorage.getItem('userAttributes');

        if (!userAttributesStr) {
          console.error('User attributes not found in local storage');
          navigate('/pricing');
          return;
        }

        let userAttributes;
        try {
          userAttributes = JSON.parse(userAttributesStr);
        } catch (error) {
          console.error('Failed to parse user attributes from local storage:', error);
          navigate('/pricing');
          return;
        }

        const userId = userAttributes.sub;
        const selectedPriceId = localStorage.getItem('selectedPriceId');
        const selectedPlanName = localStorage.getItem('selectedPlanName');
        let selectedBillingCycle = localStorage.getItem('selectedBillingCycle'); // Can be null for Custom

        console.log('selectedPriceId:', selectedPriceId);
        console.log('selectedPlanName:', selectedPlanName);
        console.log('selectedBillingCycle:', selectedBillingCycle);

        // Find the selected plan
        let selectedPlan;
        if (selectedPlanName === 'Custom') {
          // For Custom plan, we create a simple object with the necessary information
          selectedPlan = {
            name: 'Custom',
            priceId: selectedPriceId
          };
        } else {
          // For other plans, we search in both monthly and yearly arrays
          selectedPlan = plans.monthly.find(plan => plan.priceId === selectedPriceId) ||
                         plans.yearly.find(plan => plan.priceId === selectedPriceId);
        }

        // If the plan is still not found, handle the error
        if (!selectedPlan) {
          console.error('Selected plan not found');
          navigate('/pricing');
          return;
        }

        console.log('Creating session with price_id:', selectedPriceId);
        console.log('Creating session with userID:', userId);

        const response = await fetch('https://tkzarlqsh9.execute-api.eu-west-3.amazonaws.com/dev/stripeapi/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            price_id: selectedPriceId,
            billing_cycle: selectedBillingCycle || null // Only send the cycle if it's relevant
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const session = await response.json();

        if (session.id) {
          if (!window.Stripe) {
            console.error('Stripe.js not loaded');
            return;
          }
          const stripe = window.Stripe('pk_test_51PgiHgCNobZETuuSYPVgYF897M954AejyqzEeQarLNmjlj3fYXZZ5GTKH0xxyzxduvGcbDbpZHOaH0aYHZ25aS7C00B4Dmei9w'); 
          
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