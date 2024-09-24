import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupSelectorPage.css'; // Asegúrate de crear este archivo
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
        const response = await axios.get('https://your-api-gateway-endpoint/groups'); // Reemplaza con tu endpoint real
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

  // Handle removing a selected group
  const removeGroup = (groupId) => {
    setSelectedGroups(selectedGroups.filter(group => group.id !== groupId));
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

      // Asumimos que los datos están en la primera hoja
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length < 2) {
        alert('El archivo no tiene suficientes filas.');
        return;
      }

      // Identificar la columna con números de teléfono
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

      if (!phoneCol) {
        alert('No se encontró una columna válida con números de teléfono.');
        return;
      }

      setPhoneColumn(phoneCol);

      // Extraer los números de teléfono de la columna identificada
      const phoneIndex = headers.indexOf(phoneCol);
      const phones = jsonData.slice(1).map(row => {
        const cell = row[phoneIndex];
        if (typeof cell === 'number') {
          return cell.toString();
        }
        if (typeof cell === 'string') {
          return cell.replace(/\D/g, '');
        }
        return null;
      }).filter(phone => phone && phone.length > 5);

      setPhoneNumbers(phones);
    };

    reader.readAsBinaryString(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedGroups.length === 0) {
      alert('Por favor, selecciona al menos un grupo.');
      return;
    }

    if (!file) {
      alert('Por favor, sube un archivo Excel o CSV.');
      return;
    }

    if (phoneNumbers.length === 0) {
      alert('No se encontraron números de teléfono válidos en el archivo.');
      return;
    }

    const groupIds = selectedGroups.map(group => group.id);

    const payload = {
      groupIds: groupIds,
      contacts: phoneNumbers
    };

    try {
      setIsProcessing(true);
      const response = await axios.post('https://your-api-gateway-endpoint/send-users', payload); // Reemplaza con tu endpoint real
      if (response.status === 200) {
        alert('Usuarios añadidos exitosamente.');
        // Opcional: Reiniciar el formulario
        setSelectedGroups([]);
        setFile(null);
        setPhoneColumn('');
        setPhoneNumbers([]);
        document.getElementById('fileInput').value = '';
      } else {
        alert('Ocurrió un error al añadir los usuarios.');
      }
    } catch (error) {
      console.error('Error al añadir usuarios:', error);
      alert('Ocurrió un error al añadir los usuarios.');
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
          {filteredGroups.map(group => {
            const isSelected = selectedGroups.find(selected => selected.id === group.id);
            return (
              <div
                key={group.id}
                className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleGroupSelection(group)}
              >
                <span className={`selection-circle ${isSelected ? 'selected-circle' : ''}`}></span>
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
            <button className="remove-button" onClick={() => removeGroup(group.id)}>×</button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-upload">
          <label htmlFor="fileInput" className="file-label">Subir Archivo Excel o CSV:</label>
          <input
            type="file"
            id="fileInput"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
          />
          <button type="button" onClick={processFile} className="process-button">Procesar Archivo</button>
        </div>

        {phoneColumn && (
          <div className="phone-column-info">
            <p><strong>Columna de Teléfonos:</strong> {phoneColumn}</p>
            <p><strong>Total de Teléfonos Encontrados:</strong> {phoneNumbers.length}</p>
          </div>
        )}

        <button type="submit" className="submit-button" disabled={isProcessing}>
          {isProcessing ? 'Procesando...' : 'Enviar Usuarios'}
        </button>
      </form>
    </div>
  );
}

export default GroupSelectorPage;
