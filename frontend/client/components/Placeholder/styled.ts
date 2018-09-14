import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #d9d9d9;
  padding: 3rem;
  border-radius: 8px;
`;

export const Title = styled.h3`
  margin-bottom: 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 1.6rem;

  & + div {
    margin-top: 1rem;
  }
`;

export const Subtitle = styled.div`
  color: rgba(0, 0, 0, 0.4);
  font-size: 1rem;
`;
