import * as React from 'react';
import { storiesOf } from '@storybook/react';
import BN from 'bn.js';

import UnitDisplay from '../client/components/UnitDisplay';

const oneZEC = new BN('1000000000000000000');

const cases = [
  {
    disp: 'basic',
    props: { value: oneZEC.mul(new BN(25)), symbol: 'ZEC' },
  },
  {
    disp: 'fraction',
    props: { value: oneZEC.div(new BN(3)), symbol: 'ZEC' },
  },
  {
    disp: 'fraction - displayShortBalance: true',
    props: { value: oneZEC.div(new BN(3)), symbol: 'ZEC', displayShortBalance: true },
  },
  {
    disp: 'fraction - displayShortBalance: 2',
    props: { value: oneZEC.div(new BN(3)), symbol: 'ZEC', displayShortBalance: 2 },
  },
  {
    disp: 'fraction - displayShortBalance: 4, displayTrailingZeros: false',
    props: {
      value: oneZEC.div(new BN(2)),
      symbol: 'ZEC',
      displayShortBalance: 4,
      displayTrailingZeroes: false,
    },
  },
  {
    disp: 'fraction - displayShortBalance: 4, displayTrailingZeros: true',
    props: {
      value: oneZEC.div(new BN(2)),
      symbol: 'ZEC',
      displayShortBalance: 4,
      displayTrailingZeroes: true,
    },
  },
  {
    disp: 'tiny',
    props: { value: new BN(1), symbol: 'ZEC' },
  },
  {
    disp: 'tiny - displayShortBalance: true',
    props: {
      value: new BN(1),
      symbol: 'ZEC',
      displayShortBalance: true,
    },
  },
  {
    disp: 'tiny - displayShortBalance: 2',
    props: {
      value: new BN(1),
      symbol: 'ZEC',
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
