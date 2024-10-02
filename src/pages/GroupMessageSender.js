// GroupMessageSender.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar'; // Asegúrate de tener este componente
import ConfirmationModal from '../components/ConfirmationModal'; // Asegúrate de tener este componente
import MessageForm from '../components/MessageForm'; // Asegúrate de tener este componente
import ImageUploader from '../components/ImageUploader'; // Asegúrate de tener este componente
import './GroupMessageSender.css'; // Archivo CSS correspondiente

function GroupMessageSender() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes?.sub;

      try {
        const response = await axios.get(
          'https://your-api-url.com/groups', // Reemplaza con tu URL real
          {
            params: { user_id: userId },
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setGroups(response.data);
          setFilteredGroups(response.data);
        } else {
          setGroups([]);
          setFilteredGroups([]);
        }
      } catch (error) {
        console.error('Error al obtener los grupos:', error);
        setGroups([]);
        setFilteredGroups([]);
      }
    };

    fetchGroups();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredGroups(groups.filter(group => group.name.toLowerCase().includes(term)));
  };

  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.some(selected => selected.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter(selected => selected.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const calculateTotalTime = (numContacts) => numContacts * 10; // 10 segundos por contacto

  const startProgress = (totalTime, initialProgress = 0) => {
    let timeElapsed = (initialProgress / 100) * totalTime;

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        timeElapsed += 1;
        const percentage = (timeElapsed / totalTime) * 100;
        const timeRemaining = (totalTime - timeElapsed) / 60;
        setProgress(percentage);
        setTimeLeft(timeRemaining.toFixed(2));

        if (timeElapsed >= totalTime) {
          clearInterval(intervalRef.current);
          setIsSending(false);
          navigate('/resumen-envio', {
            state: {
              horaEnvio: new Date().toLocaleTimeString(),
              numMensajes: csvData.split('\n').length - 1
            }
          });
        }
      }
    }, 1000);
  };

  const generateCsvData = (phoneNumbers) => {
    let csv = 'Nombre;Teléfono\n';
    phoneNumbers.forEach(phone => {
      csv += `,${phone}\n`; // Nombre vacío, solo número
    });
    return csv;
  };

  const handleAction = async () => {
    if (!isSending) {
      if (!message || selectedGroups.length === 0) {
        setErrorMessage('Debes escribir un mensaje y seleccionar al menos un grupo.');
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
        const groupIds = selectedGroups.map(group => group.id);

        const contactsResponse = await axios.post(
          'https://940bsd6v9a.execute-api.eu-west-3.amazonaws.com/groups/get_members', // Reemplaza con tu URL real
          {
            user_id: userId,
            groupIds: groupIds,
          }
        );

        if (contactsResponse.status === 200) {
          const phoneNumbers = contactsResponse.data.phoneNumbers;
          if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
            throw new Error('Formato de respuesta inválido: phoneNumbers no está presente o no es una matriz.');
          }

          const generatedCsvData = generateCsvData(phoneNumbers);
          setCsvData(generatedCsvData);

          const payload = {
            mensaje: message,
            imagen: image,
            csv_data: generatedCsvData,
            user_id: userId,
          };

          const response = await axios.post(
            'https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/procesar', // Reemplaza con tu URL real
            payload,
            {
              timeout: 60000,
            }
          );

          if (response.status === 200) {
            setIsSending(true);
            const totalTime = calculateTotalTime(phoneNumbers.length);
            setTimeLeft((totalTime / 60).toFixed(2));
            startProgress(totalTime);
          } else if (response.status === 400) {
            const { error } = response.data;
            setErrorMessage(`${error}. Contacta con nosotros en info@betalky.com`);
            setIsSending(false);
          }
        } else {
          console.error('Error al obtener los contactos de los grupos.');
          setErrorMessage('Error al obtener los contactos de los grupos.');
        }
      } catch (error) {
        console.error('Error en el proceso de envío de mensajes:', error);
        setErrorMessage(`Error al enviar los mensajes: ${error.response?.data?.error || error.message}`);
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
        // Pausar
        const response = await axios.post(
          'https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/pausarex', // Reemplaza con tu URL real
          {
            user_id: userId
          },
          {
            timeout: 60000
          }
        );
        if (response.status === 200) {
          setIsPaused(true);
          clearInterval(intervalRef.current);
        }
      } else {
        // Reanudar
        const response = await axios.post(
          'https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/reanudar', // Reemplaza con tu URL real
          {
            mensaje: message,
            imagen: image,
            csv_data: csvData,
            user_id: userId
          },
          {
            timeout: 60000
          }
        );

        if (response.status === 200) {
          setIsPaused(false);
          const numContacts = csvData.split('\n').length - 1;
          const totalTime = calculateTotalTime(numContacts);
          setTimeLeft((totalTime / 60).toFixed(2));
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
      const numContacts = csvData.split('\n').length - 1;
      const totalTime = calculateTotalTime(numContacts);
      startProgress(totalTime, progress);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const closeErrorMessage = () => {
    setErrorMessage('');
  };

  const isButtonDisabled = (!isSending && (message.trim().length === 0 || selectedGroups.length === 0)) || isResuming || isProcessing;

  return (
    <div className="group-message-sender-container">
      <h2>Envío de Mensajes a Grupos</h2>
      <MessageForm setMessage={setMessage} />
      <ImageUploader setImage={setImage} />

      <div className="dropdown-container">
        <input
          type="text"
          placeholder="Buscar grupos..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="dropdown-list">
          {filteredGroups.map(group => {
            const isSelected = selectedGroups.some(selected => selected.id === group.id);
            return (
              <div
                key={group.id}
                className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleGroupSelection(group)}
              >
                {group.name}
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button onClick={closeErrorMessage} className="close-button">&times;</button>
        </div>
      )}

      <button onClick={handleAction} disabled={isButtonDisabled}>
        {isProcessing ? 'Procesando...' : isSending ? (isPaused ? 'Reanudar' : 'Pausar') : 'Enviar Mensaje'}
      </button>

      {isSending && (
        <div className="progress-bar-container">
          <ProgressBar
            percentage={progress}
            timeLeft={timeLeft}
            onPauseClick={handleAction}
            isPaused={isPaused}
          />
        </div>
      )}

      {showConfirmation && (
        <ConfirmationModal
          message={confirmationMessage}
          onConfirm={confirmPauseResume}
          onCancel={cancelPauseResume}
        />
      )}
    </div>
  );
}

export default GroupMessageSender;
