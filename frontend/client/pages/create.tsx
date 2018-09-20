import React from 'react';
import Web3Page from 'components/Web3Page';
import CreateFlow from 'components/CreateFlow';

const Create = () => (
  <Web3Page
    title="Create a Proposal"
    render={() => (
      <div style={{ paddingTop: '3rem', paddingBottom: '8rem' }}>
        <CreateFlow />
      </div>
    )}
    isFullScreen={true}
    hideFooter={true}
  />
);

export default Create;
