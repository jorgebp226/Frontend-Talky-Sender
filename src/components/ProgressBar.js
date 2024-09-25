import React from 'react';
import styled, { keyframes } from 'styled-components';

const ProgressBarWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  margin-top: 20px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  height: 8px;
  position: relative;
`;

const ProgressFillAnimation = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  position: relative;
  transition: width 0.5s ease-in-out;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(90deg, rgba(96,165,250,0.5), rgba(96,165,250,0));
    animation: ${ProgressFillAnimation} 1s infinite;
  }
`;

const ProgressText = styled.div`
  color: #3b82f6;
  font-size: 14px;
  margin-right: 10px;
`;

const TimeLeftText = styled.div`
  color: #000;
  font-size: 14px;
  margin-top: 5px;
  text-align: center;
  width: 100%;
`;

const PauseButtonStyled = styled.button`
  background-color: ${props => props.isPaused ? '#3b82f6' : '#f56565'};
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  margin-left: 10px;
  min-width: 130px; /* Ajustar este valor según sea necesario */

  &:hover {
    background-color: ${props => props.isPaused ? '#60a5fa' : '#e53e3e'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// ProgressBar.js
const ProgressBar = ({ percentage, onPauseClick, isPaused, timeLeft, isResuming, showPauseButton = true }) => {
  return (
    <>
      <ProgressBarWrapper>
        <ProgressText>{percentage.toFixed(0)}%</ProgressText>
        <ProgressBarContainer>
          <ProgressBarFill percentage={percentage} />
        </ProgressBarContainer>
        {showPauseButton && (
          <PauseButtonStyled onClick={onPauseClick} isPaused={isPaused} disabled={isResuming}>
            {isResuming ? 'Reanudando...' : (isPaused ? 'Reanudar Envío' : 'Pausar Envío')}
          </PauseButtonStyled>
        )}
      </ProgressBarWrapper>
      <TimeLeftText>Tiempo pendiente estimado: {timeLeft.toFixed(0)} minutos</TimeLeftText>
    </>
  );
};

export default ProgressBar;
