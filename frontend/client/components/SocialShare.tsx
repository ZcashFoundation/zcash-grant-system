import React from 'react';
import './SocialShare.less';

interface TypeOptions {
  className: string;
  url: (url: string, title: string, text: string) => string;
}

const types: { [index: string]: TypeOptions } = {
  twitter: {
    className: 'fab fa-twitter-square',
    url: (url: string, _: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
  },
  reddit: {
    className: 'fab fa-reddit-square',
    url: (url: string, title: string) =>
      `https://reddit.com/submit?url=${url}&title=${title}`,
  },
  facebook: {
    className: 'fab fa-facebook-square',
    url: (url: string) => `http://www.facebook.com/sharer.php?u=${url}`,
  },
  linkedin: {
    className: 'fab fa-linkedin-square',
    url: (url: string, title: string, text: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${text}`,
  },
};

interface OwnProps {
  url: string;
  text: string;
  title: string;
}

type Props = OwnProps;

export default class SocialShare extends React.Component<Props> {
  render() {
    let { url, title, text } = this.props;
    url = url.replace(`localhost:${process.env.PORT}`, 'demo.grant.io');
    url = encodeURIComponent(url);
    title = encodeURIComponent(title);
    text = encodeURIComponent(text);
    return (
      <div className="SocialShare">
        {Object.keys(types).map(key => {
          const opts = types[key];
          return (
            <a
              target="popup"
              onClick={() => windowOpen(opts.url(url, title, text))}
              key={key}
              className={`SocialShare-button is-${key}`}
            >
              <i className={opts.className} />
            </a>
          );
        })}
      </div>
    );
  }
}

function windowOpen(url: string, name = 'Share', width = 550, height = 500) {
  const left =
    window.outerWidth / 2 + (window.screenX || window.screenLeft || 0) - width / 2;
  const top =
    window.outerHeight / 2 + (window.screenY || window.screenTop || 0) - height / 2;

  const config: { [index: string]: any } = {
    height,
    width,
    left,
    top,
    location: 'no',
    toolbar: 'no',
    status: 'no',
    directories: 'no',
    menubar: 'no',
    scrollbars: 'yes',
    resizable: 'no',
    centerscreen: 'yes',
    chrome: 'yes',
  };

  const shareDialog = window.open(
    url,
    name,
    Object.keys(config)
      .map(key => `${key}=${config[key]}`)
      .join(', '),
  );

  return shareDialog;
}
