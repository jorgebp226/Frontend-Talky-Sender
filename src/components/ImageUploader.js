import React, { useState } from 'react';
import styled from 'styled-components';
import uploadIcon from '../assets/images/upload-icon.png';

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

const ImagePreview = styled.div`
  position: relative;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 10px;
  margin-top: 10px;
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

const ImageUploader = ({ setImageFile }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  return (
    <UploaderWrapper>
      <h2>Imagen</h2>
      <FileInput 
        type="file" 
        accept=".jpg,.png"
        onChange={handleFileChange}
        id="imageUpload"
      />
      <FileLabel htmlFor="imageUpload">
        <img src={uploadIcon} alt="Upload icon" /> Elegir archivo JPG o PNG
      </FileLabel>
      <p>Si no necesitas enviar una imagen, deja este campo vacío</p>
      {preview && (
        <ImagePreview>
          <CloseButton onClick={handleRemoveImage}>×</CloseButton>
          <PreviewImage src={preview} alt="Vista previa de la imagen" />
        </ImagePreview>
      )}
    </UploaderWrapper>
  );
};

export default ImageUploader;