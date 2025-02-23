import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Chats.css';

const Chats = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [image, setImage] = useState(null);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
        const userId = userAttributes.sub;
        
        const response = await axios.get(
          `https://nhjrqgdt4a.execute-api.eu-west-3.amazonaws.com/talky-sender/conversations`,
          { params: { user_id: userId } }
        );
        
        setConversations(response.data.conversations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getLastMessage = (messages) => {
    return messages[messages.length - 1];
  };

  const filteredConversations = conversations.filter(conv =>
    conv.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !image) return;
    
    try {
      setSending(true);
      const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
      const userId = userAttributes.sub;
      
      const csvData = `Nombre;Teléfono\n,;${conversations[selectedChat].contact}\n`;
      
      const payload = {
        mensaje: newMessage,
        imagen: image,
        csv_data: csvData,
        user_id: userId
      };

      const response = await axios.post(
        'https://3iffjctlw9.execute-api.eu-west-3.amazonaws.com/etapa1/procesar',
        payload
      );

      if (response.status === 200) {
        // Actualizar la conversación localmente
        const newMessageObj = {
          content: newMessage,
          timestamp: new Date().toISOString(),
          direction: 'SENT'
        };

        const updatedConversations = [...conversations];
        updatedConversations[selectedChat].messages.push(newMessageObj);
        setConversations(updatedConversations);
        
        setNewMessage('');
        setImage(null);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result.split(',')[1]); // Guardamos solo la base64 sin el prefijo
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="loading">Cargando conversaciones...</div>;
  }

  return (
    <div className="chats-container">
      <div className="logo-container" onClick={() => navigate('/dashboard')}>
        <img src={`${process.env.PUBLIC_URL}/Talkylogo.png`} alt="Logo" className="logo" />
        <div className="tooltip">Inicio</div>
      </div>

      <div className="chats-sidebar">
        <div className="chats-header">
          <h2>Talky</h2>
          <div className="header-actions">
            <button className="header-icon">📞</button>
            <button className="header-icon">📷</button>
            <button className="header-icon">⚙️</button>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="chat-filters">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Unread</button>
          <button className="filter-btn">Private</button>
          <button className="filter-btn">Group</button>
        </div>

        <div className="conversations-list">
          {filteredConversations.map((conv, index) => (
            <div 
              key={index}
              className={`conversation-item ${selectedChat === index ? 'selected' : ''}`}
              onClick={() => setSelectedChat(index)}
            >
              <div className="conversation-avatar">
                {conv.nombre[0].toUpperCase()}
              </div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <h3>{conv.nombre}</h3>
                  <span className="last-message-time">
                    {formatLastMessageDate(getLastMessage(conv.messages).timestamp)}
                  </span>
                </div>
                <p className="last-message">
                  {getLastMessage(conv.messages).content.substring(0, 50)}
                  {getLastMessage(conv.messages).content.length > 50 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-main">
        {selectedChat !== null ? (
          <>
            <div className="chat-header">
              <div className="chat-contact-info">
                <div className="chat-avatar">
                  {conversations[selectedChat].nombre[0].toUpperCase()}
                </div>
                <div className="chat-contact-details">
                  <h3>{conversations[selectedChat].nombre}</h3>
                  <p>{conversations[selectedChat].contact}</p>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-icon">📞</button>
                <button className="action-icon">📷</button>
                <button className="action-icon">🔗</button>
                <button className="action-icon">⚙️</button>
              </div>
            </div>
            
            <div className="messages-container">
              {conversations[selectedChat].messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.direction.toLowerCase()}`}
                >
                  <div className="message-content">
                    {message.content}
                    <span className="message-time">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="message-input-container">
              <label className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                📷
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="message-input"
              />
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={sending || (!newMessage.trim() && !image)}
              >
                {sending ? '...' : '➤'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Selecciona una conversación para ver los mensajes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;