import React from 'react';
import './SocialShare.less';
import { Modal } from 'antd';
import CopyInput from 'components/CopyInput';

interface TypeOptions {
  className: string;
  humanName: string;
  url: (url: string, title: string, text: string) => string;
}

const types: { [index: string]: TypeOptions } = {
  twitter: {
    humanName: 'Twitter',
    className: 'fab fa-twitter',
    url: (url: string, _: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
  },
  reddit: {
    humanName: 'Reddit',
    className: 'fab fa-reddit',
    url: (url: string, title: string) =>
      `https://reddit.com/submit?url=${url}&title=${title}`,
  },
  facebook: {
    humanName: 'Facebook',
    className: 'fab fa-facebook',
    url: (url: string) => `http://www.facebook.com/sharer.php?u=${url}`,
  },
  linkedin: {
    humanName: 'LinkedIn',
    className: 'fab fa-linkedin',
    url: (url: string, title: string, text: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${text}`,
  },
};

interface OwnProps {
  url: string;
  text: string;
  title: string;
}

interface State {
  openModal: boolean;
  socialKey: string;
}

type Props = OwnProps;

export default class SocialShare extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      openModal: false,
      socialKey: 'twitter',
    };
  }

  render() {
    let { url, title, text } = this.props;
    const { openModal, socialKey } = this.state;
    url = url.replace(`localhost:${process.env.PORT}`, 'grants.zfnd.org');
    url = encodeURIComponent(url);
    title = encodeURIComponent(title);
    text = encodeURIComponent(text);
    return (
      <div className="SocialShare">
        <Modal
          title={
            <a className={`SocialShare-icon is-${socialKey}`}>
              <i className={types[socialKey].className} />
              {' ' + types[socialKey].humanName}
            </a>
          }
          visible={openModal}
          footer={null}
          onCancel={() => this.setState({ openModal: false })}
        >
          <CopyInput label={''} value={types[socialKey].url(url, title, text)} />
        </Modal>
        {Object.keys(types).map(key => {
          const opts = types[key];
          return (
            <a
              onClick={() =>
                this.setState({
                  openModal: true,
                  socialKey: key,
                })
              }
              key={key}
              className={`SocialShare-button is-${key}`}
            >
              <i className={opts.className + '-square'} />
            </a>
          );
        })}
      </div>
    );
  }
}
