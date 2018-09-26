import React from 'react';
import ReactMde, { ReactMdeTypes, ReactMdeCommands, ReactMdeProps } from 'react-mde';
import classnames from 'classnames';
import { convert, MARKDOWN_TYPE } from 'utils/markdown';
import './style.less';

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
  initialMarkdown?: string;
  onChange(markdown: string): void;
}

interface State {
  mdeState: ReactMdeTypes.MdeState;
}

export default class MarkdownEditor extends React.PureComponent<Props, State> {
  state: State = {
    mdeState: null,
  };

  constructor(props: Props) {
    super(props);
    const mdeState = props.initialMarkdown ? { markdown: props.initialMarkdown } : null;
    this.state = { mdeState };
  }

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
      <div
        className={classnames({
          MarkdownEditor: true,
          ['is-reduced']: type === MARKDOWN_TYPE.REDUCED,
        })}
      >
        <ReactMde
          onChange={this.handleChange}
          editorState={this.state.mdeState}
          generateMarkdownPreview={this.generatePreview}
          commands={commands[type]}
          layout="tabbed"
        />
      </div>
    );
  }
}

export { MARKDOWN_TYPE } from 'utils/markdown';
