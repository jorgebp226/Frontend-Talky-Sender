import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EnterCodePage = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleCodeSubmit = () => {
    if (code.trim()) {
      localStorage.setItem('couponCode', code); // Guardamos el código en localStorage
      navigate('/checkout'); // Redirigir a la página de pago
    } else {
      alert('Por favor, introduce un código válido.');
    }
  };

  return (
    <div>
      <h1>Introduce tu código personalizado</h1>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ingresa tu código"
      />
      <button onClick={handleCodeSubmit}>Enviar</button>
    </div>
  );
};

export default EnterCodePage;
