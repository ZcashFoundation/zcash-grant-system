import React from 'react';
import { Spin, Icon } from 'antd';
import classnames from 'classnames';
import './style.less';

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
        <div className="NewsletterForm-button-icon" key="loading">
          <Spin indicator={<Icon spin type="loading" style={{ color: '#FFF' }} />} />
        </div>
      );
    } else if (isSuccess) {
      buttonText = (
        <div className="NewsletterForm-button-icon" key="check">
          <Icon type="check" style={{ fontSize: 24 }} />
        </div>
      );
    }

    return (
      <form className="NewsletterForm" onSubmit={this.handleSubmit}>
        <input
          className={classnames({
            ['NewsletterForm-input']: true,
            ['is-success']: isSuccess,
          })}
          value={email}
          placeholder="email@example.com"
          onChange={this.handleChange}
        />
        <button
          className={classnames({
            ['NewsletterForm-button']: true,
            ['is-success']: isSuccess,
            ['is-loading']: isLoading,
          })}
        >
          {buttonText}
        </button>
      </form>
    );
  }
}
