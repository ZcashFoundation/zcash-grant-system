import styled from 'styled-components';

export const BodyField = styled.div`
  margin: 0 -10rem 0;

  @media (max-width: 980px) {
    margin: 0;
  }
`;

export const Title = styled.h1`
  border-bottom: 4px solid #ddd;
  font-size: 1.6rem;
  max-width: 15rem;
  margin: 0 auto 0.4rem;
  text-align: center;
`;

export const HelpText = styled.p`
  text-align: center;
  opacity: 0.4;
  margin-bottom: 2rem;
  font-size: 0.8rem;
`;

export const Success = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`;

export const SuccessIcon = styled.div`
  margin-right: 1rem;
  font-size: 4rem;
  color: #2ecc71;
`;

export const SuccessText = styled.div`
  font-size: 1.05rem;
`;
