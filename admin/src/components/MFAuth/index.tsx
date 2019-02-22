import React, { ReactNode } from 'react';
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
  hasReadSetup: false,
  initializing: false,
  hasSavedCodes: false,
  password: '',
  verifyCode: '',
  isVerifying: false,
  showQrCode: true,
};
type State = typeof STATE;

class MFAuth extends React.Component<{}, State> {
  state = STATE;
  componentDidMount() {
    this.update2faStateFromServer();
  }
  render() {
    if (store.is2faAuthed) return 'You should not be here.';
    const {
      loaded,
      hasReadSetup,
      password,
      hasSavedCodes,
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
          type="warning"
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
            {lowBackupCodesWarning}
            {children}
          </>
        )}
      </div>
    );

    // LOADING
    if (!loaded) {
      return wrap(<Spin tip="Loading security details..." />);
    }

    // STEP 1 (outline)
    if (!has2fa && !hasReadSetup) {
      return wrap(
        <div>
          {!has2fa && (
            <Alert type="warning" message="Administration requires 2fa setup." />
          )}
          <h1>Two-factor Authentication Setup</h1>
          <p>Please be prepared to perform the following steps:</p>
          <ol>
            <li>Save two-factor recovery codes</li>
            <li>
              Setup up TOTP authentication device, typically a smartphone with Google
              Authenticator, Authy, 1Password or other compatible authenticator app.
            </li>
          </ol>
          <Button onClick={this.handleReadSetup} type="primary">
            I'm ready
          </Button>
        </div>,
      );
    }

    // STEP 2 (if login is stale)
    if (!has2fa && !isLoginFresh) {
      return wrap(
        <>
          <h1>Please verify your password</h1>
          <Input.Password
            onPressEnter={this.handleSubmitPassword}
            onChange={e => this.setState({ password: e.target.value })}
            value={password}
          />
          <div className="MFAuth-controls">
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

    // STEP 3 (recovery codes)
    if (!has2fa && !hasSavedCodes) {
      return wrap(
        ((initializing || !backupCodes.length) && (
          <Spin tip="Loading 2fa setup..." />
        )) || (
          <div>
            <h1>Recovery codes</h1>
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
                onClick={() => this.setState({ hasSavedCodes: true })}
              >
                Next
              </Button>
            </div>
          </div>
        ),
      );
    }

    // STEP 4 (totp setup/verify)
    if (!has2fa && hasSavedCodes) {
      return wrap(
        <div>
          <h1>Set up Authenticator</h1>
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
            <div>Enter code from application:</div>
            <Input
              placeholder="123456"
              value={verifyCode}
              onChange={e => this.setState({ verifyCode: e.target.value })}
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
              Enable
            </Button>
          </div>
        </div>,
      );
    }

    // FINAL & unauthed
    if (has2fa && !is2faAuthed) {
      return wrap(
        <>
          <h1>2FAuthentication required</h1>
          <p>
            Enter the current code from your authenticator application. Enter a backup
            code if you do not have access to your authenticator application.
          </p>
          <div className="MFAuth-verify">
            <div>Enter code from application:</div>
            <Input
              placeholder="123456"
              value={verifyCode}
              onChange={e => this.setState({ verifyCode: e.target.value })}
            />
          </div>
          <div className="MFAuth-controls">
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

    return 'should not get here';
  }

  private update2faStateFromServer = () => {
    get2fa()
      .then(x => {
        this.setState({
          loaded: true,
          ...x,
        });
      })
      .catch(handleApiError);
  };

  private handleCancel = async () => {
    this.setState({ ...STATE });
    this.update2faStateFromServer();
  };

  private handleReadSetup = async () => {
    this.setState({ hasReadSetup: true });
    if (this.state.isLoginFresh) {
      this.loadSetup();
    }
  };

  private handleSubmitPassword = async () => {
    const { password } = this.state;
    try {
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
    this.setState({ isVerifying: true });
    try {
      await post2faEnable({ backupCodes, totpSecret, verifyCode });
      message.success('2FA setup complete!');
      store.checkLogin(); // should return authenticated status
      // await this.update2faStateFromServer();
    } catch (e) {
      handleApiError(e);
    }
    this.setState({ isVerifying: false });
  };

  private handleVerify = async () => {
    const { verifyCode } = this.state;
    this.setState({ isVerifying: true });
    try {
      await post2faVerify({ verifyCode });
      message.success('2FAuthentication verified!');
      store.checkLogin(); // should return authenticated status
    } catch (e) {
      handleApiError(e);
    }
    this.setState({ isVerifying: false });
  };
}

export default view(MFAuth);
