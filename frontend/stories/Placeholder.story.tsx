import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Placeholder from '../client/components/Placeholder';

storiesOf('Placeholder', module)
  .add('basic', () => (
    <div style={{ padding: '2em' }}>
      <Placeholder
        title="This Is a Placeholder Title"
        subtitle="Subtitle. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
      />
    </div>
  ))
  .add('styled', () => (
    <div style={{ padding: '2em' }}>
      <Placeholder
        style={{ borderColor: 'green', width: '35em' }}
        title="Styled Placeholder Title"
        subtitle="Subtitle. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
      />
    </div>
  ));
