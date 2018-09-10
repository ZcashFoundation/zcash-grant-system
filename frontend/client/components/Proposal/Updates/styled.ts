import styled from 'styled-components';

export const Update = styled.div`
  position: relative;
  margin-bottom: 3rem;
`;

export const Title = styled.h3`
  font-size: 2rem;
  margin-bottom: 0.2rem;
`;

export const Date = styled.div`
  font-size: 1.1rem;
  opacity: 0.5;
  margin-bottom: 1.5rem;
`;

export const BodyPreview = styled.div`
  font-size: 1.1rem;
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
`;

export const ControlButton = styled.a`
  font-size: 0.7rem;

  &:after {
    content: '';
    display: inline-block;
    margin: 0 0.5rem;
    vertical-align: middle;
    width: 2px;
    height: 2px;
    border-radius: 100%;
    background: #888;
  }

  &:last-child:after {
    display: none;
  }
`;

export const NoUpdates = styled.h3`
  text-align: center;
  font-size: 3rem;
  line-height: 10rem;
  opacity: 0.5;
`;
