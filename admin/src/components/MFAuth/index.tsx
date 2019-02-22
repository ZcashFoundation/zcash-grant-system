import React, { ReactNode } from 'react';
import { Link, Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import { view } from 'react-easy-state';
import CopyToClipboard from 'react-copy-to-clipboard';
import QRCode from 'qrcode.react';
import { Input, Button, Alert, Spin, message, Card, Icon } from 'antd';
import store, {
  get2fa,
  get2faInit,
  post2faEnable,
  post2faVerify,
  refresh,
  handleApiError,
} from 'src/store';
import { downloadString } from 'src/util/file';
import './index.less';

interface OwnProps {
  isReset?: boolean;
}

type Props = OwnProps & RouteComponentProps<any>;

const STATE = {
  // remote
  isLoginFresh: false,
  has2fa: false,
  backupCodes: [],
  totpSecret: '',
  totpUri: '',
  is2faAuthed: false,
  backupCodeCount: 0,
  isEmailVerified: false,
  // local
  loaded: false,
  stepOutlineComplete: false,
  initializing: false,
  stepRecoveryCodesComplete: false,
  stepTotpComplete: false,
  password: '',
  verifyCode: '',
  isVerifying: false,
  showQrCode: true,
};
type State = typeof STATE;

class MFAuth extends React.Component<Props, State> {
  state = STATE;
  componentDidMount() {
    this.update2faStateFromServer();
  }
  render() {
    const {
      loaded,
      stepOutlineComplete,
      password,
      stepRecoveryCodesComplete,
      stepTotpComplete,
      verifyCode,
      isLoginFresh,
      has2fa,
      is2faAuthed,
      backupCodes,
      initializing,
      totpSecret,
      totpUri,
      showQrCode,
      isVerifying,
      backupCodeCount,
      isEmailVerified,
    } = this.state;
    const { isReset } = this.props;

    const emailNotVerifiedWarning = loaded &&
      !isEmailVerified && (
        <Alert
          type="error"
          message={
            <>
              You must <b>verify your email</b> in order to act as admin. You should have
              received an email with instructions when you signed up.
            </>
          }
        />
      );

    const lowBackupCodesWarning = loaded &&
      has2fa &&
      backupCodeCount < 5 && (
        <Alert
          type="error"
          message={
            <>
              You only have <b>{backupCodeCount}</b> recovery codes remaining! Generate
              new codes after you sign-in.
            </>
          }
        />
      );

    const wrap = (children: ReactNode) => (
      <div className="MFAuth">
        {emailNotVerifiedWarning || (
          <>
            <h1>
              {isReset ? 'Reset two-factor authentication' : 'Two-factor authentication'}
            </h1>
            {children}
          </>
        )}
      </div>
    );

    // LOADING
    if (!loaded) {
      return wrap(<Spin tip="Loading security details..." />);
    }

    // STEP 0. (if login is stale)
    if ((!has2fa || isReset) && !isLoginFresh) {
      return wrap(
        <>
          <h2>
            <Icon type="unlock" /> Please verify your password
          </h2>
          <p>
            Too much time has elapsed since you last affirmed your credentials, please
            enter your password below.
          </p>

          <div className="MFAuth-controls">
            <Input.Password
              onPressEnter={this.handleSubmitPassword}
              onChange={e => this.setState({ password: e.target.value })}
              value={password}
              autoFocus={true}
            />
            <Button
              type="primary"
              onClick={this.handleSubmitPassword}
              disabled={password.length === 0}
            >
              Submit
            </Button>
          </div>
        </>,
      );
    }

    // STEP 1 (outline)
    if ((!has2fa || isReset) && !stepOutlineComplete) {
      return wrap(
        <div>
          {!has2fa && (
            <Alert
              type="info"
              message={<>Administration requires two-factor authentication setup.</>}
            />
          )}
          {isReset && (
            <Alert
              type="warning"
              message={
                <>
                  Your current recovery codes and authenticator app setup will be
                  invalidated when you continue.
                </>
              }
            />
          )}
          <h2>1. Two-factor Authentication Setup</h2>
          <p>Please be prepared to perform the following steps:</p>
          <ol>
            <li>Save two-factor recovery codes</li>
            <li>
              Setup up TOTP authentication device, typically a smartphone with Google
              Authenticator, Authy, 1Password or other compatible authenticator app.
            </li>
          </ol>
          <div className="MFAuth-controls">
            {isReset && <Button onClick={this.handleCancel}>Cancel</Button>}
            <Button onClick={this.handleReadSetup} type="primary">
              I'm ready
            </Button>
          </div>
        </div>,
      );
    }

    // STEP 2 (recovery codes)
    if ((!has2fa || isReset) && !stepRecoveryCodesComplete) {
      return wrap(
        ((initializing || !backupCodes.length) && (
          <Spin tip="Loading 2fa setup..." />
        )) || (
          <div>
            <h2>2. Recovery codes</h2>
            <p>
              Please copy, download or print these codes and keep them safe. Treat them
              with the same care as passwords.
            </p>
            <Card
              className="MFAuth-codes"
              actions={[
                <CopyToClipboard
                  key={'copy'}
                  text={backupCodes.join('\n')}
                  onCopy={() => message.success('Copied!', 2)}
                >
                  <Icon type="copy" title="copy codes" />
                </CopyToClipboard>,
                <Icon
                  key={'download'}
                  onClick={() =>
                    downloadString(
                      backupCodes.join('\n'),
                      'zcash-grants-recovery-codes.txt',
                    )
                  }
                  type="download"
                  title="download codes"
                />,
              ]}
            >
              <ul>
                {backupCodes.map(c => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Card>
            <div className="MFAuth-controls">
              <Button onClick={this.handleCancel}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => this.setState({ stepRecoveryCodesComplete: true })}
              >
                Next
              </Button>
            </div>
          </div>
        ),
      );
    }

    // STEP 4 (totp setup/verify)
    if ((!has2fa || isReset) && !stepTotpComplete) {
      return wrap(
        <div>
          <h2>3. Set up Authenticator</h2>
          <p>
            Please scan the barcode with your athenticator application. If you cannot
            scan, please{' '}
            <a onClick={() => this.setState({ showQrCode: false })}>
              enter the text code
            </a>{' '}
            instead.
          </p>
          <Card
            className="MFAuth-codes"
            actions={[
              <Icon
                key="qrcode"
                type="scan"
                className={showQrCode ? 'is-active' : ''}
                onClick={() => this.setState({ showQrCode: true })}
              />,
              <Icon
                key="textcode"
                type="font-size"
                className={!showQrCode ? 'is-active' : ''}
                onClick={() => this.setState({ showQrCode: false })}
              />,
            ]}
          >
            <div className="MFAuth-codes-qrcode">
              {showQrCode ? <QRCode value={totpUri} /> : totpSecret}
            </div>
          </Card>
          <div className="MFAuth-verify">
            <div>Enter code from application</div>
            <Input
              placeholder="123456"
              value={verifyCode}
              onChange={e => this.setState({ verifyCode: e.target.value })}
              onPressEnter={this.handleEnable}
              autoFocus={true}
            />
          </div>
          <div className="MFAuth-controls">
            <Button onClick={this.handleCancel}>Cancel</Button>
            <Button
              type="primary"
              onClick={this.handleEnable}
              disabled={verifyCode.length === 0}
              loading={isVerifying}
            >
              {isReset ? 'Save' : 'Enable'}
            </Button>
          </div>
        </div>,
      );
    }

    // unauthed
    if (has2fa && !is2faAuthed) {
      return wrap(
        <>
          {lowBackupCodesWarning}
          <h2>Two-Factor authentication required</h2>
          <p>
            Enter the current code from your authenticator application. Enter a recovery
            code if you do not have access to your authenticator application.
          </p>
          <div className="MFAuth-verify" />
          <div className="MFAuth-controls">
            <div className="MFAuth-controls-label">Enter code from application</div>
            <Input
              placeholder="123456"
              value={verifyCode}
              onChange={e => this.setState({ verifyCode: e.target.value })}
              onPressEnter={this.handleVerify}
              autoFocus={true}
            />
            <Button
              type="primary"
              onClick={this.handleVerify}
              disabled={verifyCode.length === 0}
              loading={isVerifying}
            >
              Verify
            </Button>
          </div>
        </>,
      );
    }

    return isReset ? <Redirect to="/settings" /> : 'should not get here';
  }

  private update2faStateFromServer = () => {
    get2fa()
      .then(state => {
        this.setState({
          loaded: true,
          ...state,
        });
      })
      .catch(handleApiError);
  };

  private handleCancel = async () => {
    const { isReset } = this.props;
    if (isReset) {
      message.info('Canceled two-factor reset');
      this.props.history.replace('/settings');
    } else {
      this.setState({ ...STATE });
      this.update2faStateFromServer();
    }
  };

  private handleReadSetup = async () => {
    this.setState({ stepOutlineComplete: true });
    this.loadSetup();
  };

  private handleSubmitPassword = async () => {
    const { password } = this.state;
    try {
      // refresh the login
      await refresh(password);
      // will set fresh login
      await this.update2faStateFromServer();
      // will load setup info
      this.loadSetup();
    } catch (e) {
      handleApiError(e);
    }
  };

  private loadSetup = async () => {
    this.setState({ initializing: true });
    try {
      const setup = await get2faInit();
      this.setState({
        ...setup,
      });
    } catch (e) {
      handleApiError(e);
    }
    this.setState({ initializing: false });
  };

  private handleEnable = async () => {
    const { backupCodes, totpSecret, verifyCode } = this.state;
    if (verifyCode.length === 0) return; // for pressEnter
    this.setState({ isVerifying: true });
    try {
      await post2faEnable({ backupCodes, totpSecret, verifyCode });
      message.success('Two-factor setup complete!');
      store.checkLogin(); // should return authenticated status
      this.setState({ stepTotpComplete: true });
    } catch (e) {
      handleApiError(e);
    }
    this.setState({ isVerifying: false });
  };

  private handleVerify = async () => {
    const { verifyCode } = this.state;
    if (verifyCode.length === 0) return; // for pressEnter
    this.setState({ isVerifying: true });
    try {
      await post2faVerify({ verifyCode });
      message.success('Two-factor authentication verified');
      store.checkLogin(); // should return authenticated status
    } catch (e) {
      handleApiError(e);
    }
    this.setState({ isVerifying: false });
  };
}

export default withRouter(view(MFAuth));
