import App, { Container } from 'next/app';
import React from 'react';

import { Provider } from 'react-redux';
import withReduxSaga from 'next-redux-saga';
import withReduxStore from 'lib/with-redux-store';

interface Props {
  Component: any;
  ctx: any;
}

class MyApp extends App {
  static async getInitialProps({ Component, ctx }: Props) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  props: any;

  render() {
    const { Component, pageProps, store } = this.props;

    return (
      <Container>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withReduxStore(withReduxSaga({ async: true })(MyApp));
