import React from 'react';
import styled from 'styled-components';
import { convert, markdownStyles, MARKDOWN_TYPE } from 'utils/markdown';

const MarkdownContainer = styled.div`
  ${markdownStyles};
`;

interface Props extends React.HTMLAttributes<any> {
  source: string;
  type?: MARKDOWN_TYPE;
}

export default class Markdown extends React.PureComponent<Props> {
  render() {
    const { source, type, ...rest } = this.props;
    const html = convert(source, type);
    return <MarkdownContainer {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
  }
}
