import React from 'react';
import { Spin } from 'antd';
import Web3Container from 'lib/Web3Container';
import CreateFlow from 'components/CreateFlow';

const Create = () => (
  <Web3Container
    renderLoading={() => <Spin />}
    render={({ accounts }) => (
      <div style={{ paddingTop: '3rem', paddingBottom: '8rem' }}>
        <CreateFlow accounts={accounts} />
      </div>
    )}
  />
);

export default Create;
