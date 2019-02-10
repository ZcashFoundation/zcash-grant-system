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
  readOnly?: boolean | null;
  type?: MARKDOWN_TYPE;
  initialMarkdown?: string;
  onChange(markdown: string): void;
}

interface State {
  randomKey: string;
  mdeState: ReactMdeTypes.MdeState | null;
}

export default class MarkdownEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const mdeState = props.initialMarkdown ? { markdown: props.initialMarkdown } : null;
    this.state = {
      mdeState,
      randomKey: Math.random().toString(),
    };
  }

  reset() {
    this.setState({
      randomKey: Math.random().toString(),
      mdeState: null,
    });
  }

  render() {
    const type = this.props.type || MARKDOWN_TYPE.FULL;
    const { readOnly } = this.props;
    const { mdeState, randomKey } = this.state;
    return (
      <div
        className={classnames({
          MarkdownEditor: true,
          ['is-reduced']: type === MARKDOWN_TYPE.REDUCED,
        })}
      >
        <ReactMde
          key={randomKey}
          onChange={this.handleChange}
          editorState={mdeState as ReactMdeTypes.MdeState}
          generateMarkdownPreview={this.generatePreview}
          commands={commands[type]}
          readOnly={!!readOnly}
          layout="tabbed"
        />
      </div>
    );
  }

  private handleChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({ mdeState });
    this.props.onChange(mdeState.markdown || '');
  };

  private generatePreview = (md: string) => {
    return Promise.resolve(convert(md, this.props.type));
  };
}

export { MARKDOWN_TYPE } from 'utils/markdown';
