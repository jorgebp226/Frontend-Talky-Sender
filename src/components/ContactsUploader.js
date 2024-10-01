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

const ErrorText = styled.p`
  color: red;
  margin-top: 10px;
`;

const ContactsUploader = ({ setCsvData }) => {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [selectedNombre, setSelectedNombre] = useState('');
  const [selectedTelefono, setSelectedTelefono] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
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
        setError('Formato de archivo no soportado.');
      }
    }
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
        processCsvData(csv);
      } catch (err) {
        console.error('Error al leer el archivo Excel:', err);
        setError('Error al leer el archivo Excel. Asegúrate de que el archivo no esté dañado.');
      }
    };
    reader.onerror = () => {
      console.error('Error al leer el archivo:', reader.error);
      setError('Error al leer el archivo.');
    };
    reader.readAsArrayBuffer(file);
  };

  const processCsvData = (csvData) => {
    try {
      // Dividir el CSV en líneas
      let lines = csvData.split(/\r\n|\n/);

      // Eliminar líneas vacías
      lines = lines.filter(line => line.trim() !== '');

      if (lines.length === 0) {
        setError('El archivo está vacío.');
        return;
      }

      // Determinar el separador (coma o punto y coma)
      const separator = lines[0].includes(';') ? ';' : ',';

      // Convertir el separador a punto y coma si es necesario
      if (separator === ',') {
        lines = lines.map(line => line.split(',').map(cell => cell.replace(/"/g, '').trim()).join(';'));
      }

      // Obtener los encabezados y las primeras tres filas
      const allHeaders = lines[0].split(';').map(header => header.trim());
      const firstThreeRows = lines.slice(1, 4).map(line => line.split(';').map(cell => cell.trim()));

      setHeaders(allHeaders);
      setPreviewRows(firstThreeRows);
      setProcessedData(lines); // Guardar todas las líneas para procesamiento posterior
    } catch (err) {
      console.error('Error al procesar el CSV:', err);
      setError('Error al procesar el archivo CSV. Asegúrate de que el formato sea correcto.');
    }
  };

  const handleConfirmSelection = () => {
    if (!processedData) return;

    if (!selectedTelefono) {
      setError('Por favor, selecciona una columna para Teléfono.');
      return;
    }

    const headers = processedData[0].split(';').map(header => header.trim());
    const nombreIdx = selectedNombre ? headers.indexOf(selectedNombre) : -1;
    const telefonoIdx = headers.indexOf(selectedTelefono);

    if (telefonoIdx === -1) {
      setError('La columna de Teléfono seleccionada no existe.');
      return;
    }

    // Crear nuevas líneas con las columnas seleccionadas
    let newLines = ['Nombre;Teléfono']; // Encabezados

    for (let i = 1; i < processedData.length; i++) {
      const line = processedData[i];
      if (!line.trim()) continue; // Saltar líneas vacías
      const columns = line.split(';');

      // Obtener nombre y teléfono con seguridad
      let nombre = '';
      if (nombreIdx !== -1 && columns.length > nombreIdx) {
        nombre = columns[nombreIdx].trim();
        // Asegurarse de que 'nombre' no sea undefined o null
        if (!nombre) nombre = '.';
      } else {
        nombre = '.'; // Asignar '.' si no se selecciona la columna de Nombre
      }

      let telefono = '';
      if (columns.length > telefonoIdx) {
        telefono = columns[telefonoIdx].trim();
        // Asegurarse de que 'telefono' no sea undefined o null
        if (!telefono) telefono = '';
      }

      // Normalizar el teléfono
      const digitsOnly = telefono.replace(/\D/g, '');
      if (digitsOnly.length === 9) {
        telefono = '34' + digitsOnly;
      } else if (digitsOnly.length > 9) {
        telefono = digitsOnly;
      } else {
        continue; // Eliminar la fila si tiene menos de 9 dígitos
      }

      // Verificar que 'telefono' no sea 'NaN'
      if (telefono.toLowerCase() === 'nan') {
        continue; // Eliminar la fila si el teléfono es 'NaN'
      }

      // Añadir la nueva línea
      newLines.push(`${nombre};${telefono}`);
    }

    // Verificar si newLines tiene al menos dos líneas (encabezados + al menos un contacto)
    if (newLines.length < 2) {
      setError('No hay contactos válidos para enviar.');
      return;
    }

    // Unir las líneas en un CSV
    const finalCsv = newLines.join('\n');

    // Verificar que el CSV no contenga 'NaN'
    if (finalCsv.includes('NaN')) {
      setError('Los datos procesados contienen valores inválidos.');
      console.error('CSV contiene NaN:', finalCsv);
      return;
    }

    // Pasar el CSV al componente padre
    setCsvData(finalCsv);
    setError('');
  };

  const handleRemoveFile = () => {
    setCsvData(null);
    setFileName('');
    setHeaders([]);
    setPreviewRows([]);
    setSelectedNombre('');
    setSelectedTelefono('');
    setProcessedData(null);
    setError('');
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

          {error && <ErrorText>{error}</ErrorText>}

          <ConfirmButton onClick={handleConfirmSelection}>
            Confirmar Selección
          </ConfirmButton>
        </>
      )}

      {/* Mostrar errores generales */}
      {error && previewRows.length === 0 && <ErrorText>{error}</ErrorText>}
    </UploaderWrapper>
  );
};

export default ContactsUploader;
