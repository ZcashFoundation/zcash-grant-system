import * as React from 'react';
import { storiesOf } from '@storybook/react';

import 'components/UserRow/style.less';
import UserRow from 'components/UserRow';

const user = {
  name: 'Dana Hayes',
  title: 'QA Engineer',
  avatarUrl: 'https://randomuser.me/api/portraits/women/19.jpg',
  ethAddress: '0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520',
  emailAddress: 'test@test.test',
  socialAccounts: {},
};

const cases = [
  {
    disp: 'Full User',
    props: {
      user: {
        ...user,
      },
    },
  },
  {
    disp: 'ETH Address Only User',
    props: {
      user: {
        ...user,
        avatarUrl: '',
      },
    },
  },
  {
    disp: 'No Avatar, No ETH Address User',
    props: {
      user: {
        ...user,
        avatarUrl: '',
        ethAddress: '',
      },
    },
  },
  {
    disp: 'Long text user',
    props: {
      user: {
        ...user,
        name: 'Dr. Baron Longnamivitch von Testeronomous III Esq.',
        title: 'Amazing person, all around cool neat-o guy, 10/10 would order again',
      },
    },
  },
];

storiesOf('UserRow', module).add('all', () => (
  <div style={{ padding: '2em' }}>
    {cases.map(c => (
      <div key={c.disp} style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.9em', paddingBottom: '0.5rem' }}>{`${c.disp}`}</div>
        <UserRow {...c.props} />
      </div>
    ))}
  </div>
));
