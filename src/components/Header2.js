import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  return (
    <header className="sticky-header">
      <div className="header-content">
        <Link to="/">
          <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Talky Logo" className="logo" />
        </Link>
        <nav className="nav">
          <div className="nav-item">
            <Link to="#">Producto <FontAwesomeIcon icon={faChevronDown} /></Link>
          </div>
          <div className="nav-item">
            <Link to="#">Recursos <FontAwesomeIcon icon={faChevronDown} /></Link>
          </div>
          <div className="nav-item">
            <Link to="/pricing">Precios</Link>
          </div>
        </nav>
        <div className="auth-buttons">
          <Link to="/login" className="btn-login">Iniciar Sesión</Link>
          <Link to="/pricing" className="btn-register">Registrarse</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
