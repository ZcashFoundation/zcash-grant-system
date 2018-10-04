import React from 'react';
import './Web3Error.less';

interface Props {
  icon?: string;
  message: React.ReactNode;
  button?: {
    text: React.ReactNode;
    href?: string;
    onClick?: (ev: React.MouseEvent<HTMLAnchorElement>) => void;
  };
}

const Web3Error: React.SFC<Props> = ({ icon, message, button }) => (
  <div className="Web3Error">
    {icon && <img className="Web3Error-icon" src={icon} />}
    <p className="Web3Error-message">{message}</p>
    {button && (
      <a
        className="Web3Error-button"
        onClick={button.onClick}
        href={button.href}
        target="_blank"
        rel="noopener nofollow"
      >
        {button.text}
      </a>
    )}
  </div>
);

export default Web3Error;
