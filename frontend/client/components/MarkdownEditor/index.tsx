import React from 'react';
import ReactMde, { ReactMdeTypes, DraftUtil } from 'react-mde';
import Showdown from 'showdown';

interface Props {
  onChange(markdown: string): void;
}

interface State {
  mdeState: ReactMdeTypes.MdeState;
}

export default class MarkdownEditor extends React.PureComponent<Props, State> {
  converter: Showdown.Converter;

  constructor(props: Props) {
    super(props);
    this.state = { mdeState: null };
    this.converter = new Showdown.Converter({ simplifiedAutoLink: true });
  }

  handleChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({ mdeState });
    this.props.onChange(mdeState.markdown);
  };

  generatePreview = (md: string) => {
    return Promise.resolve(this.converter.makeHtml(md));
  };

  render() {
    return (
      <ReactMde
        onChange={this.handleChange}
        editorState={this.state.mdeState}
        generateMarkdownPreview={this.generatePreview}
        layout="tabbed"
      />
    );
  }
}
