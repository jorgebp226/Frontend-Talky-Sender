import React, { useState } from 'react';
import styled from 'styled-components';
import contactsIcon from '../assets/images/contacts-icon.png';  // Asegúrate de ajustar la ruta según la ubicación real de tu archivo

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setCsvData(reader.result);
      };
      reader.readAsText(file);
    }
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
