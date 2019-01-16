import React, { PureComponent } from 'react';
import './index.less';

interface OwnProps {
  markdown: string;
}

type Props = OwnProps;

export default class MarkdownPage extends PureComponent<Props> {
  render() {
    const { markdown } = this.props;
    return (
      <div
        className="MarkdownPage"
        dangerouslySetInnerHTML={{
          __html: markdown,
        }}
      />
    );
  }
}
