import React from 'react';
import Web3Page from 'components/Web3Page';
import CreateProposal from 'components/CreateProposal';

const Create = () => (
  <Web3Page
    title="Create a Proposal"
    render={() => (
      <div style={{ maxWidth: 660, margin: '0 auto', alignSelf: 'center' }}>
        <CreateProposal />
      </div>
    )}
  />
);

export default Create;
