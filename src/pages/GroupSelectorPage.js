import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupSelectorPage.css';
import * as XLSX from 'xlsx';

function GroupSelectorPage() {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [file, setFile] = useState(null);
  const [phoneColumn, setPhoneColumn] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch groups from API on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
        const userId = userAttributes?.sub;
        
        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }

        const response = await axios.post('https://42zzu49wqg.execute-api.eu-west-3.amazonaws.com/whats/gupos', { user_id: userId });
        setGroups(response.data);
        setFilteredGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  // Filter groups based on search term
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

  // Handle group selection
  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.find(selected => selected.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter(selected => selected.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPhoneColumn('');
      setPhoneNumbers([]);
    }
  };

  // Process the uploaded file
  const processFile = () => {
    if (!file) {
      alert('Por favor, selecciona un archivo primero.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = jsonData[0];
      const firstTwoRows = jsonData.slice(1, 3);

      let phoneCol = '';
      headers.forEach((header, index) => {
        const cell1 = firstTwoRows[0][index];
        const cell2 = firstTwoRows[1][index];
        const isPhoneCol = [cell1, cell2].every(cell => {
          if (typeof cell === 'number') return cell.toString().length > 5;
          if (typeof cell === 'string') return cell.replace(/\D/g, '').length > 5;
          return false;
        });
        if (isPhoneCol && !phoneCol) {
          phoneCol = header;
        }
      });

      setPhoneColumn(phoneCol);
      const phoneIndex = headers.indexOf(phoneCol);
      const phones = jsonData.slice(1).map(row => row[phoneIndex].toString());
      setPhoneNumbers(phones);
    };

    reader.readAsBinaryString(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedGroups.length === 0 || !file || phoneNumbers.length === 0) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
    const userId = userAttributes?.sub;
    
    if (!userId) {
      console.error('User ID not found in localStorage');
      return;
    }

    const groupIds = selectedGroups.map(group => group.id);
    const payload = {
      user_id: userId,
      groupIds: groupIds,
      contacts: phoneNumbers
    };

    try {
      setIsProcessing(true);
      const response = await axios.post('https://42zzu49wqg.execute-api.eu-west-3.amazonaws.com/whats/add-users', payload);
      if (response.status === 200) {
        alert('Usuarios añadidos exitosamente.');
      } else {
        alert('Ocurrió un error al añadir los usuarios.');
      }
    } catch (error) {
      console.error('Error al añadir usuarios:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="group-selector-container">
      <h2>Selecciona los Grupos de WhatsApp</h2>
      <div className="dropdown-container">
        <input
          type="text"
          placeholder="Buscar grupos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="dropdown-list">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className={`dropdown-item ${selectedGroups.find(selected => selected.id === group.id) ? 'selected' : ''}`}
              onClick={() => toggleGroupSelection(group)}
            >
              <span>{group.name}</span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-upload">
          <label htmlFor="fileInput">Subir Archivo Excel o CSV:</label>
          <input type="file" id="fileInput" onChange={handleFileChange} />
          <button type="button" onClick={processFile}>Procesar Archivo</button>
        </div>
        {phoneColumn && (
          <div>
            <p>Columna de Teléfonos: {phoneColumn}</p>
            <p>Total de Teléfonos Encontrados: {phoneNumbers.length}</p>
          </div>
        )}
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Procesando...' : 'Enviar Usuarios'}
        </button>
      </form>
    </div>
  );
}

export default GroupSelectorPage;
