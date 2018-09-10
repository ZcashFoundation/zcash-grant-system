import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { ThemeProvider, injectGlobal } from 'styled-components';
import theme from '../components/theme';

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  * {
    margin: 0;
	  padding: 0;
	  border: 0;
	  font-size: 100%;
  }
  html {
    font-size: 16px;

    @media (max-width: 900px) {
      font-size: 14px;
    }
    @media (max-width: 600px) {
      font-size: 12px;
    }

  }
`;

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }: { renderPage: (props: any) => void }) {
    const sheet = new ServerStyleSheet();
    const page = renderPage((App: any) => (props: any) =>
      sheet.collectStyles(<App {...props} />),
    );

    // @ts-ignore
    const styleTags = sheet.getStyleElement();
    // @ts-ignore
    return { ...page, styleTags };
  }

  render() {
    return (
      <html>
        <Head>
          <title>My page</title>
          {this.props.styleTags}
        </Head>
        <ThemeProvider theme={theme}>
          <body>
            <Main />
            <NextScript />
          </body>
        </ThemeProvider>
      </html>
    );
  }
}
