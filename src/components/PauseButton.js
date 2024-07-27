import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => (props.isPaused ? 'green' : 'red')};
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  opacity: ${props => (props.disabled ? 0.7 : 1)};
`;

const PauseButton = ({ onClick, isPaused, isResuming }) => {
  return (
    <Button onClick={onClick} disabled={isResuming} isPaused={isPaused}>
      {isResuming ? 'Reanudando...' : (isPaused ? 'Reanudar Envío' : 'Pausar Envío')}
    </Button>
  );
};

export default PauseButton;