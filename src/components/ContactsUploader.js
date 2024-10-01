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
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }
`;

const SelectContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
`;

const ConfirmButton = styled.button`
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ContactsUploader = ({ setCsvData }) => {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [selectedNombre, setSelectedNombre] = useState('');
  const [selectedTelefono, setSelectedTelefono] = useState('');
  const [processedData, setProcessedData] = useState(null);

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
    // Dividir el CSV en líneas
    let lines = csvData.split(/\r\n|\n/);

    // Determinar el separador (coma o punto y coma)
    const separator = lines[0].includes(';') ? ';' : ',';

    // Convertir el separador a punto y coma si es necesario
    if (separator === ',') {
      lines = lines.map(line => line.split(',').map(cell => cell.replace(/"/g, '').trim()).join(';'));
    }

    // Obtener los encabezados y las primeras tres filas
    const allHeaders = lines[0].split(';');
    const firstThreeRows = lines.slice(1, 4).map(line => line.split(';'));

    setHeaders(allHeaders);
    setPreviewRows(firstThreeRows);
    setProcessedData(lines); // Guardar todas las líneas para procesamiento posterior
  };

  const handleConfirmSelection = () => {
    if (!processedData) return;

    const headers = processedData[0].split(';');
    const nombreIdx = selectedNombre ? headers.indexOf(selectedNombre) : -1;
    const telefonoIdx = selectedTelefono ? headers.indexOf(selectedTelefono) : -1;

    if (telefonoIdx === -1) {
      alert('Por favor, selecciona la columna de Teléfono.');
      return;
    }

    // Crear nuevas líneas con las columnas seleccionadas
    let newLines = [ 'Nombre;Teléfono' ]; // Encabezados

    for (let i = 1; i < processedData.length; i++) {
      const line = processedData[i];
      if (!line.trim()) continue; // Saltar líneas vacías
      const columns = line.split(';');

      // Obtener nombre y teléfono
      const nombre = nombreIdx !== -1 ? columns[nombreIdx].trim() : '';
      let telefono = telefonoIdx !== -1 ? columns[telefonoIdx].trim() : '';

      // Normalizar el teléfono
      const digitsOnly = telefono.replace(/\D/g, '');
      if (digitsOnly.length === 9) {
        telefono = '34' + digitsOnly;
      } else if (digitsOnly.length > 9) {
        telefono = digitsOnly;
      } else {
        continue; // Eliminar la fila si tiene menos de 9 dígitos
      }

      // Añadir la nueva línea
      newLines.push(`${nombre};${telefono}`);
    }

    // Unir las líneas en un CSV
    const finalCsv = newLines.join('\n');

    // Pasar el CSV al componente padre
    setCsvData(finalCsv);
  };

  const handleRemoveFile = () => {
    setCsvData(null);
    setFileName('');
    setHeaders([]);
    setPreviewRows([]);
    setSelectedNombre('');
    setSelectedTelefono('');
    setProcessedData(null);
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
      
      {/* Mostrar la vista previa y las opciones de selección si hay datos procesados */}
      {previewRows.length > 0 && headers.length > 0 && (
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
              {previewRows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </PreviewTable>

          <SelectContainer>
            <div>
              <label htmlFor="nombreSelect">Selecciona la columna de Nombre (opcional): </label>
              <Select 
                id="nombreSelect" 
                value={selectedNombre} 
                onChange={(e) => setSelectedNombre(e.target.value)}
              >
                <option value="">-- Ninguno --</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>{header}</option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="telefonoSelect">Selecciona la columna de Teléfono: </label>
              <Select 
                id="telefonoSelect" 
                value={selectedTelefono} 
                onChange={(e) => setSelectedTelefono(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>{header}</option>
                ))}
              </Select>
            </div>
          </SelectContainer>

          <ConfirmButton onClick={handleConfirmSelection}>
            Confirmar Selección
          </ConfirmButton>
        </>
      )}
    </UploaderWrapper>
  );
};

export default ContactsUploader;
