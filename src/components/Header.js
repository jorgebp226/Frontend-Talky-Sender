import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isAuthenticated }) => (
  <header>
    <nav>
      <Link to="/">Home</Link>
      {isAuthenticated ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/send-messages">Send Messages</Link>
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <>
          <Link to="/login">Iniciar Sesión</Link>
          <Link to="/register">Registrarse</Link>
        </>
      )}
    </nav>
  </header>
);

export default Header;

