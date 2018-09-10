import React from 'react';
import Web3Page from 'components/Web3Page';
import Proposals from 'components/Proposals';

const ProposalsPage = () => (
  <Web3Page title="Explore proposals" render={() => <Proposals />} />
);

export default ProposalsPage;
