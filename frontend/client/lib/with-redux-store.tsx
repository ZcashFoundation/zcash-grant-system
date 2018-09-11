import React from 'react';
import { AppState } from 'store/reducers';
import { configureStore } from 'store/configure';

const isServer = typeof window === 'undefined';
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

function getOrCreateStore(initialState?: Partial<AppState>) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return configureStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  const anyWindow = window as any;
  if (!anyWindow[__NEXT_REDUX_STORE__]) {
    anyWindow[__NEXT_REDUX_STORE__] = configureStore(initialState);
  }
  return anyWindow[__NEXT_REDUX_STORE__];
}

interface Props {
  initialReduxState: Partial<AppState>;
}

export default (App: any) => {
  return class AppWithRedux extends React.Component<Props> {
    static async getInitialProps(appContext: any) {
      // Get or Create the store with `undefined` as INITIAL_STATE
      // This allows you to set a custom default INITIAL_STATE
      const store = getOrCreateStore();

      // Provide the store to getInitialProps of pages
      appContext.ctx.store = store;

      let appProps = {};
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps.call(App, appContext);
      }

      return {
        ...appProps,
        initialReduxState: store.getState(),
      };
    }

    private store: any;
    constructor(props: Props) {
      super(props);
      this.store = getOrCreateStore(props.initialReduxState);
    }

    render() {
      return <App {...this.props} store={this.store} />;
    }
  };
};
