import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ShortAddress from '../client/components/ShortAddress';

const containerWidths = ['100px', '150px', '200px', '300px', '400px'];

storiesOf('ShortAddress', module).add('widths', () => (
  <div style={{ padding: '2em' }}>
    {containerWidths.map(width => (
      <div key={width} style={{ padding: '5px' }}>
        <div style={{ fontSize: '0.8em', color: 'gray' }}>{width}</div>
        <div style={{ width, border: '1px solid gray' }}>
          <ShortAddress address="0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0" />
        </div>
      </div>
    ))}
  </div>
));
