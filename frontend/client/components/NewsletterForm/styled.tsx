import styled, { keyframes, css } from 'styled-components';

const smallWidth = '560px';
const inputHeight = '66px';

export const Form = styled.form`
  display: flex;
  position: relative;
  left: -10px;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: ${smallWidth}) {
    left: auto;
  }
`;

export const Input = styled.input`
  display: block;
  height: ${inputHeight};
  width: 100%;
  padding: 0 18px;
  background: #FFF;
  font-size: 1.3rem;
  font-weight: 300;
  letter-spacing: 0.1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: none;
  outline: none;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #333;
  transition: border 150ms ease, box-shadow 150ms ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.1);
  }

  &:focus,
  &:active {
    border-color: #3498DB;
  }

  ${p =>
    p.isSuccess &&
    css`
      &,
      &:hover,
      &:focus,
      &:active {
        border-color: #2ecc71;
      }
    `}

  @media (max-width: ${smallWidth}) {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    border-right: none;
  }
`;

export const Button = styled.button`
  display: block;
  position: absolute;
  top: 50%;
  right: 0;
  height: 48px;
  padding: 0;
  width: ${({ isLoading, isSuccess }: any) =>
    isLoading || isSuccess ? '48px' : '100px'};
  transform: translateX(50%) translateY(-50%);
  background: ${({ isSuccess }: any) => (isSuccess ? '#2ECC71' : '#3498DB')};
  color: #fff;
  border-radius: ${({ isLoading, isSuccess }: any) =>
    isLoading || isSuccess ? '100%' : '2px'};
  transition-property: border-radius, background, width, transform;
  transition-duration: 250ms;
  transition-timing-function: ease;
  text-align: center;
  cursor: pointer;
  outline: none;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 12px;
  letter-spacing: 0.2rem;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);

  @media (max-width: ${smallWidth}) {
    position: relative;
    top: auto;
    right: auto;
    width: 120px;
    height: ${inputHeight};
    border-radius: 2px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    transform: none;
    transition: none;
  }
`;

const iconPop = keyframes`
  0%, 20% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const ButtonIcon = styled.div`
  animation: ${iconPop} 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  letter-spacing: normal;
  transform-origin: 50%;
`;
