import React, { useState, useEffect } from 'react';
import '../pages/GroupMessageSender.css'; // Usa el mismo CSS para asegurar consistencia
import axios from 'axios';

function GroupContactSelector({ onGroupSelection, onFetchContacts, isProcessing, groupContactsData }) {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const fetchGroups = async () => {
    try {
      const userAttributesStr = localStorage.getItem('userAttributes');
      if (!userAttributesStr) {
        console.error('User attributes not found in localStorage');
        return;
      }
      const userAttributes = JSON.parse(userAttributesStr);
      const userId = userAttributes?.sub;
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      const response = await axios.get(
        'https://42zzu49wqg.execute-api.eu-west-3.amazonaws.com/whats/gupos',
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
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
      setFilteredGroups([]);
    }
  };

  const handleGroupToggle = (group) => {
    const updatedSelection = selectedGroups.includes(group)
      ? selectedGroups.filter(g => g.id !== group.id)
      : [...selectedGroups, group];
    setSelectedGroups(updatedSelection);
    onGroupSelection(updatedSelection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="group-message-sender-container">
      <h2>Seleccionar Grupos para Enviar Mensajes</h2>
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
            const isSelected = selectedGroups.find(selected => selected.id === group.id);
            return (
              <div
                key={group.id}
                className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleGroupToggle(group)}
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

      <button
        onClick={onFetchContacts}
        disabled={isProcessing || selectedGroups.length === 0}
        className="fetch-contacts-button"
      >
        {isProcessing ? 'Obteniendo Contactos...' : 'Obtener Contactos'}
      </button>

      {groupContactsData && (
        <div className="contacts-summary">
          Se han obtenido {groupContactsData.split('\n').length - 1} contactos de los grupos seleccionados.
        </div>
      )}
    </div>
  );
}

export default GroupContactSelector;
