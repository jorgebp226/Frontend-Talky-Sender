import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './GroupSelectorPage.css';
import * as XLSX from 'xlsx';
import excelIcon from '../assets/images/contacts-icon.png';
import ProgressBar from '../components/ProgressBar';
import { useNavigate } from 'react-router-dom';

function GroupSelectorPage() {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [file, setFile] = useState(null);
  const [phoneColumn, setPhoneColumn] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  // Obtener los grupos desde la API cuando se monta el componente
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Espera para cargar localStorage
        const userAttributes = JSON.parse(localStorage.getItem('userAttributes'));
        const userId = userAttributes?.sub;
        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }
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
    fetchGroups();
  }, []);

  // Filtrar los grupos en función del término de búsqueda
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

  // Manejar la selección de un grupo
  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.find(selected => selected.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter(selected => selected.id !== group.id));
    } else {
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
      processFile(selectedFile); // Procesar archivo automáticamente
    }
  };

  // Procesar el archivo subido y extraer los números de teléfono
  const processFile = (selectedFile) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = jsonData[0];
      const firstFourRows = jsonData.slice(1, 5); // Solo las primeras 4 filas
      let phoneCol = '';
      headers.forEach((header, index) => {
        const isPhoneCol = firstFourRows.every(row => {
          const cell = row[index];
          if (typeof cell === 'number') return cell.toString().length > 5;
          if (typeof cell === 'string') return cell.replace(/\D/g, '').length > 5;
          return false;
        });
        if (isPhoneCol && !phoneCol) {
          phoneCol = header;
        }
      });
      setPhoneColumn(phoneCol); // Mostrar columna automáticamente seleccionada
      const phoneIndex = headers.indexOf(phoneCol);
      const phones = jsonData.slice(1).map(row => row[phoneIndex]?.toString().trim()).filter(phone => phone);
      setPhoneNumbers(preprocessPhones(phones));  // Preprocesar números
      setPreviewData([headers, ...firstFourRows]); // Mostrar la vista previa
    };
    reader.readAsBinaryString(selectedFile);
  };

  // Preprocesar los números de teléfono
  const preprocessPhones = (phones) => {
    return phones.map(phone => {
      // Eliminar caracteres no numéricos
      let cleanedPhone = phone.replace(/\D/g, '');
      if (cleanedPhone.length === 9) {
        // Añadir el prefijo 34 si tiene 9 dígitos
        cleanedPhone = '34' + cleanedPhone;
      } else if (cleanedPhone.length < 9) {
        // Si tiene menos de 9 dígitos, se descarta
        cleanedPhone = '';
      }
      return cleanedPhone;
    }).filter(phone => phone !== '');
  };

  // Seleccionar manualmente la columna de teléfonos
  const handleColumnSelect = (index) => {
    const newPhoneColumn = previewData[0][index];
    setPhoneColumn(newPhoneColumn);
    const phones = previewData.slice(1).map(row => row[index]?.toString().trim()).filter(phone => phone);
    setPhoneNumbers(preprocessPhones(phones)); // Preprocesar números actualizados
  };

  const startProgressBar = (totalTime) => {
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000; // segundos
      const percentage = Math.min((elapsedTime / totalTime) * 100, 100); // Limitar al 100%
      setProgress(percentage);
      setTimeLeft((totalTime - elapsedTime) / 60);  // minutos restantes
      if (percentage >= 100) {
        clearInterval(intervalRef.current);
        navigate('/resumen-groups'); // Redirigir cuando termina
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedGroups.length === 0 || !file || phoneNumbers.length === 0) {
      alert('Por favor completa todos los campos.');
      return;
    }
    const userAttributesStr = localStorage.getItem('userAttributes');
    if (!userAttributesStr) {
      console.error('User attributes not found in localStorage');
      alert('No se encontraron atributos de usuario. Por favor, inicia sesión nuevamente.');
      return;
    }
    const userAttributes = JSON.parse(userAttributesStr);
    const userId = userAttributes?.sub;
    if (!userId) {
      console.error('User ID not found in localStorage');
      alert('No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
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
      const totalTime = selectedGroups.length * phoneNumbers.length * 8;  // Tiempo estimado en segundos
      setTimeLeft(totalTime / 60); // Inicializar tiempo restante en minutos
      setProgress(0); // Reiniciar progreso
      startProgressBar(totalTime);
      const response = await axios.post(
        'https://42zzu49wqg.execute-api.eu-west-3.amazonaws.com/whats/gupos',
        payload
      );
      if (response.status === 200) {
        alert('Usuarios añadidos exitosamente.');
        setSelectedGroups([]);
        setFile(null);
        setPhoneColumn('');
        setPhoneNumbers([]);
        setPreviewData([]);
        setProgress(0);
        setTimeLeft(0);
        navigate('/resumen-groups'); // Redirigir a la página de resumen
      } else {
        alert('Ocurrió un error al añadir los usuarios.');
      }
    } catch (error) {
      console.error('Error al añadir usuarios:', error);
      alert('Ocurrió un error al añadir los usuarios.');
    } finally {
      setIsProcessing(false);
      clearInterval(intervalRef.current); // Asegurar que el intervalo se limpie
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

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

      <form onSubmit={handleSubmit} className="upload-form">
        <h3>Añade los contactos</h3>
        <div className="file-upload-container">
          <label htmlFor="fileInput" className="file-upload-label">
            <img src={excelIcon} alt="Excel Icon" className="file-icon" />
            <span>Elegir archivo CSV o XLSX</span>
          </label>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="file-input"
          />
        </div>

        {phoneColumn && (
          <div className="file-summary">
            <p><strong>Columna de Teléfonos:</strong> {phoneColumn}</p>
            <p><strong>Total de Teléfonos Encontrados:</strong> {phoneNumbers.length}</p>
          </div>
        )}

        {previewData.length > 0 && (
          <div className="preview-container">
            <h3>Vista previa</h3>
            <table className="preview-table">
              <thead>
                <tr>
                  {previewData[0].map((header, index) => (
                    <th
                      key={index}
                      className={phoneColumn === header ? 'selected-column' : ''}
                      onClick={() => handleColumnSelect(index)}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={phoneColumn === previewData[0][cellIndex] ? 'selected-column' : ''}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isProcessing || selectedGroups.length === 0 || phoneNumbers.length === 0}
        >
          {isProcessing ? 'Procesando...' : 'Añadir miembros'}
        </button>

        {isProcessing && (
          <div className="progress-bar-container">
            <ProgressBar percentage={progress} timeLeft={timeLeft} />
          </div>
        )}
      </form>
    </div>
  );
}

export default GroupSelectorPage;