import styled from 'styled-components';

export const Footer = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #fff;
  background: #4c4c4c;
  height: 140px;
`;

export const Title = styled.span`
  a {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #fff;
    transition: transform 100ms ease;

    &:hover,
    &:focus,
    &:active {
      transform: translateY(-1px);
      color: inherit;
    }
  }
`;

export const Links = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Link = styled.a`
  font-size: 1rem;
  padding: 0 1rem;
  color: #fff;
  opacity: 0.8;
  transition: opacity 100ms ease;

  &:hover {
    color: inherit;
    opacity: 1;
  }
`;
