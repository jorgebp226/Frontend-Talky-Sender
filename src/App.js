import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import axios from 'axios';

function RequireAuth({ children }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [isPaid, setIsPaid] = React.useState(false);

  React.useEffect(() => {
    const checkPaymentStatus = async () => {
      if (user) {
        const userAttributesStr = localStorage.getItem('userAttributes');
        if (!userAttributesStr) {
          console.error('User attributes not found in local storage');
          setLoading(false);
          return;
        }

        let userAttributes;
        try {
          userAttributes = JSON.parse(userAttributesStr);
        } catch (error) {
          console.error('Failed to parse user attributes from local storage:', error);
          setLoading(false);
          return;
        }

        const userId = userAttributes.sub;
        if (userId) {
          localStorage.setItem('userId', userId);
          try {
            const response = await axios.get(`https://rw8emddjlb.execute-api.eu-west-3.amazonaws.com/xr21321//user`, {
              params: { userId: userId }
            });
            const paymentStatus = response.data.PaymentStatus;
            console.log(paymentStatus);
            setIsPaid(paymentStatus === 'Active');
          } catch (error) {
            console.error('Error checking payment status', error);
          } finally {
            setLoading(false);
          }
        } else {
          console.error('User ID not found');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [user]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isPaid && location.pathname !== '/pricing') {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return children;
}

export default RequireAuth;