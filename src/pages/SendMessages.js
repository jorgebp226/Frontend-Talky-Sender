import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import GlobalStyle from '../styles/GlobalStyle';
import MessageForm from '../components/MessageForm';
import ImageUploader from '../components/ImageUploader';
import ContactsUploader from '../components/ContactsUploader';
import ProgressBar from '../components/ProgressBar';
import ConfirmationModal from '../components/ConfirmationModal';

const AppWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
`;

const ButtonContainerWrapper = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background-color: ${props => {
    if (props.isSending && !props.isPaused) return '#ef4444';
    if (props.isPaused) return '#3b82f6';
    if (props.isProcessing) return '#cfe2ff'; // Azul claro cuando se está procesando
    return '#3b82f6';
  }};
  color: ${props => (props.isProcessing ? '#000' : 'white')}; // Texto negro cuando se está procesando
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  pointer-events: ${props => (props.isProcessing ? 'none' : 'auto')}; // Desactivar el botón cuando se está procesando

  &:hover {
    background-color: ${props => {
      if (props.isSending && !props.isPaused) return '#f87171';
      if (props.isPaused) return '#60a5fa';
      if (props.isProcessing) return '#cfe2ff'; // No cambiar color al pasar el cursor cuando se está procesando
      return '#60a5fa';
    }};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const TooltipLogoContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Tooltip = styled.div`
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 15px 10px;
  position: absolute;
  z-index: 1000;
  left: 120%;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    margin-top: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent #555 transparent transparent;
  }

  ${TooltipLogoContainer}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const LogoImage = styled.img`
  width: 150px;
  height: auto;
`;

const ErrorMessage = styled.div`
  background-color: #ffcccc;
  color: #cc0000;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
  text-align: center;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  margin-left: 20px;
`;

function SendMessages() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [csvData, setCsvData] = useState(null); // Ahora es una cadena CSV
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const calculateTotalTime = (csvData) => {
    const numRows = csvData.split('\n').length - 1; // Restar encabezados
    return 9 * numRows;
  };

  const startProgress = (totalTime, initialProgress = 0) => {
    let timeElapsed = (initialProgress / 100) * totalTime;

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        timeElapsed += 1;
        const percentage = (timeElapsed / totalTime) * 100;
        const timeRemaining = (totalTime - timeElapsed) / 60;
        setProgress(percentage);
        setTimeLeft(timeRemaining);

        if (timeElapsed >= totalTime) {
          clearInterval(intervalRef.current);
          setIsSending(false);
          navigate({
            pathname: '/resumen',
            state: {
              horaEnvio: new Date().toLocaleTimeString(),
              numMensajes: numRows
            }
          });
        }
      }
    }, 1000);
  };

  const handleAction = async () => {
    if (!isSending) {
      if (!message || !csvData) {
        setErrorMessage('Por favor, completa el mensaje y sube contactos válidos.');
        return;
      }
      setErrorMessage('');
      setIsProcessing(true);
    
      try {
        const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
        if (!userAttributes || !userAttributes.sub) {
          throw new Error("userAttributes no encontrados o 'sub' no disponible en localStorage");
        }
        const userId = userAttributes.sub;

        const payload = {
          mensaje: message,
          imagen: image,
          csv_data: csvData, // Ahora es una cadena CSV
          user_id: userId
        };
        
        console.log('Datos enviados a la API:', payload);
    
        const response = await axios.post('https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/procesar', payload, {
          timeout: 60000
        });
    
        if (response.status === 200) {
          console.log(response.data);
          console.log('userId before API call:', userId);
          await axios.post(`https://mpwzmn3v75.execute-api.eu-west-3.amazonaws.com/qr/putstep?user_id=${userId}`, 
            {},  // Empty body
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          // Empezar el progreso después de la respuesta del servidor
          setIsSending(true);
          const totalTime = calculateTotalTime(csvData);
          setTimeLeft(totalTime / 60);
          startProgress(totalTime);
        } else if (response.status === 400) {
          const { error } = response.data;
          setErrorMessage(`${error}. Contacta con nosotros en info@betalky.com`);
          setIsSending(false);
        }
      } catch (error) {
        console.error('Error al enviar los mensajes:', error);
        console.error('Detalles del error:', error.response?.data);
        setErrorMessage(`Error al enviar los mensajes: ${error.response?.data?.error || error.message}. Contacta con nosotros en info@betalky.com`);
        setIsSending(false);
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (isPaused) {
        setIsResuming(true);
      }
      setConfirmationMessage(isPaused ? '¿Estás seguro que quieres reanudar los envíos?' : '¿Estás seguro que quieres pausar los envíos?');
      setShowConfirmation(true);
    }
  };

  const confirmPauseResume = async () => {
    setShowConfirmation(false);

    try {
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes.sub;

      if (!isPaused) {
        const response = await axios.post('https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/pausarex', {
          user_id: userId
        }, {
          timeout: 60000
        });
        if (response.status === 200) {
          setIsPaused(true);
          clearInterval(intervalRef.current);
        }
      } else {
        const response = await axios.post('https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/reanudar', {
          mensaje: message,
          imagen: image,
          csv_data: csvData,
          user_id: userId
        }, {
          timeout: 60000
        });

        if (response.status === 200) {
          setIsPaused(false);
          const totalTime = calculateTotalTime(csvData);
          startProgress(totalTime, progress); // Reanudar desde el progreso actual
        }
      }
    } catch (error) {
      console.error('Error al pausar/reanudar el envío:', error);
      alert(`Error al pausar/reanudar el envío: ${error.message}`);
    } finally {
      setIsResuming(false);
    }
  };

  const cancelPauseResume = () => {
    setShowConfirmation(false);
    setIsResuming(false);
  };

  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
    } else if (isSending && !isPaused) {
      const totalTime = calculateTotalTime(csvData);
      startProgress(totalTime, progress); // Continuar desde el progreso actual
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const closeErrorMessage = () => {
    setErrorMessage('');
  };

  const isButtonDisabled = (!isSending && (message.length === 0 || !csvData)) || isResuming || isProcessing;

  return (
    <>
      <GlobalStyle />
      <TooltipLogoContainer onClick={() => navigate('/dashboard')}>
        <LogoImage src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" />
        <Tooltip className="tooltip">Inicio</Tooltip>
      </TooltipLogoContainer>
      <AppWrapper>
        {errorMessage && (
          <ErrorMessage>
            {errorMessage}
            <CloseButton onClick={closeErrorMessage}>&times;</CloseButton>
          </ErrorMessage>
        )}
        <MessageForm setMessage={setMessage} />
        <ImageUploader setImage={setImage} />
        <ContactsUploader setCsvData={setCsvData} />
        <ButtonContainerWrapper>
          {isSending && (
            <ProgressBar
              percentage={progress}
              timeLeft={timeLeft}
              onPauseClick={handleAction}
              isPaused={isPaused}
              isSending={isSending}
              isResuming={isResuming}
            />
          )}
          {!isSending && (
            <ButtonContainer>
              <ActionButton
                onClick={handleAction}
                disabled={isButtonDisabled}
                isSending={isSending}
                isPaused={isPaused}
                isProcessing={isProcessing}
              >
                {isProcessing ? 'Procesando Envío' : 'Enviar Mensaje'}
              </ActionButton>
            </ButtonContainer>
          )}
        </ButtonContainerWrapper>
        {showConfirmation && (
          <ConfirmationModal
            message={confirmationMessage}
            onConfirm={confirmPauseResume}
            onCancel={cancelPauseResume}
          />
        )}
      </AppWrapper>
    </>
  );
}

export default SendMessages;
