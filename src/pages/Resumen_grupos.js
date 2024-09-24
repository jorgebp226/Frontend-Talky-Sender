import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ResumenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  position: relative;
`;

const Logo = styled.img`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 150px;
  height: auto;
  cursor: pointer;
`;

const PlaneImage = styled.div`
  width: 100%;
  height: 250px;
  background-image: url(${process.env.PUBLIC_URL}/successmessage1.png);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin-bottom: 0px;
`;

const ResumenTitle = styled.h1`
  color: #000;
  font-size: 44px;
  font-weight: 700;
  margin-bottom: 10px;
  margin-top: 0px;
`;

const ResumenText = styled.p`
  font-size: 18px;
  margin-bottom: 30px;
  font-weight: normal;
  max-width: 300px;
`;

const BackButton = styled.button`
  background-color: #007C89;
  color: white;
  border: none;
  border-radius: 19px;
  padding: 15px 80px;
  font-size: 16px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #006666;
  }
`;

const ResumenGrupos = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <ResumenWrapper>
      <Logo 
        src={`${process.env.PUBLIC_URL}/Talkylogo.png`} 
        alt="Logo" 
        onClick={handleLogoClick} 
      />
      <PlaneImage />
      <ResumenTitle>Buen Trabajo!</ResumenTitle>
      <ResumenText>Ya se han añadido a todos los miembros</ResumenText>
      <BackButton onClick={handleBackToDashboard}>Volver al inicio</BackButton>
    </ResumenWrapper>
  );
};

export default ResumenGrupos;
