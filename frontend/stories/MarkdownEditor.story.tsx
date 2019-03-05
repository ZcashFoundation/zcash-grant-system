import * as React from 'react';
import { storiesOf } from '@storybook/react';

import MarkdownEditor from 'components/MarkdownEditor';
import { MARKDOWN_TYPE } from 'utils/markdown';

const initialMarkdown = `
### Initial Markdown
Ut enim ad **minima** veniam, quis nostrum _exercitationem_ ullam 
corporis suscipit ~~laboriosam~~, nisi ut aliquid ex ea commodi 
consequatur?
1. Dog
1. Cat
1. Stomatopoda

- Orange
- Apple
- Durian
`;

storiesOf('MarkdownEditor', module)
  .add('basic', () => (
    <div style={{ padding: '2em' }}>
      <MarkdownEditor onChange={_ => null} minHeight={200} />
    </div>
  ))
  .add('initial markdown', () => (
    <div style={{ padding: '2em' }}>
      <MarkdownEditor
        initialMarkdown={initialMarkdown}
        onChange={_ => null}
        minHeight={200}
      />
    </div>
  ))
  .add('type - reduced', () => (
    <div style={{ padding: '2em' }}>
      <MarkdownEditor
        type={MARKDOWN_TYPE.REDUCED}
        initialMarkdown={initialMarkdown}
        onChange={_ => null}
        minHeight={200}
      />
    </div>
  ));
