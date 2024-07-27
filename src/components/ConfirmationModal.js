// components/ConfirmationModal.js
import React from 'react';
import styled from 'styled-components';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Button = styled.button`
  background-color: ${props => (props.primary ? '#3b82f6' : '#f56565')};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 0 10px;
  min-width: 100px;

  &:hover {
    background-color: ${props => (props.primary ? '#60a5fa' : '#e53e3e')};
  }
`;

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <ModalBackground>
      <ModalContainer>
        <ModalTitle>{message}</ModalTitle>
        <ButtonContainer>
          <Button primary onClick={onConfirm}>
            Continuar
          </Button>
          <Button onClick={onCancel}>Cancelar</Button>
        </ButtonContainer>
      </ModalContainer>
    </ModalBackground>
  );
};

export default ConfirmationModal;
