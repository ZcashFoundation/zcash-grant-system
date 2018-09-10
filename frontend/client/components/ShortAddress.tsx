import React from 'react';
import styled from 'styled-components';

interface Props {
  address: string;
}

const ShortAddress = ({ address }: Props) => (
  <Container>
    <Bookend>{address.substr(0, 7)}</Bookend>
    <Middle>{address.substr(7, address.length - 5)}</Middle>
    <Bookend>{address.substr(address.length - 5)}</Bookend>
  </Container>
);

export default ShortAddress;

const Container = styled.div`
  display: flex;
  flex-wrap: nowrap;
  text-align: left;
`;

const Middle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto;
`;

const Bookend = styled.div`
  flex: 0 0 auto;
  white-space: nowrap;
`;
