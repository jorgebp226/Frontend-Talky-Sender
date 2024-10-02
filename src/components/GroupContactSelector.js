import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const SelectorWrapper = styled.div`
  margin-bottom: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const GroupList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const CheckBox = styled.input`
  margin-right: 10px;
`;

const FetchButton = styled.button`
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
  }
`;

const ContactsSummary = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
`;

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
    <SelectorWrapper>
      <h2>Seleccionar Grupos</h2>
      <SearchInput
        type="text"
        placeholder="Buscar grupos..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <GroupList>
        {filteredGroups.map(group => (
          <GroupItem key={group.id} onClick={() => handleGroupToggle(group)}>
            <CheckBox
              type="checkbox"
              checked={selectedGroups.some(g => g.id === group.id)}
              readOnly
            />
            {group.name}
          </GroupItem>
        ))}
      </GroupList>
      <FetchButton
        onClick={onFetchContacts}
        disabled={isProcessing || selectedGroups.length === 0}
      >
        {isProcessing ? 'Obteniendo Contactos...' : 'Obtener Contactos'}
      </FetchButton>
      {groupContactsData && (
        <ContactsSummary>
          Se han obtenido {groupContactsData.split('\n').length - 1} contactos de los grupos seleccionados.
        </ContactsSummary>
      )}
    </SelectorWrapper>
  );
}

export default GroupContactSelector;