import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EnterCodePage.css'; // Crea este archivo para manejar el estilo personalizado

const EnterCodePage = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleCodeSubmit = () => {
    if (code.trim()) {
      localStorage.setItem('couponCode', code); // Guardamos el código en localStorage
      navigate('/register'); // Redirigir a la página de registro
    } else {
      alert('Por favor, introduce un código válido.');
    }
  };

  return (
    <div className="enter-code-page">
      <div className="code-container">
        <h1>Introduce tu código personalizado</h1>
        <p>Por favor, introduce el código proporcionado para activar tu plan personalizado.</p>
        <div className="input-container">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresa tu código"
            className="code-input"
          />
        </div>
        <button onClick={handleCodeSubmit} className="submit-btn">Enviar</button>
      </div>
    </div>
  );
};

export default EnterCodePage;
