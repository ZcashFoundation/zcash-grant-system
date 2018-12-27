import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { storiesOf } from '@storybook/react';
import { User } from 'types';

import 'components/UserRow/style.less';
import UserRow from 'components/UserRow';

const user: User = {
  userid: 123,
  displayName: 'Dana Hayes',
  title: 'QA Engineer',
  avatar: {
    imageUrl: 'https://randomuser.me/api/portraits/women/19.jpg',
  },
  emailAddress: 'test@test.test',
  socialMedias: [],
};

interface Case {
  disp: string;
  props: {
    user: User;
  };
}

const cases: Case[] = [
  {
    disp: 'Full User',
    props: {
      user: {
        ...user,
      },
    },
  },
  {
    disp: 'ZEC Address Only User',
    props: {
      user: {
        ...user,
        avatar: null,
      },
    },
  },
  {
    disp: 'No Avatar, No ZEC Address User',
    props: {
      user: {
        ...user,
        avatar: null,
      },
    },
  },
  {
    disp: 'Long text user',
    props: {
      user: {
        ...user,
        displayName: 'Dr. Baron Longnamivitch von Testeronomous III Esq.',
        title: 'Amazing person, all around cool neat-o guy, 10/10 would order again',
      },
    },
  },
];

storiesOf('UserRow', module).add('all', () => (
  <BrowserRouter>
    <div style={{ padding: '2em' }}>
      {cases.map(c => (
        <div key={c.disp} style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9em', paddingBottom: '0.5rem' }}>{`${c.disp}`}</div>
          <UserRow {...c.props} />
        </div>
      ))}
    </div>
  </BrowserRouter>
));
