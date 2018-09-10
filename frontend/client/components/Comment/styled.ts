import styled from 'styled-components';

const infoHeight = '1.8rem';

export const Container = styled.div`
  position: relative;
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const Info = styled.div`
  display: flex;
  line-height: ${infoHeight};
  margin-bottom: 1rem;
`;

export const InfoThumb = styled.img`
  display: block;
  margin-right: 0.5rem;
  width: ${infoHeight};
  height: ${infoHeight};
  border-radius: 4px;
`;

export const InfoName = styled.div`
  font-size: 1.1rem;
  margin-right: 0.5rem;
`;

export const InfoTime = styled.div`
  font-size: 0.8rem;
  opacity: 0.5;
`;

export const Body = styled.div`
  font-size: 1rem;
`;

export const Controls = styled.div`
  display: flex;
  margin-left: -0.5rem;
`;

export const ControlButton = styled.a`
  font-size: 0.65rem;
  opacity: 0.5;
  padding: 0 0.5rem;
  background: none;
  cursor: pointer;
  color: #4c4c4c;

  &:hover {
    opacity: 0.7;
    color: inherit;
  }
`;

export const Replies = styled.div`
  margin: 1rem;
  padding: 1rem 0rem 1rem 2rem;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
`;
