import React from 'react';
import { Spin, Icon } from 'antd';
import * as Styled from './styled';

interface State {
  email: string;
  isLoading: boolean;
  isSuccess: boolean;
}

export default class NewsletterForm extends React.PureComponent<{}, State> {
  state = {
    email: '',
    isLoading: false,
    isSuccess: false,
  };

  handleChange = (ev: React.FormEvent<HTMLInputElement>) => {
    this.setState({ email: ev.currentTarget.value });
  };

  handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (this.state.isLoading || this.state.isSuccess) {
      return;
    }

    this.setState({ isLoading: true });
    setTimeout(() => {
      this.setState({
        isLoading: false,
        isSuccess: true,
      });
    }, 3000);
  };

  render() {
    const { email, isLoading, isSuccess } = this.state;

    let buttonText = <span>Submit</span>;
    if (isLoading) {
      buttonText = (
        <Styled.ButtonIcon key="loading">
          <Spin indicator={<Icon spin type="loading" style={{ color: '#FFF' }} />} />
        </Styled.ButtonIcon>
      );
    } else if (isSuccess) {
      buttonText = (
        <Styled.ButtonIcon key="check">
          <Icon type="check" style={{ fontSize: 24 }} />
        </Styled.ButtonIcon>
      );
    }

    return (
      <Styled.Form onSubmit={this.handleSubmit}>
        <Styled.Input
          value={email}
          placeholder="email@example.com"
          onChange={this.handleChange}
          isSuccess={isSuccess}
        />
        <Styled.Button isLoading={isLoading} isSuccess={isSuccess}>
          {buttonText}
        </Styled.Button>
      </Styled.Form>
    );
  }
}
