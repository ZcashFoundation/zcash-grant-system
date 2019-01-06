import React from 'react';
import classnames from 'classnames';
import { mdToHtml } from 'util/md';
import './index.less';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  source: string;
}

export default class Markdown extends React.PureComponent<Props> {
  render() {
    const { source, ...rest } = this.props;
    const html = mdToHtml(source);
    // TS types seem to be fighting over react prop defs for div
    const divProps = rest as any;
    return (
      <div
        {...divProps}
        className={classnames('Markdown', divProps.className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}
