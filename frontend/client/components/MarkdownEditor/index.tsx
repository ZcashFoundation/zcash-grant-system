import React from 'react';
import ReactMde, { commands as ReactMdeCommands, ReactMdeProps } from 'react-mde';
import classnames from 'classnames';
import { convert, MARKDOWN_TYPE } from 'utils/markdown';
import './style.less';

const commands: { [key in MARKDOWN_TYPE]: ReactMdeProps['commands'] } = {
  [MARKDOWN_TYPE.FULL]: [
    {
      commands: [
        ReactMdeCommands.headerCommand,
        ReactMdeCommands.boldCommand,
        ReactMdeCommands.italicCommand,
        ReactMdeCommands.codeCommand,
        ReactMdeCommands.strikeThroughCommand,
      ],
    },
    {
      commands: [
        ReactMdeCommands.linkCommand,
        ReactMdeCommands.quoteCommand,
        ReactMdeCommands.imageCommand,
      ],
    },
    {
      commands: [
        ReactMdeCommands.orderedListCommand,
        ReactMdeCommands.unorderedListCommand,
      ],
    },
  ],
  [MARKDOWN_TYPE.REDUCED]: [
    {
      commands: [
        ReactMdeCommands.boldCommand,
        ReactMdeCommands.italicCommand,
        ReactMdeCommands.codeCommand,
        ReactMdeCommands.strikeThroughCommand,
      ],
    },
    {
      commands: [
        ReactMdeCommands.linkCommand,
        ReactMdeCommands.quoteCommand,
      ],
    },
    {
      commands: [
        ReactMdeCommands.orderedListCommand,
        ReactMdeCommands.unorderedListCommand,
      ],
    },
  ],
};

interface Props {
  minHeight: number;
  readOnly?: boolean | null;
  type?: MARKDOWN_TYPE;
  initialMarkdown?: string;
  onChange(markdown: string): void;
}

interface State {
  randomKey: string;
  value: string;
  tab: 'write' | 'preview';
}

export default class MarkdownEditor extends React.PureComponent<Props, State> {
  private el: HTMLElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      randomKey: Math.random().toString(),
      value: props.initialMarkdown || '',
      tab: 'write',
    };
  }

  reset() {
    this.setState({
      randomKey: Math.random().toString(),
      value: '',
      tab: 'write',
    });
    this.resetEditorSize();
  }

  componentDidMount() {
    this.resizeEditor();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.minHeight !== this.props.minHeight) {
      this.resetEditorSize();
    }
  }

  render() {
    const type = this.props.type || MARKDOWN_TYPE.FULL;
    const { readOnly, minHeight } = this.props;
    const { randomKey, value, tab } = this.state;
    return (
      <div
        ref={(el) => this.el = el}
        className={classnames({
          MarkdownEditor: true,
          ['is-reduced']: type === MARKDOWN_TYPE.REDUCED,
        })}
      >
        <ReactMde
          key={randomKey}
          value={value}
          selectedTab={tab}
          onChange={this.handleChange}
          onTabChange={this.handleTabChange}
          generateMarkdownPreview={this.generatePreview}
          commands={commands[type]}
          readOnly={!!readOnly}
          minEditorHeight={minHeight}
          minPreviewHeight={minHeight - 10}
          maxEditorHeight={99999}
        />
      </div>
    );
  }

  private handleChange = (value: string) => {
    this.props.onChange(value || '');
    this.setState({ value }, this.resizeEditor);
  };

  private handleTabChange = (tab: 'write' | 'preview') => {
    this.setState({ tab }, () => {
      if (this.state.tab === 'write') {
        this.resetEditorSize();
      }
    });
  };

  private generatePreview = (md: string) => {
    return Promise.resolve(convert(md, this.props.type));
  };

  // Sizes it up, not down
  private resizeEditor = () => {
    if (!this.el) {
      return;
    }

    const textarea = this.el.querySelector('.mde-text');
    if (!textarea) {
      return;
    }

    const minHeight = Math.max(this.props.minHeight, textarea.scrollHeight);
    textarea.setAttribute('style', `height: ${minHeight}px`);
  };

  private resetEditorSize = () => {
    if (!this.el) {
      return;
    }

    const textarea = this.el.querySelector('.mde-text');
    if (!textarea) {
      return;
    }

    textarea.setAttribute('style', 'height: auto');
    this.resizeEditor();
  };
}

export { MARKDOWN_TYPE } from 'utils/markdown';
