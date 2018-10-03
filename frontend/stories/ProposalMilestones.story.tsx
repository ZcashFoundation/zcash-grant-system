import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Provider } from 'react-redux';

import { configureStore } from 'store/configure';
import { combineInitialState } from 'store/reducers';
import Milestones from 'components/Proposal/Milestones';
import { MILESTONE_STATE } from 'modules/proposals/reducers';
const { WAITING, ACTIVE, PAID, REJECTED } = MILESTONE_STATE;

import 'styles/style.less';
import 'components/Proposal/style.less';
import 'components/Proposal/Governance/style.less';
import { getProposalWithCrowdFund } from './props';

const msWaiting = { state: WAITING, isPaid: false };
const msPaid = { state: PAID, isPaid: true };
const msActive = { state: ACTIVE, isPaid: false };
const msRejected = { state: REJECTED, isPaid: false };

const dummyProposal = getProposalWithCrowdFund({});
const trustee = dummyProposal.crowdFund.beneficiary;
const contributor = dummyProposal.crowdFund.contributors[0].address;

const refundedProposal = getProposalWithCrowdFund({ amount: 5, funded: 5 });
refundedProposal.crowdFund.percentVotingForRefund = 100;

const geometryCases = [...Array(10).keys()].map(i =>
  getProposalWithCrowdFund({ milestoneCount: i + 1 }),
);

const cases: { [index: string]: any } = {
  // trustee - first
  ['not funded']: getProposalWithCrowdFund({
    amount: 5,
    funded: 0,
  }),
  ['first - waiting']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
  }),
  ['first - not paid']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [
      { state: PAID, isPaid: false, payoutRequestVoteDeadline: Date.now() },
      msWaiting,
      msWaiting,
    ],
  }),

  // trustee - second
  ['second - waiting']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msWaiting, msWaiting],
  }),
  ['second - active']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msActive, msWaiting],
  }),
  ['second - not paid']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [
      msPaid,
      { state: PAID, isPaid: false, payoutRequestVoteDeadline: Date.now() },
      msWaiting,
    ],
  }),
  ['second - no vote']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [
      msPaid,
      { state: ACTIVE, isPaid: false, percentAgainstPayout: 33 },
      msWaiting,
    ],
    contributorOverrides: [{ milestoneNoVotes: [false, true, false] }],
  }),
  ['second - rejected']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msRejected, msWaiting],
  }),

  // trustee - third
  ['final - waiting']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, msWaiting],
  }),
  ['final - active']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, msActive],
  }),
  ['final - not paid']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [
      msPaid,
      msPaid,
      { state: PAID, isPaid: false, payoutRequestVoteDeadline: Date.now() },
    ],
  }),
  ['final - no vote']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [
      msPaid,
      msPaid,
      { state: ACTIVE, isPaid: false, percentAgainstPayout: 33 },
    ],
    contributorOverrides: [{ milestoneNoVotes: [false, true, false] }],
  }),
  ['final - rejected']: getProposalWithCrowdFund({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, msRejected],
  }),

  // refunded
  ['refunded']: refundedProposal,
};

const initialStoreStateA = JSON.parse(JSON.stringify(combineInitialState));
initialStoreStateA.web3.accounts = [trustee];
const storeTrustee = configureStore(initialStoreStateA).store;

const initialStoreStateB = JSON.parse(JSON.stringify(combineInitialState));
initialStoreStateB.web3.accounts = [contributor];
const storeContributor = configureStore(initialStoreStateB).store;

const initialStoreStateC = JSON.parse(JSON.stringify(combineInitialState));
initialStoreStateC.web3.accounts = ['0x0'];
const storeOutsider = configureStore(initialStoreStateC).store;

const trusteeStories = storiesOf('Proposal/Milestones/trustee', module);

for (const key of Object.keys(cases)) {
  const value = cases[key];
  trusteeStories.add(key, () => (
    <div key={key} style={{ padding: '2em', display: 'flex' }}>
      <Provider store={storeTrustee}>
        <Milestones {...value} />
      </Provider>
    </div>
  ));
}

const contributorStories = storiesOf('Proposal/Milestones/contributor', module);

for (const key of Object.keys(cases)) {
  const value = cases[key];
  contributorStories.add(key, () => (
    <div key={key} style={{ padding: '2em', display: 'flex' }}>
      <Provider store={storeContributor}>
        <Milestones {...value} />
      </Provider>
    </div>
  ));
}

const outsiderStories = storiesOf('Proposal/Milestones/outsider', module);

for (const key of Object.keys(cases)) {
  const value = cases[key];
  outsiderStories.add(key, () => (
    <div key={key} style={{ padding: '2em', display: 'flex' }}>
      <Provider store={storeOutsider}>
        <Milestones {...value} />
      </Provider>
    </div>
  ));
}

const geometryStories = storiesOf('Proposal/Milestones/geometry', module);

geometryCases.forEach((gc, idx) =>
  geometryStories.add(`${idx + 1} steps`, () => (
    <div key={idx} style={{ padding: '3em', display: 'flex' }}>
      <Provider store={storeOutsider}>
        <Milestones {...gc} />
      </Provider>
    </div>
  )),
);
