import React from 'react';
import ErrorScreen from './ErrorScreen';

interface Props {
  children: React.ReactNode;
  isFullscreen?: boolean;
}

interface State {
  error: Error | null;
}

export default class ErrorWrap extends React.Component<Props, State> {
  state: State = {
    error: null,
  };

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    let style;
    if (this.props.isFullscreen) {
      style = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        minHeight: '100vh',
        padding: '0 2rem',
      };
    }

    if (this.state.error) {
      return (
        <div style={style}>
          <ErrorScreen error={this.state.error} />
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}
