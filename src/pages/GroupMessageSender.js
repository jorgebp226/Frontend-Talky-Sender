import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MessageForm from '../components/MessageForm';
import ImageUploader from '../components/ImageUploader';
import ProgressBar from '../components/ProgressBar';

function GroupMessageSender() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Llamada para obtener los grupos desde la API
    const fetchGroups = async () => {
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes?.sub;

      try {
        const response = await axios.get('https://your-api-url.com/get-groups', {
          params: { user_id: userId },
          headers: { 'Content-Type': 'application/json' },
        });

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

  const startProgressBar = (totalTime) => {
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000; // segundos
      const percentage = Math.min((elapsedTime / totalTime) * 100, 100); // Limitar al 100%
      setProgress(percentage);
      setTimeLeft((totalTime - elapsedTime) / 60); // minutos restantes

      if (percentage >= 100) {
        clearInterval(intervalRef.current);
        navigate('/resumen-envio'); // Redirigir cuando termine el envío
      }
    }, 1000);
  };

  const handleSendMessages = async () => {
    if (!message || selectedGroups.length === 0) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setIsProcessing(true);

    try {
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes?.sub;
      const groupIds = selectedGroups.map(group => group.id);

      // Llamada a la API para obtener los contactos de los grupos seleccionados
      const contactsResponse = await axios.post('https://your-api-url.com/get-group-participants', {
        user_id: userId,
        groupIds: groupIds,
      });

      if (contactsResponse.status === 200 && contactsResponse.data.phoneNumbers) {
        const contacts = contactsResponse.data.phoneNumbers;

        const payload = {
          mensaje: message,
          imagen: image,
          contactos: contacts,
          user_id: userId,
        };

        // Llamada a la API para enviar los mensajes
        const response = await axios.post('https://your-api-url.com/send-message', payload, {
          timeout: 60000,
        });

        if (response.status === 200) {
          const totalTime = calculateTotalTime(contacts);
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
  };

  return (
    <div className="group-message-sender">
      <MessageForm setMessage={setMessage} />
      <ImageUploader setImage={setImage} />
      
      <div className="group-selector">
        <input type="text" placeholder="Buscar grupos..." onChange={handleSearch} />
        <div className="group-list">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className={`group-item ${selectedGroups.includes(group) ? 'selected' : ''}`}
              onClick={() => toggleGroupSelection(group)}
            >
              {group.name}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSendMessages} disabled={isProcessing}>
        {isProcessing ? 'Procesando...' : 'Iniciar Envío'}
      </button>

      {isProcessing && (
        <div className="progress-bar-container">
          <ProgressBar percentage={progress} timeLeft={timeLeft} />
        </div>
      )}
    </div>
  );
}

export default GroupMessageSender;
