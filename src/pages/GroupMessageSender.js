import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './GroupMessageSender.css';  // Asegúrate de tener este archivo con los estilos adecuados
import MessageForm from '../components/MessageForm';
import ImageUploader from '../components/ImageUploader';
import ProgressBar from '../components/ProgressBar';
import ConfirmationModal from '../components/ConfirmationModal';

function GroupMessageSender() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes?.sub;

      try {
        const response = await axios.get(
          'https://42zzu49wqg.execute-api.eu-west-3.amazonaws.com/whats/gupos', {
            params: { user_id: userId },
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setGroups(response.data);
          setFilteredGroups(response.data);
        } else {
          setGroups([]);
        }
      } catch (error) {
        console.error('Error al obtener los grupos:', error);
        setGroups([]);
      }
    };

    fetchGroups();
  }, []);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredGroups(groups.filter(group => group.name.toLowerCase().includes(searchTerm)));
  };

  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.some(selected => selected.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter(selected => selected.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const calculateTotalTime = (contacts) => contacts.length * 10; // 10 segundos por contacto

  const startProgressBar = (totalTime, initialProgress = 0) => {
    let timeElapsed = (initialProgress / 100) * totalTime;

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        timeElapsed += 1;
        const percentage = (timeElapsed / totalTime) * 100;
        const timeRemaining = (totalTime - timeElapsed) / 60;
        setProgress(percentage);
        setTimeLeft(timeRemaining);

        if (percentage >= 100) {
          clearInterval(intervalRef.current);
          setIsSending(false);
          navigate('/resumen-envio');
        }
      }
    }, 1000);
  };

  const generateCsvData = (phoneNumbers) => {
    let csvData = 'Nombre;Teléfono\n';
    phoneNumbers.forEach(phoneNumber => {
      csvData += `,${phoneNumber}\n`; // Nombre vacío, solo se usa el número
    });
    return csvData;
  };

  const handleAction = async () => {
    if (!isSending) {
      if (!message || selectedGroups.length === 0) {
        return;
      }
      setIsProcessing(true);
    
      try {
        const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
        if (!userAttributes || !userAttributes.sub) {
          throw new Error("userAttributes no encontrados o 'sub' no disponible en localStorage");
        }
        const userId = userAttributes.sub;
        const groupIds = selectedGroups.map(group => group.id);

        const contactsResponse = await axios.post('https://940bsd6v9a.execute-api.eu-west-3.amazonaws.com/groups/get_members', {
          user_id: userId,
          groupIds: groupIds,
        });

        if (contactsResponse.status === 200) {
          const body = JSON.parse(contactsResponse.data.body);
          const phoneNumbers = body.phoneNumbers;

          const csvData = generateCsvData(phoneNumbers);

          const payload = {
            mensaje: message,
            imagen: image,
            csv_data: csvData,
            user_id: userId,
          };

          const response = await axios.post('https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/procesar', payload, {
            timeout: 60000,
          });

          if (response.status === 200) {
            setIsSending(true);
            const totalTime = calculateTotalTime(phoneNumbers);
            setTimeLeft(totalTime / 60);
            startProgressBar(totalTime);
          } else {
            console.error('Error al enviar los mensajes:', response.data);
          }
        } else {
          console.error('Error al obtener los contactos de los grupos.');
        }
      } catch (error) {
        console.error('Error en el proceso de envío de mensajes:', error);
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
          csv_data: generateCsvData(selectedGroups.map(group => group.id)),
          user_id: userId
        }, {
          timeout: 60000
        });

        if (response.status === 200) {
          setIsPaused(false);
          const totalTime = calculateTotalTime(selectedGroups.length);
          startProgressBar(totalTime, progress);
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
      const totalTime = calculateTotalTime(selectedGroups.length);
      startProgressBar(totalTime, progress);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

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
                <div className={`selection-circle ${isSelected ? 'selected-circle' : ''}`}></div>
                <span className="group-name">{group.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="selected-groups-container">
        {selectedGroups.map(group => (
          <div key={group.id} className="selected-group">
            <span className="selected-group-name">{group.name}</span>
            <button className="remove-button" onClick={() => setSelectedGroups(selectedGroups.filter(g => g.id !== group.id))}>×</button>
          </div>
        ))}
      </div>

      <button onClick={handleAction} disabled={isProcessing}>
        {isProcessing ? 'Procesando...' : isSending ? 'Pausar' : 'Iniciar Envío'}
      </button>

      {isSending && (
        <div className="progress-bar-container">
          <ProgressBar percentage={progress} timeLeft={timeLeft} />
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
