// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>
        Volver a la página de inicio
      </Link>
    </div>
  );
};

export default NotFound;
