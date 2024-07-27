import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Survey2.css';

const SurveyStep2 = () => {
  const navigate = useNavigate();
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionChange = (option) => {
    setSelectedOptions(prevOptions =>
      prevOptions.includes(option)
        ? prevOptions.filter(item => item !== option)
        : [...prevOptions, option]
    );
  };

  const handleNext = () => {
    localStorage.setItem('surveyStep2', JSON.stringify(selectedOptions));
    navigate('/survey/step3');
  };

  const handleSkip = () => {
    localStorage.setItem('surveyStep2', JSON.stringify([]));
    navigate('/survey/step3');
  };

  const options = [
    { id: 'web', label: 'Nuestro propio sitio web', description: 'Los clientes pueden hacer compras directamente en nuestra tienda en línea o aplicación' },
    { id: 'physical', label: 'Ubicación física', description: 'Los productos se venden en persona en una tienda efímera o permanente' },
    { id: 'marketplace', label: 'Mercados de Internet', description: 'Etsy, Amazon, Mindbody, etc.' },
    { id: 'consultation', label: 'Proceso de consulta', description: 'Interacciones individuales con los clientes (por correo electrónico, a través de un formulario, en persona)' },
    { id: 'social', label: 'Redes sociales', description: 'Las transacciones se hacen directamente en Instagram, Facebook, etc.' },
  ];

  return (
    <div className="survey2-container">
      <div className="survey2-header">
        <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" className="survey2-logo" />
      </div>
      <div className="survey2-content">
        <div className="survey2-question">
          <h2>¿Cómo vendes los productos a tus clientes?</h2>
          <p>Selecciona todas las opciones que correspondan.</p>
          <div className="checkbox-group">
            {options.map(option => (
              <div
                key={option.id}
                className={`checkbox-item ${option.id === 'social' ? 'checkbox-item2' : ''} ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
                onClick={() => handleOptionChange(option.id)}
              >
                <input
                  type="checkbox"
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => handleOptionChange(option.id)}
                />
                <label htmlFor={option.id}>
                  <strong>{option.label}</strong>
                  <br />
                  {option.description}
                </label>
              </div>
            ))}
            <div className="checkbox-item empty"></div> {/* Caja vacía */}
          </div>
          <button2 className="next-button" onClick={handleNext}>Siguiente</button2>
          <button2 className="skip-button" onClick={handleSkip}>Ahora mismo no vendemos nada</button2>
        </div>
      </div>
      <div className="image-container"> {/* Nuevo contenedor */}
        <div className="survey2-image">
          <img src={`${process.env.PUBLIC_URL}/survey2.png`} alt="Survey Step 2" />
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: "25%" }}></div>
      </div>
    </div>
  );
};

export default SurveyStep2;
