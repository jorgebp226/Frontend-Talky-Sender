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

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
`;

const SelectWrapper = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const SelectLabel = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
`;

const ProcessButton = styled.button`
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

const ContactsUploader = ({ setCsvData }) => {
  const [fileName, setFileName] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedPhoneColumn, setSelectedPhoneColumn] = useState('');
  const [selectedNameColumn, setSelectedNameColumn] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    resetState();
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
      } else {
        setError('Formato de archivo no soportado. Por favor, sube un archivo CSV o XLSX.');
      }
    }
  };

  const resetState = () => {
    setCsvRows([]);
    setHeaders([]);
    setSelectedPhoneColumn('');
    setSelectedNameColumn('');
    setError('');
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (jsonData.length === 0) {
          setError('El archivo está vacío.');
          return;
        }
        const extractedHeaders = Object.keys(jsonData[0]);
        setHeaders(extractedHeaders);
        setCsvRows(jsonData);
        preselectColumns(extractedHeaders);
      } catch (err) {
        setError('Error al leer el archivo Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processCsvData = (csvData) => {
    try {
      // Determinar el separador (coma o punto y coma)
      const separator = csvData.includes(';') ? ';' : ',';

      // Convertir el CSV a JSON
      const workbook = XLSX.read(csvData, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        setError('El archivo está vacío.');
        return;
      }

      const extractedHeaders = Object.keys(jsonData[0]);
      setHeaders(extractedHeaders);
      setCsvRows(jsonData);
      preselectColumns(extractedHeaders);
    } catch (err) {
      setError('Error al procesar el archivo CSV.');
    }
  };

  const preselectColumns = (extractedHeaders) => {
    // Preseleccionar columnas de Teléfono
    const phoneCandidates = extractedHeaders.filter(header => 
      ['telefono', 'teléfono'].includes(header.trim().toLowerCase())
    );
    if (phoneCandidates.length > 0) {
      setSelectedPhoneColumn(phoneCandidates[0]);
    }

    // Preseleccionar columnas de Nombre
    const nameCandidates = extractedHeaders.filter(header => 
      header.trim().toLowerCase() === 'nombre'
    );
    if (nameCandidates.length > 0) {
      setSelectedNameColumn(nameCandidates[0]);
    }
  };

  const handleRemoveFile = () => {
    resetState();
    setFileName('');
  };

  const handleProcessData = () => {
    setError('');

    if (!selectedPhoneColumn) {
      setError('Por favor, selecciona la columna de Teléfono.');
      return;
    }

    const processedData = csvRows.reduce((acc, row, index) => {
      let phone = row[selectedPhoneColumn].toString().trim();
      // Eliminar caracteres no numéricos
      phone = phone.replace(/\D/g, '');

      if (phone.length === 9) {
        phone = `34${phone}`;
      } else if (phone.length > 9) {
        // Dejar como está
      } else {
        // Ignorar filas con teléfonos con menos de 9 dígitos
        return acc;
      }

      const name = selectedNameColumn ? row[selectedNameColumn].toString().trim() : '';

      acc.push({
        telefono: phone,
        nombre: name
      });

      return acc;
    }, []);

    if (processedData.length === 0) {
      setError('No hay datos válidos para enviar.');
      return;
    }

    // Convertir a CSV o al formato que espera la API
    const apiData = processedData.map(contact => ({
      telefono: contact.telefono,
      nombre: contact.nombre || ''
    }));

    setCsvData(apiData);
    alert('Datos procesados y enviados correctamente.');
    // Opcional: Resetear el componente después de enviar
    resetState();
    setFileName('');
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
      {csvRows.length > 0 && (
        <>
          <h3>Vista Previa</h3>
          <PreviewTable>
            <thead>
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvRows.slice(0, 3).map((row, idx) => (
                <tr key={idx}>
                  {headers.map((header, hIdx) => (
                    <td key={hIdx}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </PreviewTable>

          <SelectWrapper>
            <SelectLabel>
              Columna de Teléfono:
              <select 
                value={selectedPhoneColumn} 
                onChange={(e) => setSelectedPhoneColumn(e.target.value)}
              >
                <option value="">-- Selecciona --</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>{header}</option>
                ))}
              </select>
            </SelectLabel>

            <SelectLabel>
              Columna de Nombre (opcional):
              <select 
                value={selectedNameColumn} 
                onChange={(e) => setSelectedNameColumn(e.target.value)}
              >
                <option value="">-- Selecciona --</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>{header}</option>
                ))}
              </select>
            </SelectLabel>
          </SelectWrapper>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ProcessButton onClick={handleProcessData}>
            Procesar y Enviar
          </ProcessButton>
        </>
      )}
    </UploaderWrapper>
  );
};

export default ContactsUploader;
