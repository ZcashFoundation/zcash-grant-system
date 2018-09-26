import * as React from 'react';
import { storiesOf } from '@storybook/react';
import BN from 'bn.js';

import UnitDisplay from '../client/components/UnitDisplay';

const oneEth = new BN('1000000000000000000');

const cases = [
  {
    disp: 'basic',
    props: { value: oneEth.mul(new BN(25)), symbol: 'ETH' },
  },
  {
    disp: 'fraction',
    props: { value: oneEth.div(new BN(3)), symbol: 'ETH' },
  },
  {
    disp: 'fraction - displayShortBalance: true',
    props: { value: oneEth.div(new BN(3)), symbol: 'ETH', displayShortBalance: true },
  },
  {
    disp: 'fraction - displayShortBalance: 2',
    props: { value: oneEth.div(new BN(3)), symbol: 'ETH', displayShortBalance: 2 },
  },
  {
    disp: 'fraction - displayShortBalance: 4, displayTrailingZeros: false',
    props: {
      value: oneEth.div(new BN(2)),
      symbol: 'ETH',
      displayShortBalance: 4,
      displayTrailingZeroes: false,
    },
  },
  {
    disp: 'fraction - displayShortBalance: 4, displayTrailingZeros: true',
    props: {
      value: oneEth.div(new BN(2)),
      symbol: 'ETH',
      displayShortBalance: 4,
      displayTrailingZeroes: true,
    },
  },
  {
    disp: 'tiny',
    props: { value: new BN(1), symbol: 'ETH' },
  },
  {
    disp: 'tiny - displayShortBalance: true',
    props: {
      value: new BN(1),
      symbol: 'ETH',
      displayShortBalance: true,
    },
  },
  {
    disp: 'tiny - displayShortBalance: 2',
    props: {
      value: new BN(1),
      symbol: 'ETH',
      displayShortBalance: 2,
    },
  },
];

storiesOf('UnitDisplay', module).add('all', () => (
  <div style={{ padding: '2em' }}>
    {cases.map(c => (
      <div key={c.disp}>
        <div style={{ fontSize: '0.9em', paddingTop: '0.6em' }}>{`${c.disp}`}</div>
        <div
          style={{
            padding: '0 0.5em',
            border: '1px solid gray',
            display: 'inline-block',
          }}
        >
          <UnitDisplay {...c.props} />
        </div>
      </div>
    ))}
  </div>
));
