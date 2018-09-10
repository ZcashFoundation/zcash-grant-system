import React from 'react';
import ShortAddress from 'components/ShortAddress';
import Identicon from 'components/Identicon';
import * as Styled from './styled';

interface Props {
  address: string;
}

// TODO - don't hardcode monero image

const UserRow = ({ address }: Props) => (
  <Styled.Container>
    <Styled.Avatar>
      <Identicon address={address} />
    </Styled.Avatar>
    <Styled.Info>
      <Styled.InfoMain>
        <ShortAddress address={address} />
      </Styled.InfoMain>
      <Styled.InfoSecondary>{/* user.title */}</Styled.InfoSecondary>
    </Styled.Info>
  </Styled.Container>
);

export default UserRow;
