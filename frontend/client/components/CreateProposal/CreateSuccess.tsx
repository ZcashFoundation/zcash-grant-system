import React from 'react';
import Link from 'next/link';
import { Icon } from 'antd';
import * as Styled from './styled';

interface Props {
  crowdFundCreatedAddress: string;
}

const CreateSuccess = ({ crowdFundCreatedAddress }: Props) => (
  <Styled.Success>
    <Styled.SuccessIcon>
      <Icon type="check-circle-o" />
    </Styled.SuccessIcon>
    <Styled.SuccessText>
      <h2>Contract was succesfully deployed!</h2>
      <div>
        Your proposal is now live and on the blockchain!{' '}
        <Link href={`/proposals/${crowdFundCreatedAddress}`}>
          <a>Click here</a>
        </Link>{' '}
        to check it out.
      </div>
    </Styled.SuccessText>
  </Styled.Success>
);

export default CreateSuccess;
