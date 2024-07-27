import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Survey4.css';

const SurveyStep4 = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleNext = () => {
    localStorage.setItem('surveyStep4', JSON.stringify(selectedOption));
    navigate('/loading');
  };

  const handleSkip = () => {
    localStorage.setItem('surveyStep4', JSON.stringify(''));
    navigate('/loading');
  };

  return (
    <div className="survey4-container">
      <div className="survey4-header">
        <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" className="survey4-logo" />
      </div>
      <div className="survey4-content">
        <div className="survey4-question">
          <h2>¿Cuántos contactos de teléfono tienes?</h2>
          <p>Con una estimación nos vale. Según tu respuesta, te haremos recomendaciones para ampliar y gestionar tu público.</p>
          <div className="form-group">
            <label htmlFor="contactos">Selecciona tu intervalo de contactos</label>
            <select id="contactos" name="contactos" value={selectedOption} onChange={handleOptionChange}>
              <option value="">Selecciona una opción</option>
              <option value="1-50">1-50</option>
              <option value="50-100">50-100</option>
              <option value="100-200">100-200</option>
              <option value="200-500">200-500</option>
              <option value="500-750">500-750</option>
              <option value="750-1000">750-1000</option>
              <option value="1000-5000">1000-5000</option>
              <option value="5000+">Más de 5000</option>
            </select>
          </div>
          <button4 className="next-button4" onClick={handleNext}>Siguiente</button4>
          <button4 className="skip-button4" onClick={handleSkip}>Omitir</button4>
        </div>
      </div>
      <div className="image-container">
        <div className="survey4-image">
          <img src={`${process.env.PUBLIC_URL}/survey4.png`} alt="Survey Step 4" />
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: "75%" }}></div> {/* Actualización del progreso */}
      </div>
    </div>
  );
};

export default SurveyStep4;
