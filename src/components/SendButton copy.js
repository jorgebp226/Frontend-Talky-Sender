import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => (props.disabled ? (props.isSending ? 'green' : 'rgba(0, 123, 255, 0.5)') : '#007bff')};
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  border-radius: 4px;
  opacity: ${props => (props.disabled && !props.isSending ? '0.5' : '1')};
`;

const SendButton = ({ onClick, disabled, isSending }) => (
  <Button onClick={onClick} disabled={disabled || isSending} isSending={isSending}>
    {isSending ? 'Enviando...' : 'Enviar mensajes'}
  </Button>
);

export default SendButton;
