import styled from 'styled-components';

const headerHeight = '78px';
const smallQuery = '520px';

export const Placeholder = styled.div`
  height: ${headerHeight};
`;

export const Header = styled<{ isTransparent: boolean }, 'header'>('header')`
  position: ${(p: any) => (p.isTransparent ? 'absolute' : 'relative')};
  top: 0;
  left: 0;
  right: 0;
  height: ${headerHeight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3rem;
  z-index: 999;
  color: ${(p: any) => (p.isTransparent ? '#FFF' : '#333')};
  background: ${(p: any) => (p.isTransparent ? 'transparent' : '#FFF')};
  text-shadow: ${(p: any) => (p.isTransparent ? '0 2px 4px rgba(0, 0, 0, 0.4)' : 'none')};
  box-shadow: ${(p: any) => (p.isTransparent ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3)')};
`;

export const Title = styled.a`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.2rem;
  margin: 0;
  color: inherit;
  letter-spacing: 0.08rem;
  font-weight: 500;
  transition: transform 100ms ease;
  flex-grow: 1;
  text-align: center;

  &:hover,
  &:focus,
  &:active {
    color: inherit;
    transform: translateY(-2px) translate(-50%, -50%);
  }
`;

export const Button = styled.a`
  display: block;
  background: none;
  padding: 0;
  font-size: 1.2rem;
  font-weight: 300;
  color: inherit;
  letter-spacing: 0.05rem;
  cursor: pointer;
  transition: transform 100ms ease;

  &:hover,
  &:focus,
  &:active {
    transform: translateY(-1px);
    color: inherit;
  }
`;

interface ButtonTextProps {
  size?: number;
}

export const ButtonText = styled.span`
  @media (max-width: ${smallQuery}) {
    display: none;
  }
  font-size: ${(props: ButtonTextProps) => (props.size ? props.size + 'rem' : '1.1rem')};
`;

export const ButtonIcon = styled.span`
  padding-right: 10px;

  @media (max-width: ${smallQuery}) {
    padding: 0;
    font-weight: 400;
    font-size: 1.5rem;
  }
`;

export const AlphaBanner = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  background: linear-gradient(to right, #8e2de2, #4a00e0);
  color: #fff;
  width: 80px;
  height: 22px;
  border-radius: 11px;
  line-height: 22px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
`;
