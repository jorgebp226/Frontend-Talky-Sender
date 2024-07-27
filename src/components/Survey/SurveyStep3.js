import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Survey3.css';

const SurveyStep3 = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleNext = () => {
    localStorage.setItem('surveyStep3', JSON.stringify(selectedOption));
    navigate('/survey/step4');
  };

  const handleSkip = () => {
    localStorage.setItem('surveyStep3', JSON.stringify(''));
    navigate('/survey/step4');
  };

  return (
    <div className="survey3-container">
      <div className="survey3-header">
        <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" className="survey3-logo" />
      </div>
      <div className="survey3-content">
        <div className="survey3-question">
          <h2>¿Cuál es tu objetivo principal con Talky Sender?</h2>
          <p>Vamos a empezar con unas recomendaciones personalizadas en base a tu objetivo.</p>
          <div className="radio-group">
            <div className={`radio-item ${selectedOption === 'ventas' ? 'selected' : ''}`} onClick={() => setSelectedOption('ventas')}>
              <input
                type="radio"
                id="ventas"
                name="objetivo"
                value="ventas"
                checked={selectedOption === 'ventas'}
                onChange={handleOptionChange}
              />
              <label htmlFor="ventas">
                <strong>Impulsar las ventas, los ingresos o las conversiones</strong>
              </label>
            </div>
            <div className={`radio-item ${selectedOption === 'correo' ? 'selected' : ''}`} onClick={() => setSelectedOption('correo')}>
              <input
                type="radio"
                id="correo"
                name="objetivo"
                value="correo"
                checked={selectedOption === 'correo'}
                onChange={handleOptionChange}
              />
              <label htmlFor="correo">
                <strong>Enviar WhatsApps útiles o entretenidos a la gente</strong>
              </label>
            </div>
            <div className={`radio-item2 ${selectedOption === 'suscriptores' ? 'selected' : ''}`} onClick={() => setSelectedOption('suscriptores')}>
              <input
                type="radio"
                id="suscriptores"
                name="objetivo"
                value="suscriptores"
                checked={selectedOption === 'suscriptores'}
                onChange={handleOptionChange}
              />
              <label htmlFor="suscriptores">
                <strong>Enviar recordatorios a mis clientes</strong>
              </label>
            </div>
          </div>
          <button3 className="next-button3" onClick={handleNext}>Siguiente</button3>
          <button3 className="skip-button3" onClick={handleSkip}>Omitir</button3>
        </div>
      </div>
      <div className="image-container">
        <div className="survey3-image">
          <img src={`${process.env.PUBLIC_URL}/survey3.png`} alt="Survey Step 3" />
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: "50%" }}></div> {/* Actualización del progreso */}
      </div>
    </div>
  );
};

export default SurveyStep3;
