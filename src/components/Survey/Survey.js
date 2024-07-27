import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Survey.css';

const SurveyStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    denominacion: '',
    telefono: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData, 
      [name]: value 
    }));
  };

  const handleNext = () => {
    localStorage.setItem('surveyStep1', JSON.stringify(formData));
    navigate('/survey/step2');
  };

  return (
    <div className="survey-container">
      <div className="survey-header">
        <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" className="survey-logo" />
      </div>
      <div className="survey-content">
        <div className="survey-question">
          <h2>Háblanos un poco de ti</h2>
          <label>
            Nombre
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
          </label>
          <label>
            Apellidos
            <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} />
          </label>
          <button onClick={handleNext}>Siguiente</button>
        </div>
      </div>
      <div className="survey-image">
        <img src={`${process.env.PUBLIC_URL}/survey1.png`} alt="Survey Step 1" />
      </div>
      <div className="progress-bar">
        <div className="progress" style={{width: "25%"}}></div>
      </div>
    </div>
  );
};

export default SurveyStep1;