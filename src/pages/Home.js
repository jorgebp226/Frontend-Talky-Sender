import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Header from '../components/Header2';

function Home() {
  return (
    <div className="home-container">
      <Header />
      <main className="main-content-home">
        <h1 className="title">Convierte los WhatsApp en ingresos</h1>
        <p className="description">
          Descubre la plataforma de mensajería con la mayor tasa de apertura y conversión.
          Con Talky Sender, envía mensajes personalizados de manera sencilla y eficiente desde
          tu propia cuenta de WhatsApp.
        </p>
        <Link to="/pricing" className="btn-try">Prueba Talky Sender</Link>
      </main>
    </div>
  );
}

export default Home;