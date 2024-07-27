// components/Header.js
import React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  color: #333;
`;

const Header = () => (
  <HeaderWrapper>
    <Title>Talky Sender</Title>
  </HeaderWrapper>
);

export default Header;
