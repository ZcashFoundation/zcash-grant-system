import React from 'react';
import styled from 'styled-components';
import { convert, markdownStyles } from 'utils/markdown';

const MarkdownContainer = styled.div`
  ${markdownStyles};
`;

interface Props extends React.HTMLAttributes<any> {
  source: string;
}

export default class Markdown extends React.PureComponent<Props> {
  render() {
    const { source, ...rest } = this.props;
    const html = convert(source);
    return <MarkdownContainer {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
  }
}
