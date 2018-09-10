import React from 'react';
import Head from 'next/head';

import 'styles/style.less';

interface Props {
  title: string;
}

export default class BasicHead extends React.Component<Props> {
  render() {
    const { children, title } = this.props;
    return (
      <div>
        <Head>
          <title>Grant.io - {title}</title>
          {/*TODO - bundle*/}
          <link
            rel="stylesheet"
            href="https://use.fontawesome.com/releases/v5.2.0/css/all.css"
            integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ"
            crossOrigin="anonymous"
          />

          <link rel="stylesheet" href="/_next/static/style.css" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        {children}
      </div>
    );
  }
}
