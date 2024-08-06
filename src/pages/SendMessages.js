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
import * as XLSX from 'xlsx';

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
    if (props.isProcessing) return '#cfe2ff';
    return '#3b82f6';
  }};
  color: ${props => (props.isProcessing ? '#000' : 'white')};
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  pointer-events: ${props => (props.isProcessing ? 'none' : 'auto')};

  &:hover {
    background-color: ${props => {
      if (props.isSending && !props.isPaused) return '#f87171';
      if (props.isPaused) return '#60a5fa';
      if (props.isProcessing) return '#cfe2ff';
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
  const [csvFile, setCsvFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
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

  

  const calculateTotalTime = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        let numRows;
        
        if (file.name.endsWith('.csv')) {
          // For CSV files
          const csvData = e.target.result;
          numRows = csvData.split('\n').length;
        } else if (file.name.endsWith('.xlsx') || file.name.endswith('.xls')) {
          // For Excel files
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, {type: 'array'});
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          numRows = jsonData.length;
        } else {
          reject(new Error('Unsupported file format'));
          return;
        }
        
        resolve(9 * numRows);
      };
      
      reader.onerror = (error) => reject(error);
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
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
          const numMensajes = csvFile ? csvFile.size : 0; // Usamos el tamaño del archivo como aproximación
          navigate('/resumen', {
            state: {
              horaEnvio: new Date().toLocaleTimeString(),
              numMensajes: numMensajes
            }
          });
        }
      }
    }, 1000);
  };

  const handleAction = async () => {
    if (!isSending) {
      if (!message || !csvFile) {
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

        const formData = new FormData();
        formData.append('mensaje', message);
        formData.append('file', csvFile);
        if (imageFile) {
          formData.append('imagen', imageFile);
        }
        formData.append('user_id', userId);
        
        console.log('Datos enviados a la API:', formData);
    
        const response = await axios.post('https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/procesar', formData, {
          timeout: 60000,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
    
        if (response.status === 200) {
          console.log(response.data);
          console.log('userId before API call:', userId);
          await axios.post(`https://mpwzmn3v75.execute-api.eu-west-3.amazonaws.com/qr/putstep?user_id=${userId}`, 
            {},
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          setIsSending(true);
          const totalTime = calculateTotalTime(csvFile);
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
          imagen: imageFile ? await convertImageToBase64(imageFile) : null,
          csv_data: await readFileAsText(csvFile),
          user_id: userId
        }, {
          timeout: 60000
        });

        if (response.status === 200) {
          setIsPaused(false);
          const totalTime = calculateTotalTime(await readFileAsText(csvFile));
          startProgress(totalTime, progress);
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
      const totalTime = calculateTotalTime(csvFile);
      startProgress(totalTime, progress);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const closeErrorMessage = () => {
    setErrorMessage('');
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const isButtonDisabled = (!isSending && (message.length === 0 || !csvFile)) || isResuming || isProcessing;

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
        <ImageUploader setImageFile={setImageFile} />
        <ContactsUploader setCsvFile={setCsvFile} />
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