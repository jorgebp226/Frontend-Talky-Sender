// components/Logo.js
import React from 'react';
import styled from 'styled-components';
import logo from '../assets/images/logo-header.png'; // Ajusta la ruta al logo

const LogoWrapper = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
`;

const LogoImage = styled.img`
  width: 50px;
  height: 40px;
`;

const Logo = () => (
  <LogoWrapper>
    <LogoImage src={logo} alt="Logo" />
  </LogoWrapper>
);

export default Logo;
