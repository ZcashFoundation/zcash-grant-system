import styled, { keyframes } from 'styled-components';

const errorOpen = keyframes`
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0rem);
    opacity: 1;
  }
`;

export const ErrorContainer = styled.div`
  text-align: center;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  animation: ${errorOpen} 500ms ease;
`;

export const ErrorIcon = styled.img`
  display: block;
  height: 120px;
  margin: 0 auto 2rem;
`;

export const ErrorMessage = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

export const ErrorMetamaskButton = styled.a`
  display: block;
  margin: 0 auto 2rem;
  padding: 0;
  height: 3rem;
  line-height: 3rem;
  max-width: 220px;
  font-size: 1.2rem;
  color: #fff;
  background: #f88500;
  border-radius: 4px;

  &:hover {
    color: #fff;
    opacity: 0.8;
  }
`;

export const PageLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 280px;
`;
