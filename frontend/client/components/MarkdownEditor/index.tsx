import React from 'react';
import ReactMde, { ReactMdeTypes } from 'react-mde';
import { convert } from 'utils/markdown';
import * as Styled from './styled';

interface Props {
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
    return Promise.resolve(convert(md));
  };

  render() {
    return (
      <Styled.Container>
        <ReactMde
          onChange={this.handleChange}
          editorState={this.state.mdeState}
          generateMarkdownPreview={this.generatePreview}
          layout="tabbed"
        />
      </Styled.Container>
    );
  }
}
