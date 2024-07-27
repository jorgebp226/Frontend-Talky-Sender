import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Survey.css';

const SurveyStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    tamanoEmpresa: ''
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
    <div className="survey1-container">
      <div className="survey1-header">
        <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" className="survey1-logo" />
      </div>
      <div className="survey1-content">
        <div className="survey1-question">
          <h2>Háblanos un poco de ti</h2>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="apellidos">Apellidos</label>
            <input type="text" id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="tamanoEmpresa">Tamaño de tu empresa</label>
            <select id="tamanoEmpresa" name="tamanoEmpresa" value={formData.tamanoEmpresa} onChange={handleChange}>
              <option value="">Selecciona una opción</option>
              <option value="1">1 empleado</option>
              <option value="1-5">De 1 a 5 empleados</option>
              <option value="5-10">De 5 a 10 empleados</option>
              <option value="10-30">De 10 a 30 empleados</option>
              <option value="30-50">De 30 a 50 empleados</option>
              <option value="50+">50+ empleados</option>
            </select>
          </div>
          <button1 onClick={handleNext}>Siguiente</button1>
        </div>
        <div className="progress-bar">
          <div className="progress" style={{width: '0%'}}></div>
        </div>
      </div>
      <div className="survey1-image">
        <img src={`${process.env.PUBLIC_URL}/survey1.png`} alt="Survey Step 1" />
      </div>
      <button className="back-button1">Atrás</button>
    </div>
  );
};

export default SurveyStep1;
