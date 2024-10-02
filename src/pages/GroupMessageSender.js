// GroupMessageSender.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import ConfirmationModal from '../components/ConfirmationModal';
import MessageForm from '../components/MessageForm';
import ImageUploader from '../components/ImageUploader';
import './GroupMessageSender.css'; // Asegúrate de que este archivo exista

function GroupMessageSender() {
  // Estados para gestionar el mensaje, imagen y grupos
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  
  // Estados para gestionar los contactos y el CSV
  const [csvData, setCsvData] = useState(null);
  const [numPhoneNumbers, setNumPhoneNumbers] = useState(0);
  const [isFetchingContacts, setIsFetchingContacts] = useState(false);
  
  // Estados para gestionar el envío de mensajes
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  
  // Estados para la barra de progreso y tiempos
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Estados para manejar modales y mensajes de error
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado para la búsqueda de grupos
  const [searchTerm, setSearchTerm] = useState('');
  
  // Referencia para el intervalo de la barra de progreso
  const intervalRef = useRef(null);
  
  // Hook para la navegación
  const navigate = useNavigate();

  // Efecto para obtener los grupos desde la API al montar el componente
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userAttributesStr = localStorage.getItem('userAttributes');
        if (!userAttributesStr) {
          console.error('User attributes not found in localStorage');
          setErrorMessage('No se encontraron atributos de usuario. Por favor, inicia sesión nuevamente.');
          return;
        }
        const userAttributes = JSON.parse(userAttributesStr);
        const userId = userAttributes?.sub;
        if (!userId) {
          console.error('User ID not found in localStorage');
          setErrorMessage('No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
          return;
        }

        const response = await axios.get(
          'https://42zzu49wqg.execute-api.eu-west-3.amazonaws.com/whats/gupos', // Reemplaza con tu URL real
          {
            params: { user_id: userId },
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setGroups(response.data);
          setFilteredGroups(response.data);
        } else {
          console.error('Error: La respuesta de la API no contiene un array válido.');
          setGroups([]);
          setFilteredGroups([]);
          setErrorMessage('Error al obtener los grupos.');
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
        setFilteredGroups([]);
        setErrorMessage('Error al obtener los grupos.');
      }
    };

    fetchGroups();
  }, []);

  // Efecto para filtrar los grupos según el término de búsqueda
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchTerm, groups]);

  // Función para alternar la selección de un grupo
  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.some(selected => selected.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter(selected => selected.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  // Función para manejar la búsqueda de grupos
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    // El filtrado se maneja en el useEffect
  };

  // Función para obtener contactos de los grupos seleccionados
  const handleFetchContacts = async () => {
    if (selectedGroups.length === 0) {
      setErrorMessage('Por favor, selecciona al menos un grupo.');
      return;
    }
    setErrorMessage('');
    setIsFetchingContacts(true);
    try {
      const userAttributesStr = localStorage.getItem('userAttributes');
      if (!userAttributesStr) {
        console.error('User attributes not found in localStorage');
        setErrorMessage('No se encontraron atributos de usuario. Por favor, inicia sesión nuevamente.');
        return;
      }
      const userAttributes = JSON.parse(userAttributesStr);
      const userId = userAttributes?.sub;
      if (!userId) {
        console.error('User ID not found in localStorage');
        setErrorMessage('No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

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
        setNumPhoneNumbers(phoneNumbers.length);
        // Opcional: Mostrar una notificación o mensaje
      } else {
        console.error('Error al obtener los contactos de los grupos.');
        setErrorMessage('Error al obtener los contactos de los grupos.');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setErrorMessage(`Error al obtener los contactos: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsFetchingContacts(false);
    }
  };

  // Función para generar datos CSV a partir de los números de teléfono
  const generateCsvData = (phoneNumbers) => {
    let csv = 'Nombre;Teléfono\n';
    phoneNumbers.forEach(phone => {
      csv += `,${phone}\n`; // Nombre vacío, solo número
    });
    return csv;
  };

  // Función para calcular el tiempo total basado en el número de contactos
  const calculateTotalTime = (numContacts) => numContacts * 10; // 10 segundos por contacto

  // Función para iniciar la barra de progreso
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
          navigate('/resumen-envio', {
            state: {
              horaEnvio: new Date().toLocaleTimeString(),
              numMensajes: numPhoneNumbers
            }
          });
        }
      }
    }, 1000);
  };

  // Función para manejar el envío de mensajes
  const handleSendMessages = async () => {
    if (!isSending) {
      if (!message || !csvData) {
        setErrorMessage('Debes escribir un mensaje y obtener los contactos antes de enviar.');
        return;
      }
      setErrorMessage('');
      setIsProcessing(true);

      try {
        const userAttributesStr = localStorage.getItem('userAttributes');
        if (!userAttributesStr) {
          console.error('User attributes not found in localStorage');
          setErrorMessage('No se encontraron atributos de usuario. Por favor, inicia sesión nuevamente.');
          return;
        }
        const userAttributes = JSON.parse(userAttributesStr);
        const userId = userAttributes?.sub;
        if (!userId) {
          console.error('User ID not found in localStorage');
          setErrorMessage('No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
          return;
        }

        const payload = {
          mensaje: message,
          imagen: image,
          csv_data: csvData,
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
          // Iniciar el progreso después de la respuesta del servidor
          setIsSending(true);
          const totalTime = calculateTotalTime(numPhoneNumbers);
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

  // Función para confirmar la pausa o reanudación
  const confirmPauseResume = async () => {
    setShowConfirmation(false);

    try {
      const userAttributesStr = localStorage.getItem('userAttributes');
      if (!userAttributesStr) {
        console.error('User attributes not found in localStorage');
        setErrorMessage('No se encontraron atributos de usuario. Por favor, inicia sesión nuevamente.');
        return;
      }
      const userAttributes = JSON.parse(userAttributesStr);
      const userId = userAttributes?.sub;
      if (!userId) {
        console.error('User ID not found in localStorage');
        setErrorMessage('No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (!isPaused) {
        // Pausar el envío
        const response = await axios.post('https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/pausarex', {
          user_id: userId
        }, {
          timeout: 60000
        });
        if (response.status === 200) {
          setIsPaused(true);
          clearInterval(intervalRef.current);
        } else {
          setErrorMessage('Error al pausar el envío de mensajes.');
        }
      } else {
        // Reanudar el envío
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
          const totalTime = calculateTotalTime(numPhoneNumbers);
          setTimeLeft(totalTime / 60);
          startProgress(totalTime, progress); // Reanudar desde el progreso actual
        } else {
          setErrorMessage('Error al reanudar el envío de mensajes.');
        }
      }
    } catch (error) {
      console.error('Error al pausar/reanudar el envío:', error);
      setErrorMessage(`Error al pausar/reanudar el envío: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsResuming(false);
    }
  };

  // Función para cancelar la pausa o reanudación
  const cancelPauseResume = () => {
    setShowConfirmation(false);
    setIsResuming(false);
  };

  // Efecto para limpiar el intervalo al desmontar el componente
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Efecto para manejar la pausa y reanudación del envío
  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
    } else if (isSending && !isPaused) {
      const totalTime = calculateTotalTime(numPhoneNumbers);
      startProgress(totalTime, progress);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  // Función para cerrar el mensaje de error
  const closeErrorMessage = () => {
    setErrorMessage('');
  };

  // Determinar si el botón de enviar está deshabilitado
  const isSendButtonDisabled = (!isSending && (message.trim().length === 0 || numPhoneNumbers === 0)) || isResuming || isProcessing;

  return (
    <div className="group-message-sender-container">
      <h2>Envío de Mensajes a Grupos</h2>
      
      {/* Selección de grupos */}
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
                <div className={`selection-circle ${isSelected ? 'selected-circle' : ''}`}></div>
                <span className="group-name">{group.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grupos seleccionados */}
      <div className="selected-groups-container">
        {selectedGroups.map(group => (
          <div key={group.id} className="selected-group">
            <span className="selected-group-name">{group.name}</span>
            <button className="remove-button" onClick={() => setSelectedGroups(selectedGroups.filter(g => g.id !== group.id))}>×</button>
          </div>
        ))}
      </div>

      {/* Botón para obtener contactos */}
      <div className="fetch-contacts-container">
        <button
          onClick={handleFetchContacts}
          disabled={isFetchingContacts || selectedGroups.length === 0}
          className="fetch-contacts-button"
        >
          {isFetchingContacts ? 'Obteniendo Contactos...' : 'Obtener Contactos'}
        </button>
      </div>

      {/* Resumen de contactos obtenidos */}
      {numPhoneNumbers > 0 && (
        <div className="contacts-summary">
          <p>Se han obtenido <strong>{numPhoneNumbers}</strong> números de teléfono de los grupos seleccionados.</p>
        </div>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button onClick={closeErrorMessage} className="close-button">&times;</button>
        </div>
      )}

      {/* Formulario para el mensaje y la imagen */}
      <MessageForm setMessage={setMessage} />
      <ImageUploader setImage={setImage} />

      {/* Botón para enviar mensajes */}
      <button
        onClick={handleSendMessages}
        disabled={isSendButtonDisabled}
        className="send-messages-button"
      >
        {isProcessing ? 'Procesando...' : isSending ? (isPaused ? 'Reanudar' : 'Pausar') : 'Enviar Mensaje'}
      </button>

      {/* Barra de progreso */}
      {isSending && (
        <div className="progress-bar-container">
          <ProgressBar
            percentage={progress}
            timeLeft={timeLeft}
            onPauseClick={handleSendMessages}
            isPaused={isPaused}
            isResuming={isResuming}
          />
        </div>
      )}

      {/* Modal de confirmación para pausar/reanudar */}
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
