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
    
    // Encontrar los índices de las columnas 'Nombre' y 'Teléfono'
    let headers = lines[0].split(';');
    let nombreIndex = headers.findIndex(h => h.trim().toLowerCase() === 'nombre');
    let telefonoIndex = headers.findIndex(h => h.trim().toLowerCase() === 'teléfono' || h.trim().toLowerCase() === 'telefono');
    
    // Si no se encuentran las columnas, buscar alternativas
    if (nombreIndex === -1) nombreIndex = headers.findIndex(h => h.trim().toLowerCase().includes('nombre'));
    if (telefonoIndex === -1) telefonoIndex = headers.findIndex(h => h.trim().toLowerCase().includes('telefono') || h.trim().toLowerCase().includes('teléfono'));
    
    // Si aún no se encuentran, usar las dos primeras columnas
    if (nombreIndex === -1) nombreIndex = 0;
    if (telefonoIndex === -1) telefonoIndex = 1;
    
    // Asegurarse de que 'Nombre' y 'Teléfono' estén en las primeras dos columnas
    if (nombreIndex !== 0 || telefonoIndex !== 1) {
      lines = lines.map((line, index) => {
        if (index === 0) {
          return `Nombre;Teléfono;${headers.filter((_, i) => i !== nombreIndex && i !== telefonoIndex).join(';')}`;
        } else {
          const columns = line.split(';');
          return `${columns[nombreIndex]};${columns[telefonoIndex]};${columns.filter((_, i) => i !== nombreIndex && i !== telefonoIndex).join(';')}`;
        }
      });
    }
    
    // Unir las líneas de nuevo en un string CSV
    let newCsv = lines.join('\n');
    
    // Limpiar el CSV de posibles caracteres no deseados
    newCsv = newCsv.replace(/[\r\n]+/g, '\n').trim();
    
    setCsvData(newCsv);
  };

  const handleRemoveFile = () => {
    setCsvData(null);
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
    </UploaderWrapper>
  );
};

export default ContactsUploader;