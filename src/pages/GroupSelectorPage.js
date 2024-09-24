import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupSelectorPage.css'; // Asegúrate de crear este archivo
import * as XLSX from 'xlsx';

function GroupSelectorPage() {
  const [groups, setGroups] = useState([]); // Los grupos se guardan aquí como array de objetos
  const [searchTerm, setSearchTerm] = useState(''); // El término de búsqueda
  const [filteredGroups, setFilteredGroups] = useState([]); // Grupos filtrados para mostrar
  const [selectedGroups, setSelectedGroups] = useState([]); // Los grupos seleccionados
  const [file, setFile] = useState(null); // El archivo subido (Excel/CSV)
  const [phoneColumn, setPhoneColumn] = useState(''); // La columna que contiene los números de teléfono
  const [phoneNumbers, setPhoneNumbers] = useState([]); // Números de teléfono extraídos del archivo
  const [isProcessing, setIsProcessing] = useState(false); // Estado de procesamiento (loading)
  const [message, setMessage] = useState(''); // Mensajes de estado

  // Obtener los grupos desde la API cuando se monta el componente
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
        const userId = userAttributes?.sub;
        
        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }

        // Llamada a la API para obtener los grupos
        const response = await axios.post('https://42zzu49wqg.execute-api.eu-west-3.amazonaws.com/whats/gupos', { user_id: userId });
        
        // Verificar si response.data es un array
        if (Array.isArray(response.data)) {
          setGroups(response.data); // Asignar los grupos a la variable de estado
          setFilteredGroups(response.data); // Asignar grupos filtrados inicialmente
        } else {
          console.error('Error: La respuesta de la API no es un array.');
          setGroups([]); // Asegurarse de que siempre es un array vacío en caso de error
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]); // Asignar un array vacío en caso de error
      }
    };

    fetchGroups();
  }, []);

  // Filtrar los grupos en función del término de búsqueda
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredGroups(groups); // Mostrar todos los grupos si no hay término de búsqueda
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered); // Actualizar los grupos filtrados
    }
  }, [searchTerm, groups]);

  // Manejar la selección de un grupo
  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.find(selected => selected.id === group.id);
    if (isSelected) {
      // Si el grupo ya está seleccionado, quitarlo de la lista
      setSelectedGroups(selectedGroups.filter(selected => selected.id !== group.id));
    } else {
      // Si el grupo no está seleccionado, añadirlo a la lista
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  // Manejar la subida de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPhoneColumn('');
      setPhoneNumbers([]);
    }
  };

  // Procesar el archivo subido y extraer los números de teléfono
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

  // Manejar el envío del formulario para añadir usuarios a los grupos seleccionados
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

    // Obtener solo los IDs de los grupos seleccionados
    const groupIds = selectedGroups.map(group => group.id);
    const payload = {
      user_id: userId,
      groupIds: groupIds,
      contacts: phoneNumbers
    };

    try {
      setIsProcessing(true);
      // Llamada a la API para añadir los usuarios a los grupos seleccionados
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
