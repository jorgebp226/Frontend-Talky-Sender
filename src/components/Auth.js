// Auth.js
import React, { useState } from 'react';
import styled from 'styled-components';

const AuthWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffe4e1;
`;

const AuthBox = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 100%;
  font-size: 16px;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;

  &:hover {
    background-color: #60a5fa;
  }
`;

const Auth = ({ children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const correctPassword = 'decincoaseisonTour@2024'; // Cambia esta contraseña a la que desees

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <AuthWrapper>
      <AuthBox>
        <Title>Welcome Back!!!</Title>
        <Form onSubmit={handleSubmit}>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Introduce la contraseña" 
          />
          <Button type="submit">Iniciar Sesión</Button>
        </Form>
      </AuthBox>
    </AuthWrapper>
  );
};

export default Auth;
