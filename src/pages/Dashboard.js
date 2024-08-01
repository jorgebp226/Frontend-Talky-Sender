import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [qrStatusUrl, setQrStatusUrl] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [isQRScanned, setIsQRScanned] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [step1QR, setStep1QR] = useState(0);
  const [step2Message, setStep2Message] = useState(0);
  const [qrUpdateCounter, setQrUpdateCounter] = useState(0);

  const handleSignOutClick = () => {
    navigate('/signout');
  };

  const toggleStep = (step) => {
    setActiveStep(activeStep === step ? null : step);
  };

  const fetchQrUrl = async () => {
    try {
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes.sub;

      const response = await axios.post('https://mpwzmn3v75.execute-api.eu-west-3.amazonaws.com/qr/qr', {
        user_id: userId
      });

      if (response.data) {
        setQrUrl(response.data.qrUrl);
        setQrStatusUrl(response.data.qrStatusUrl);
        fetchQrImage(response.data.qrUrl);
      }
    } catch (error) {
      console.error('Error fetching QR URL:', error);
    }
  };

  const fetchQrImage = async (url) => {
    try {
      const response = await axios.post('https://8ur045ja3e.execute-api.eu-west-3.amazonaws.com/dashboard/qr', {
        qr_url: url
      });
      if (response.data && response.data.qr_image) {
        setQrImage(`data:image/png;base64,${response.data.qr_image}`);
      }
    } catch (error) {
      console.error('Error fetching QR image:', error);
    }
  };

  const checkCredentialsStatus = async () => {
    try {
      if (!qrStatusUrl) return;

      const response = await axios.post('https://8ur045ja3e.execute-api.eu-west-3.amazonaws.com/dashboard/status', {
        status_url: qrStatusUrl
      });
      if (response.data && response.data.isQRScanned) {
        setIsQRScanned(true);
        setStep1QR(1); // Asegúrate de que step1QR se establezca en 1 si el QR está escaneado
        updateStepsCompleted();
      }
    } catch (error) {
      console.error('Error checking credentials status:', error);
    }
  };

  const fetchCompletionStatus = async () => {
    try {
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes.sub;

      const response = await axios.get(`https://mpwzmn3v75.execute-api.eu-west-3.amazonaws.com/qr/steps?userId=${userId}`);
      if (response.data) {
        setStep1QR(response.data.step1QR);
        setStep2Message(response.data.step2message);
        updateStepsCompleted();
        
        if (response.data.step1QR === 0) {
          setActiveStep('phone');
        } else if (response.data.step2message === 0) {
          setActiveStep('message');
        } else {
          setActiveStep('schedule');
        }
      }
    } catch (error) {
      console.error('Error fetching completion status:', error);
    }
  };

  const updateStepsCompleted = () => {
    let completedSteps = 0;
    if (step1QR !== 0) completedSteps += 1;
    if (step2Message !== 0) completedSteps += 1;
    setStepsCompleted(completedSteps);
  };

  useEffect(() => {
    fetchCompletionStatus();
  }, []);

  useEffect(() => {
    if (activeStep === 'phone') {
      fetchQrUrl();

      const qrIntervalId = setInterval(() => {
        setQrUpdateCounter(prevCounter => prevCounter + 1);
        fetchQrUrl();
      }, 6000);

      const statusIntervalId = setInterval(checkCredentialsStatus, 5000);

      return () => {
        clearInterval(qrIntervalId);
        clearInterval(statusIntervalId);
      };
    }
  }, [activeStep, qrStatusUrl]);

  const getStrokeDashoffset = () => {
    const totalSteps = 3;
    const circumference = 2 * Math.PI * 33;
    return circumference - (stepsCompleted / totalSteps) * circumference;
  };

  const moveToNextStep = () => {
    if (activeStep === 'phone') {
      setActiveStep('message');
    } else if (activeStep === 'message') {
      setActiveStep('schedule');
    }
  };

  const handleSendMessagesClick = (event) => {
    if (step1QR === 0) {
      event.preventDefault();
      setActiveStep('phone');
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Talky Logo" />
        </div>
        <Link 
          to={step1QR === 1 ? "/send-messages" : "#"} 
          className="quick-action-button"
          onClick={handleSendMessagesClick}
        >
          <img src={`${process.env.PUBLIC_URL}/paper-plane.png`} alt="Enviar Mensajes Icono" />
          Enviar Mensajes
        </Link>
        <div className="coming-soon">
          <span>Proximamente...</span>
          <div className="tooltip-container">
            <span className="info-icon">i</span>
            <div className="tooltip">Estas funcionalidades saldrán pronto</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/public">
            <img src={`${process.env.PUBLIC_URL}/public.png`} alt="Público Icono" />
            Público
          </Link>
          <Link to="/analysis">
            <img src={`${process.env.PUBLIC_URL}/analysis.png`} alt="Análisis Icono" />
            Análisis
          </Link>
          <Link to="/automations">
            <img src={`${process.env.PUBLIC_URL}/automations.png`} alt="Automatizaciones Icono" />
            Automatizaciones
          </Link>
          <Link to="/ai-marketing">
            <img src={`${process.env.PUBLIC_URL}/IA.png`} alt="Marketing IA Icono" />
            Marketing IA
          </Link>
          <Link to="/chatbot">
            <img src={`${process.env.PUBLIC_URL}/Talkylogo1.png`} alt="Chatbot Icono" />
            Chatbot
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header-dashboard">
          <h1>Inicio</h1>
          <div className="user-profile">
            <img 
              src={`${process.env.PUBLIC_URL}/account.png`} 
              alt="Profile" 
              className="user-profile-image"
              onClick={handleSignOutClick}
            />
          </div>
        </header>
        <section className="first-shipment">
          <div className="first-shipment-inner">
              <div className="first-shipment-header">
                <div>
                  <h2 className="first-shipment-title">Prepara todo para tu primer envío</h2>
                  <p className="shipment-description">Pasos siguientes recomendados según tu perfil...</p>
                </div>
                <div className="steps-progress">
                  <svg aria-hidden="true" height="74" role="presentation" width="74">
                    <circle cx="37" cy="37" fill="transparent" r="33" stroke="#DBD9D2" strokeWidth="2"></circle>
                    <circle 
                      className="highlight" 
                      cx="37" 
                      cy="37" 
                      fill="transparent" 
                      r="33" 
                      stroke="#241C15" 
                      strokeDasharray="207.34511513692635 207.34511513692635" 
                      strokeWidth="4" 
                      style={{ strokeDashoffset: getStrokeDashoffset() }}>
                    </circle>
                  </svg>
                  <span>{stepsCompleted}/3</span>
                </div>
              </div>
              <div className="shipment-steps">
                <div className="shipment-step">
                  <div className="step-header" onClick={() => toggleStep('phone')}>
                    <span className={step1QR === 1 ? 'completed-step' : ''}>
                      Conecta tu número de teléfono
                      {step1QR === 1 && <img src={`${process.env.PUBLIC_URL}/check-mark.png`} alt="Completed" className="completed-icon" />}
                    </span>
                    <span className={`arrow ${activeStep === 'phone' ? 'active' : ''}`}>▼</span>
                  </div>
                  <div className={`step-content ${activeStep === 'phone' ? 'active' : ''}`}>
                    <div className="phone-step-content">
                      <h3 className="title-roboto">Utiliza tu cuenta de WhatsApp o WhatsApp Business para enviar mensajes</h3>
                      <div className="whatsapp-image-container">
                        <div className="whatsapp-instructions">
                          <p>Escanea el QR desde la cuenta de WhatsApp que quieres usar para enviar mensajes a tus clientes.</p>
                          <ol>
                            <li>Abre WhatsApp en tu teléfono.</li>
                            <li>Toca <strong>Menú <span className="x1rg5ohu x16dsc37"><svg height="18px" viewBox="0 0 24 24" width="18px"><rect fill="#f2f2f2" height="24" rx="3" width="24"></rect><path d="m12 15.5c.825 0 1.5.675 1.5 1.5s-.675 1.5-1.5 1.5-1.5-.675-1.5-1.5.675-1.5 1.5-1.5zm0-2c-.825 0-1.5-.675-1.5-1.5s.675-1.5 1.5-1.5 1.5.675 1.5 1.5-.675 1.5-1.5 1.5zm0-5c-.825 0-1.5-.675-1.5-1.5s.675-1.5 1.5-1.5 1.5.675 1.5 1.5-.675 1.5-1.5 1.5z" fill="#818b90"></path></svg></span></strong> en Android o <strong>Ajustes <span className="x1rg5ohu x16dsc37"><svg width="18" height="18" viewBox="0 0 24 24"><rect fill="#F2F2F2" width="24" height="24" rx="3"></rect><path d="M12 18.69c-1.08 0-2.1-.25-2.99-.71L11.43 14c.24.06.4.08.56.08.92 0 1.67-.59 1.99-1.59h4.62c-.26 3.49-3.05 6.2-6.6 6.2zm-1.04-6.67c0-.57.48-1.02 1.03-1.02.57 0 1.05.45 1.05 1.02 0 .57-.47 1.03-1.05 1.03-.54.01-1.03-.46-1.03-1.03zM5.4 12c0-2.29 1.08-4.28 2.78-5.49l2.39 4.08c-.42.42-.64.91-.64 1.44 0 .52.21 1 .65 1.44l-2.44 4C6.47 16.26 5.4 14.27 5.4 12zm8.57-.49c-.33-.97-1.08-1.54-1.99-1.54-.16 0-.32.02-.57.08L9.04 5.99c.89-.44 1.89-.69 2.96-.69 3.56 0 6.36 2.72 6.59 6.21h-4.62zM12 19.8c.22 0 .42-.02.65-.04l.44.84c.08.18.25.27.47.24.21-.03.33-.17.36-.38l.14-.93c.41-.11.82-.27 1.21-.44l.69.61c.15.15.33.17.54.07.17-.1.24-.27.2-.48l-.2-.92c.35-.24.69-.52.99-.82l.86.36c.2.08.37.05.53-.14.14-.15.15-.34.03-.52l-.5-.8c.25-.35.45-.73.63-1.12l.95.05c.21.01.37-.09.44-.29.07-.2.01-.38-.16-.51l-.73-.58c.1-.4.19-.83.22-1.27l.89-.28c.2-.07.31-.22.31-.43s-.11-.35-.31-.42l-.89-.28c-.03-.44-.12-.86-.22-1.27l.73-.59c.16-.12.22-.29.16-.5-.07-.2-.23-.31-.44-.29l-.95.04c-.18-.4-.39-.77-.63-1.12l.5-.8c.12-.17.1-.36-.03-.51-.16-.18-.33-.22-.53-.14l-.86.35c-.31-.3-.65-.58-.99-.82l.2-.91c.03-.22-.03-.4-.2-.49-.18-.1-.34-.09-.48.01l-.74.66c-.39-.18-.8-.32-1.21-.43l-.14-.93a.426.426 0 00-.36-.39c-.22-.03-.39.05-.47.22l-.44.84-.43-.02h-.22c-.22 0-.42.01-.65.03l-.44-.84c-.08-.17-.25-.25-.48-.22-.2.03-.33.17-.36.39l-.13.88c-.42.12-.83.26-1.22.44l-.69-.61c-.15-.15-.33-.17-.53-.06-.18.09-.24.26-.2.49l.2.91c-.36.24-.7.52-1 .82l-.86-.35c-.19-.09-.37-.05-.52.13-.14.15-.16.34-.04.51l.5.8c-.25.35-.45.72-.64 1.12l-.94-.04c-.21-.01-.37.1-.44.3-.07.2-.02.38.16.5l.73.59c-.1.41-.19.83-.22 1.27l-.89.29c-.21.07-.31.21-.31.42 0 .22.1.36.31.43l.89.28c.03.44.1.87.22 1.27l-.73.58c-.17.12-.22.31-.16.51.07.2.23.31.44.29l.94-.05c.18.39.39.77.63 1.12l-.5.8c-.12.18-.1.37.04.52.16.18.33.22.52.14l.86-.36c.3.31.64.58.99.82l-.2.92c-.04.22.03.39.2.49.2.1.38.08.54-.07l.69-.61c.39.17.8.33 1.21.44l.13.93c.03.21.16.35.37.39.22.03.39-.06.47-.24l.44-.84c.23.02.44.04.66.04z" fill="#818b90"></path></svg></span></strong> en iPhone.</li>
                            <li>Toca <strong>Dispositivos vinculados</strong> y, luego, <strong>Vincular un dispositivo</strong>.</li>
                            <li>Apunta tu teléfono hacia esta pantalla para escanear el código QR.</li>
                          </ol>
                          {activeStep === 'phone' && qrImage && !isQRScanned ? (
                            <img 
                              src={qrImage}
                              alt="QR Code" 
                              className="qr-code" 
                              key={qrUpdateCounter}
                            />
                          ) : isQRScanned ? (
                            <>
                              <div className="success-message">
                                <img src={`${process.env.PUBLIC_URL}/check-mark.png`} alt="Success" />
                                <span>Todo listo!</span>
                              </div>
                              <button onClick={moveToNextStep} className="next-step">Vamos a por el siguiente paso</button>
                            </>
                          ) : (
                            <p>Cargando QR...</p>
                          )}
                        </div>
                        <img src={`${process.env.PUBLIC_URL}/desplegable1.png`} alt="WhatsApp Screenshot" className="whatsapp-screenshot"/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shipment-step">
                  <div className="step-header" onClick={() => toggleStep('message')}>
                    <span className={step2Message >= 1  ? 'completed-step' : ''}>
                      Escribe tu primer mensaje
                      {step2Message >= 1 && <img src={`${process.env.PUBLIC_URL}/check-mark.png`} alt="Completed" className="completed-icon" />}
                    </span>
                    <span className={`arrow ${activeStep === 'message' ? 'active' : ''}`}>▼</span>
                  </div>
                  <div className={`step-content ${activeStep === 'message' ? 'active' : ''}`}>
                    <div className="message-step-content">
                      <h3 className="title-roboto">Envía WhatsApps personalizados a todos tus contactos con solo un clic</h3>
                      <div className="whatsapp-image-container">
                        <div className="whatsapp-instructions">
                          <p>Optimiza tu marketing con WhatsApps personalizados. Segmenta audiencias, adapta mensajes y envía ofertas directamente.</p>
                          {step2Message === 0 ? (
                            <Link 
                              to={step1QR === 1 ? "/send-messages" : "#"} 
                              className="quick-action-button2"
                              onClick={handleSendMessagesClick}
                            >
                              Enviar Mensajes
                            </Link>
                          ) : (
                            <>
                              <div className="success-message">
                                <img src={`${process.env.PUBLIC_URL}/check-mark.png`} alt="Success" />
                                <span>Primer mensaje enviado con éxito!</span>
                              </div>
                              <button onClick={moveToNextStep} className="next-step">Vamos a por el siguiente paso</button>
                            </>
                          )}
                        </div>
                        <img src={`${process.env.PUBLIC_URL}/desplegable2.png`} alt="Enviar Mensajes" className="whatsapp-screenshot2"/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shipment-step">
                  <div className="step-header" onClick={() => toggleStep('schedule')}>
                    <span>Programa un envío</span>
                    <span className={`arrow ${activeStep === 'schedule' ? 'active' : ''}`}>▼</span>
                  </div>
                  <div className={`step-content ${activeStep === 'schedule' ? 'active' : ''}`}>
                    <div className="schedule-step-content">
                      <h3 className="title-roboto">Automatiza tus envíos de WhatsApp y olvídate de las preocupaciones</h3>
                      <div className="whatsapp-image-container">
                        <div className="whatsapp-instructions3">
                          <p>No te compliques con los envíos de WhatsApp. Programa el envío, elige el horario y nosotros hacemos el resto. Tu comunicación, siempre puntual y segura.</p>
                          <button className="quick-action-button2">Proximamente...</button>
                        </div>
                        <img src={`${process.env.PUBLIC_URL}/Desplegable3.png`} alt="Programar un Envío" className="whatsapp-screenshot3"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        <section className="quick-actions">
          <div className="coming-soon-text">Proximamente...</div>
          <h2>Acciones rápidas</h2>
          <div className="quick-actions-buttons">
            <button>
              <img src={`${process.env.PUBLIC_URL}/add-user.png`} alt="Importar Contactos" />
              Importar Contactos
            </button>
            <button>
              <img src={`${process.env.PUBLIC_URL}/calendar.png`} alt="Programar un envío" />
              Programar un envío
            </button>
            <button onClick={handleSendMessagesClick}>
              <img src={`${process.env.PUBLIC_URL}/send1.png`} alt="Envío Rápido" />
              Envío Rápido
            </button>
          </div>
        </section>
        <section className="performance">
          <h2>Rendimiento envíos</h2>
          <div className="performance-item-container">
            <div className="performance-item">
              <img src={`${process.env.PUBLIC_URL}/iconotalky.png`} alt="Mensajes enviados Icono" />
              <span>Mensajes enviados</span>
              <strong>300</strong>
            </div>
            <div className="performance-item">
              <img src={`${process.env.PUBLIC_URL}/iconotalky.png`} alt="Número de respuestas Icono" />
              <span>Número de respuestas</span>
              <strong>150</strong>
            </div>
            <div className="performance-item">
              <img src={`${process.env.PUBLIC_URL}/iconotalky.png`} alt="Sentimiento general Icono" />
              <span>Sentimiento general</span>
              <strong>70%/</strong>
            </div>
          </div>
        </section>
          <section className="income">
            <h2>Ingresos</h2>
            <div className="income-content">
              <p>Conecta para ver tus ingresos</p>
              <div className="income-buttons-container">
                <button className="income-button shopify-button">
                  <img src={`${process.env.PUBLIC_URL}/shopify.png`} alt="Shopify" />
                  Shopify
                </button>
                <button className="income-button fourvenues-button">
                  <img src={`${process.env.PUBLIC_URL}/fourvenues.png`} alt="Fourvenues" />
                  Fourvenues
                </button>
              </div>
            </div>
          </section>
      </main>
    </div>
  );
};

export default Dashboard;
