import React from 'react';
import { Helmet } from 'react-helmet';

interface Props {
  title: string;
}

export default class BasicHead extends React.Component<Props> {
  render() {
    const { children, title } = this.props;
    return (
      <div>
        <Helmet>
          <title>{`Grant.io - ${title}`}</title>
          <meta name={`${title} page`} content={`${title} page stuff`} />
          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.2.0/css/all.css"
            integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ"
            crossOrigin="anonymous"
          />
        </Helmet>
        {children}
      </div>
    );
  }
}
