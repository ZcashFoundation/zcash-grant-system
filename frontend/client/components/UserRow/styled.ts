import styled from 'styled-components';

const height = '3rem';

export const Container = styled.div`
  position: relative;
  display: flex;
  height: ${height};
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const Avatar = styled.div`
  display: block;
  height: ${height};
  width: ${height};
  margin-right: 0.75rem;

  img {
    width: 100%;
    border-radius: 4px;
  }
`;

export const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

export const InfoMain = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.1rem;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InfoSecondary = styled.p`
  font-size: 0.9rem;
  opacity: 0.7;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
