import React from 'react';
import * as Sentry from '@sentry/browser';
import { Button } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';
import Loader from 'components/Loader';
import './index.less';

interface Props {
  error: Error;
}

const isChunkError = (err: Error) => {
  return err.message.includes('Loading chunk');
};

export default class ErrorScreen extends React.PureComponent<Props> {
  componentDidMount() {
    const { error } = this.props;
    if (isChunkError(error)) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      Sentry.captureException(error);
      console.error('Error screen showing due to the following error:', error);
    }
  }

  render() {
    const { error } = this.props;
    if (isChunkError(error)) {
      return <Loader size="large" />;
    }

    return (
      <div className="ErrorScreen">
        <Exception
          type="404"
          title="Whoa nelly."
          desc={
            <div className="ErrorScreen-desc">
              <p>Something went wrong, and we've logged the following error:</p>
              <code className="ErrorScreen-desc-error">{error.message}</code>
              <p>
                Our developers will get right on fixing it. You can either return home and
                try again, or open an issue on Github to provide us some more details.
              </p>
            </div>
          }
          actions={
            <div className="ErrorScreen-buttons">
              <a href="/">
                <Button icon="home" size="large" type="primary">
                  Return home
                </Button>
              </a>
              <a href="https://github.com/grant-project/zcash-grant-system/issues/new">
                <Button icon="github" size="large">
                  Open an issue
                </Button>
              </a>
            </div>
          }
        />
      </div>
    );
  }
}
