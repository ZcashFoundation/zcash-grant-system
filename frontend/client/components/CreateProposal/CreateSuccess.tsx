import React from 'react';
import { Link } from 'react-router-dom';
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
        <Link to={`/proposals/${crowdFundCreatedAddress}`}>Click here</Link> to check it
        out.
      </div>
    </Styled.SuccessText>
  </Styled.Success>
);

export default CreateSuccess;
