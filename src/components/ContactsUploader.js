import React, { useState } from 'react';
import styled from 'styled-components';
import contactsIcon from '../assets/images/contacts-icon.png';
import * as XLSX from 'xlsx';

const UploaderWrapper = styled.div`
  margin-bottom: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 20px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  img {
    margin-right: 8px;
    width: 20px;
    height: 20px;
  }
`;

const FilePreview = styled.div`
  position: relative;
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const DownloadLink = styled.a`
  color: blue;
  text-decoration: underline;
  cursor: pointer;
`;

const ContactsUploader = ({ setCsvData }) => {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedNameColumn, setSelectedNameColumn] = useState(null);
  const [selectedPhoneColumn, setSelectedPhoneColumn] = useState(null);
  const [csvLines, setCsvLines] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (file.name.endsWith('.xlsx')) {
        readExcelFile(file);
      } else if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = () => {
          processCsvData(reader.result);
        };
        reader.readAsText(file);
      }
    }
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
      processCsvData(csv);
    };
    reader.readAsArrayBuffer(file);
  };

  const processCsvData = (csvData) => {
    // Dividir el CSV en líneas y eliminar líneas vacías
    let lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== '');

    // Determinar el separador (coma o punto y coma)
    const separator = lines[0].includes(';') ? ';' : ',';

    // Convertir el separador a punto y coma si es necesario
    if (separator === ',') {
      lines = lines.map(line => line.split(',').map(cell => cell.replace(/"/g, '').trim()).join(';'));
    }

    // Obtener los encabezados
    let headers = lines[0].split(';').map(h => h.trim());

    // Obtener datos de vista previa (primeras 3 filas)
    let previewData = lines.slice(1, 4).map(line => line.split(';'));

    // Guardar encabezados y datos de vista previa en el estado
    setHeaders(headers);
    setPreviewData(previewData);

    // Guardar las líneas CSV para procesamiento posterior
    setCsvLines(lines);

    // Reiniciar columnas seleccionadas
    setSelectedNameColumn(null);
    setSelectedPhoneColumn(null);
  };

  const handleProcessData = () => {
    if (selectedPhoneColumn == null) {
      alert('Por favor, seleccione la columna de Teléfono.');
      return;
    }

    const processedData = [];
    const separator = ';';

    // Preparar encabezados
    const newHeaders = ['Nombre', 'Teléfono'];

    processedData.push(newHeaders.join(separator));

    // Procesar cada fila
    for (let i = 1; i < csvLines.length; i++) {
      const line = csvLines[i];
      const cells = line.split(separator);

      let name = '';
      if (selectedNameColumn != null) {
        name = cells[selectedNameColumn] || '';
      }

      let phone = cells[selectedPhoneColumn] || '';
      phone = phone.replace(/\D/g, ''); // Eliminar caracteres no numéricos

      if (phone.length === 9) {
        phone = '34' + phone;
      } else if (phone.length < 9) {
        continue; // Omitir esta fila
      }
      // Si phone.length > 9, no hacer nada

      // Agregar la fila procesada
      const newRow = [name, phone];
      processedData.push(newRow.join(separator));
    }

    // Crear el nuevo CSV
    const newCsvData = processedData.join('\n');

    // Enviar los datos CSV procesados
    setCsvData(newCsvData);

    // Limpiar la vista previa y selecciones
    setHeaders(null);
    setPreviewData(null);
    setSelectedNameColumn(null);
    setSelectedPhoneColumn(null);

    alert('Datos procesados correctamente.');
  };

  const handleRemoveFile = () => {
    setCsvData(null);
    setFileName('');
    setHeaders(null);
    setPreviewData(null);
    setSelectedNameColumn(null);
    setSelectedPhoneColumn(null);
    setCsvLines([]);
  };

  return (
    <UploaderWrapper>
      <h2>Contactos</h2>
      <FileInput 
        type="file" 
        accept=".csv,.xlsx"
        onChange={handleFileChange}
        id="contactsUpload"
      />
      <FileLabel htmlFor="contactsUpload">
        <img src={contactsIcon} alt="Contacts icon" /> Elegir archivo CSV o XLSX
      </FileLabel>
      <p>
        <DownloadLink href="https://flyerswhatsappsaas.s3.eu-west-3.amazonaws.com/pantillacsv/Template-Envios.csv" download>
          Haz click aquí para descargar una plantilla
        </DownloadLink>
      </p>
      {fileName && (
        <FilePreview>
          <CloseButton onClick={handleRemoveFile}>×</CloseButton>
          <strong>Archivo subido:</strong> {fileName}
        </FilePreview>
      )}

      {headers && (
        <div>
          <h3>Selecciona las columnas:</h3>
          <div>
            <label>Columna de Teléfono:</label>
            <select
              value={selectedPhoneColumn != null ? selectedPhoneColumn : ''}
              onChange={(e) => setSelectedPhoneColumn(Number(e.target.value))}
            >
              <option value="" disabled>Seleccione</option>
              {headers.map((header, index) => (
                <option key={index} value={index}>{header}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Columna de Nombre (opcional):</label>
            <select
              value={selectedNameColumn != null ? selectedNameColumn : ''}
              onChange={(e) => setSelectedNameColumn(Number(e.target.value))}
            >
              <option value="" disabled>Seleccione</option>
              {headers.map((header, index) => (
                <option key={index} value={index}>{header}</option>
              ))}
            </select>
          </div>

          <table>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleProcessData}>Procesar Datos</button>
        </div>
      )}
    </UploaderWrapper>
  );
};

export default ContactsUploader;
