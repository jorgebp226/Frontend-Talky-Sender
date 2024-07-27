import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al survey después de un breve retraso para asegurar que la página cargue completamente
    const timer = setTimeout(() => {
      navigate('/survey/step1');
    }, 1000); // 1 segundo de retraso

    // Limpiar el temporizador si el componente se desmonta
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Redirecting to the survey...</p>
    </div>
  );
};

export default SuccessPage;
