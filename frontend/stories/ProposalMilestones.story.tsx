import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Provider } from 'react-redux';

import { configureStore } from 'store/configure';
import { combineInitialState } from 'store/reducers';
import Milestones from 'components/Proposal/Milestones';
import { MILESTONE_STAGE } from 'types';
const { IDLE, ACCEPTED, PAID, REJECTED } = MILESTONE_STAGE;

import 'styles/style.less';
import 'components/Proposal/style.less';
import 'components/Proposal/Governance/style.less';
import { generateProposal } from './props';

const msWaiting = { stage: IDLE };
const msPaid = { stage: PAID };
const msActive = { stage: ACCEPTED };
const msRejected = { stage: REJECTED };

const trustee = 'z123';
const contributor = 'z456';

const geometryCases = [...Array(10).keys()].map(i =>
  generateProposal({ milestoneCount: i + 1 }),
);

const cases: { [index: string]: any } = {
  // trustee - first
  ['not funded']: generateProposal({
    amount: 5,
    funded: 0,
  }),
  ['first - waiting']: generateProposal({
    amount: 5,
    funded: 5,
  }),
  ['first - not paid']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [{ stage: PAID }, msWaiting, msWaiting],
  }),

  // trustee - second
  ['second - waiting']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msWaiting, msWaiting],
  }),
  ['second - active']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msActive, msWaiting],
  }),
  ['second - not paid']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, { stage: PAID }, msWaiting],
  }),
  ['second - no vote']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, { stage: ACCEPTED }, msWaiting],
    contributorOverrides: [{ milestoneNoVotes: [false, true, false] }],
  }),
  ['second - rejected']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msRejected, msWaiting],
  }),

  // trustee - third
  ['final - waiting']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, msWaiting],
  }),
  ['final - active']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, msActive],
  }),
  ['final - not paid']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, { stage: PAID }],
  }),
  ['final - no vote']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, { stage: ACCEPTED }],
    contributorOverrides: [{ milestoneNoVotes: [false, true, false] }],
  }),
  ['final - rejected']: generateProposal({
    amount: 5,
    funded: 5,
    milestoneOverrides: [msPaid, msPaid, msRejected],
  }),
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
