import React from 'react';
import ShortAddress from 'components/ShortAddress';
import Identicon from 'components/Identicon';
import * as Styled from './styled';

interface Props {
  address: string;
  secondary?: React.ReactNode;
}

const UserRow = ({ address, secondary }: Props) => (
  <Styled.Container>
    <Styled.Avatar>
      <Identicon address={address} />
    </Styled.Avatar>
    <Styled.Info>
      <Styled.InfoMain>
        <ShortAddress address={address} />
      </Styled.InfoMain>
      {secondary && <Styled.InfoSecondary>{secondary}</Styled.InfoSecondary>}
    </Styled.Info>
  </Styled.Container>
);

export default UserRow;
