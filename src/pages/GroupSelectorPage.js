import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupSelectorPage.css';
import * as XLSX from 'xlsx';
import excelIcon from '../assets/images/contacts-icon.png';// Reemplazamos el ícono de Excel

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

  // Función para alternar la selección del grupo
  const toggleGroupSelection = (group) => {
    const isSelected = selectedGroups.find(selected => selected.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter(selected => selected.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  // Función para eliminar un grupo seleccionado
  const removeSelectedGroup = (groupId) => {
    setSelectedGroups(selectedGroups.filter(group => group.id !== groupId));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = jsonData[0];
      const firstFourRows = jsonData.slice(1, 5);

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

      setPhoneColumn(phoneCol);
      const phoneIndex = headers.indexOf(phoneCol);
      const phones = jsonData.slice(1).map(row => row[phoneIndex]?.toString().trim()).filter(phone => phone);
      setPhoneNumbers(phones);
      setPreviewData([headers, ...firstFourRows]);
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleColumnSelect = (index) => {
    const newPhoneColumn = previewData[0][index];
    setPhoneColumn(newPhoneColumn);
    const phones = previewData.slice(1).map(row => row[index]?.toString().trim()).filter(phone => phone);
    setPhoneNumbers(phones);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Lógica para enviar los datos
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
              <div className={`selection-circle ${selectedGroups.find(selected => selected.id === group.id) ? 'selected-circle' : ''}`}></div>
              <span className="group-name">{group.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="selected-groups-container">
        {selectedGroups.map(group => (
          <div key={group.id} className="selected-group">
            <span className="selected-group-name">{group.name}</span>
            <button className="remove-button" onClick={() => removeSelectedGroup(group.id)}>×</button>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-upload-container">
          <label htmlFor="fileInput" className="file-upload-label">
            <img src={excelIcon} alt="Excel Icon" className="file-icon" /> {/* Usamos imagen PNG */}
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
        
        {phoneNumbers.length > 0 && (
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
      </form>
    </div>
  );
}

export default GroupSelectorPage;
