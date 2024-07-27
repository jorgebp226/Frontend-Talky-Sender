import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoadingPage.css';

const LoadingPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
    if (!userAttributes || !userAttributes.sub) {
      console.error("userAttributes no encontrados o 'sub' no disponible en localStorage");
      return;
    }
    const userId = userAttributes.sub;

    const surveyStep1 = JSON.parse(localStorage.getItem('surveyStep1')) || {};
    const surveyStep2 = JSON.parse(localStorage.getItem('surveyStep2')) || [];
    const surveyStep3 = JSON.parse(localStorage.getItem('surveyStep3')) || '';
    const surveyStep4 = JSON.parse(localStorage.getItem('surveyStep4')) || '';

    const sendSurveyData = async () => {
      try {
        const response = await fetch('https://b521v5ts5j.execute-api.eu-west-3.amazonaws.com/newuser/survey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            surveyStep1,
            surveyStep2,
            surveyStep3,
            surveyStep4,
          }),
        });

        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }

        console.log('Datos enviados correctamente');
      } catch (error) {
        console.error('Error al enviar los datos:', error);
      }
    };

    sendSurveyData();

    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress < 3) {
          return prevProgress + 1;
        }
        clearInterval(timer);
        return prevProgress;
      });
    }, 10000);

    const redirectTimer = setTimeout(() => {
      navigate('/dashboard');
    }, 45000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="loading4-container">
      <div className="loading4-header">
        <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" className="loading4-logo" />
      </div>
      <div className="loading4-content">
        <div className="loading4-text">
          <h1>Estamos preparando tu cuenta...</h1>
          <ul>
            <li className={progress > 0 ? 'completed' : ''}>Recopilando datos {progress > 0 && <span>✔</span>}</li>
            <li className={progress > 1 ? 'completed' : ''}>Personalizando tu configuración {progress > 1 && <span>✔</span>}</li>
            <li className={progress > 2 ? 'completed' : ''}>Generando recomendaciones {progress > 2 && <span>✔</span>}</li>
          </ul>
          <p>Si no se te redirige automáticamente, haz clic <a href="/dashboard">aquí</a>.</p>
        </div>
      </div>
      <div className="image-container">
        <div className="loading4-image">
          <img src={`${process.env.PUBLIC_URL}/loading.png`} alt="Loading" />
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
