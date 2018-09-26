import React from 'react';
import Web3Page from 'components/Web3Page';
import CreateFlow from 'components/CreateFlow';

const Create = () => (
  <Web3Page
    title="Create a Proposal"
    render={({ accounts }) => (
      <div style={{ paddingTop: '3rem', paddingBottom: '8rem' }}>
        <CreateFlow accounts={accounts} />
      </div>
    )}
    isFullScreen={true}
    hideFooter={true}
  />
);

export default Create;
