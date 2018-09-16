import React from 'react';
import ShortAddress from 'components/ShortAddress';
import Identicon from 'components/Identicon';
import * as Styled from './styled';
import { Wei, fromWei } from 'utils/units';

interface Props {
  address: string;
  amount?: Wei;
}

const UserRow = ({ address, amount }: Props) => (
  <Styled.Container>
    <Styled.Avatar>
      <Identicon address={address} />
    </Styled.Avatar>
    <Styled.Info>
      <Styled.InfoMain>
        <ShortAddress address={address} />
      </Styled.InfoMain>
      {amount && (
        <Styled.InfoSecondary>{fromWei(amount, 'ether')} ETH</Styled.InfoSecondary>
      )}
    </Styled.Info>
  </Styled.Container>
);

export default UserRow;
