import React from 'react';
import ReactMde, { ReactMdeTypes } from 'react-mde';
import Showdown from 'showdown';
import * as Styled from './styled';
import { Input } from 'antd';
import { Row, Col } from 'antd';

import { InputNumber } from 'antd';
import Form from './Form';

export interface AppState {
  mdeState: ReactMdeTypes.MdeState;
}

export default class App extends React.Component<{}, AppState> {
  converter: Showdown.Converter;

  constructor(props: {}) {
    super(props);
    this.state = {
      mdeState: null,
    };
    this.converter = new Showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
    });
  }

  handleValueChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({ mdeState });
  };

  onChange = () => {};

  render() {
    // https://github.com/andrerpena/react-mde
    return (
      <div>
        <Row gutter={16}>
          <Form />

          <Col xs={32} sm={28} md={24} lg={20} xl={18}>
            <Styled.Header>Create a new proposal! </Styled.Header>
            <InputNumber
              size="large"
              min={1}
              max={100000}
              defaultValue={3}
              onChange={this.onChange}
            />

            <Input
              size="large"
              placeholder="My Awesome Proposal"
              onChange={this.onChange}
            />

            <ReactMde
              onChange={this.handleValueChange}
              editorState={this.state.mdeState}
              generateMarkdownPreview={markdown =>
                Promise.resolve(this.converter.makeHtml(markdown))
              }
            />
          </Col>
        </Row>
      </div>
    );
  }
}
