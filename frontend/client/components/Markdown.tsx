import React from 'react';
import { convert, MARKDOWN_TYPE } from 'utils/markdown';
import './Markdown.less';

interface Props extends React.HTMLAttributes<any> {
  source: string;
  type?: MARKDOWN_TYPE;
}

export default class Markdown extends React.PureComponent<Props> {
  render() {
    const { source, type, ...rest } = this.props;
    const html = convert(source, type);
    return (
      <div className="Markdown" {...rest} dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
}
