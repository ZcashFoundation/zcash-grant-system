import React from 'react';
import { convert, MARKDOWN_TYPE } from 'utils/markdown';
import './Markdown.less';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  source: string;
  type?: MARKDOWN_TYPE;
}

export default class Markdown extends React.PureComponent<Props> {
  render() {
    const { source, type, ...rest } = this.props;
    const html = convert(source, type);
    // TS types seem to be fighting over react prop defs for div
    const divProps = rest as any;
    return (
      <div
        className="Markdown"
        {...divProps}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}
