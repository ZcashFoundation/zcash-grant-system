import React from 'react';
import ReactMde, { ReactMdeTypes, ReactMdeCommands, ReactMdeProps } from 'react-mde';
import { convert, MARKDOWN_TYPE } from 'utils/markdown';
import * as Styled from './styled';

const commands: { [key in MARKDOWN_TYPE]: ReactMdeProps['commands'] } = {
  [MARKDOWN_TYPE.FULL]: [
    [
      ReactMdeCommands.headerCommand,
      ReactMdeCommands.boldCommand,
      ReactMdeCommands.italicCommand,
      ReactMdeCommands.codeCommand,
      ReactMdeCommands.strikethroughCommand,
    ],
    [
      ReactMdeCommands.linkCommand,
      ReactMdeCommands.quoteCommand,
      ReactMdeCommands.imageCommand,
    ],
    [ReactMdeCommands.orderedListCommand, ReactMdeCommands.unorderedListCommand],
  ],
  [MARKDOWN_TYPE.REDUCED]: [
    [
      ReactMdeCommands.boldCommand,
      ReactMdeCommands.italicCommand,
      ReactMdeCommands.codeCommand,
      ReactMdeCommands.strikethroughCommand,
    ],
    [ReactMdeCommands.linkCommand, ReactMdeCommands.quoteCommand],
    [ReactMdeCommands.orderedListCommand, ReactMdeCommands.unorderedListCommand],
  ],
};

interface Props {
  type?: MARKDOWN_TYPE;
  onChange(markdown: string): void;
}

interface State {
  mdeState: ReactMdeTypes.MdeState;
}

export default class MarkdownEditor extends React.PureComponent<Props, State> {
  state: State = {
    mdeState: null,
  };

  handleChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({ mdeState });
    this.props.onChange(mdeState.markdown);
  };

  generatePreview = (md: string) => {
    return Promise.resolve(convert(md, this.props.type));
  };

  render() {
    const type = this.props.type || MARKDOWN_TYPE.FULL;
    return (
      <Styled.Container type={type}>
        <ReactMde
          onChange={this.handleChange}
          editorState={this.state.mdeState}
          generateMarkdownPreview={this.generatePreview}
          commands={commands[type]}
          layout="tabbed"
        />
      </Styled.Container>
    );
  }
}

export { MARKDOWN_TYPE } from 'utils/markdown';
