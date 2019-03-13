import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Modal, Alert } from 'antd';
import Result from 'ant-design-pro/lib/Result';
import {
  postProposalContribution,
  getProposalContribution,
  getUserSettings,
} from 'api/api';
import { ContributionWithAddressesAndUser } from 'types';
import PaymentInfo from './PaymentInfo';
import SetRefundAddress from './SetRefundAddress';
import { AppState } from 'store/reducers';

interface OwnProps {
  isVisible: boolean;
  contribution?: ContributionWithAddressesAndUser | Falsy;
  proposalId?: number;
  contributionId?: number;
  amount?: string;
  isAnonymous?: boolean;
  hasNoButtons?: boolean;
  text?: React.ReactNode;
  handleClose(): void;
}

interface StateProps {
  authUser: AppState['auth']['user'];
}

type Props = StateProps & OwnProps;

interface State {
  hasConfirmedAnonymous: boolean;
  hasSent: boolean;
  contribution: ContributionWithAddressesAndUser | null;
  needsRefundAddress: boolean;
  noRefund: boolean;
  isFetchingContribution: boolean;
  error: string | null;
}

class ContributionModal extends React.Component<Props, State> {
  state: State = {
    hasConfirmedAnonymous: false,
    hasSent: false,
    contribution: null,
    needsRefundAddress: false,
    noRefund: false,
    isFetchingContribution: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
    if (props.contribution) {
      this.state = {
        ...this.state,
        contribution: props.contribution,
      };
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    const {
      isVisible,
      isAnonymous,
      proposalId,
      contributionId,
      contribution,
    } = nextProps;
    // When modal is opened and proposalId is provided or changed
    // But not if we're anonymous, that will happen in confirmAnonymous
    if (isVisible && proposalId && !isAnonymous) {
      if (this.props.isVisible !== isVisible || proposalId !== this.props.proposalId) {
        this.fetchAddresses(proposalId, contributionId, nextState.noRefund);
      }
    }
    // If contribution is provided, update it
    if (contribution !== this.props.contribution) {
      this.setState({ contribution: contribution || null });
    }
    // When the modal is closed, clear out the contribution, error, and anonymous check
    if (this.props.isVisible && !isVisible) {
      this.setState({
        contribution: null,
        hasConfirmedAnonymous: false,
        hasSent: false,
        needsRefundAddress: false,
        noRefund: false,
        error: null,
      });
    }
  }

  render() {
    const { isVisible, isAnonymous, handleClose, text, authUser } = this.props;
    const {
      hasSent,
      hasConfirmedAnonymous,
      needsRefundAddress,
      contribution,
      error,
    } = this.state;
    let { hasNoButtons } = this.props;
    let okText;
    let onOk;
    let content;

    if (needsRefundAddress && authUser) {
      hasNoButtons = true;
      content = (
        <SetRefundAddress
          userid={authUser.userid}
          onSetRefundAddress={this.confirmRefundAddressSet}
          onSetNoRefund={this.confirmNoRefund}
        />
      );
    } else if (isAnonymous && !hasConfirmedAnonymous) {
      okText = 'I accept';
      onOk = this.confirmAnonymous;
      content = (
        <Alert
          className="PaymentInfo-anonymous"
          type="warning"
          message="This contribution will not be attributed"
          description={
            <>
              Your contribution will show up without attribution. Even if you're logged
              in, the contribution will not appear anywhere on your account after you
              close this modal.
              <br /> <br />
              ZF Grants is unable to offer refunds for non-attributed contributions. If
              refunds for this campaign are issued, your contribution will be treated as a
              donation to the Zcash Foundation.
              <br /> <br />
              If you would like to have your contribution attached to an account and
              remain eligible for refunds, you can close this modal, make sure you're
              logged in, and don't check the "Contribute without attribution" checkbox.
              <br /> <br />
              NOTE: The Zcash Foundation is unable to accept donations of more than $5,000
              USD worth of ZEC from anonymous users.
            </>
          }
        />
      );
    } else if (hasSent) {
      okText = 'Done';
      onOk = handleClose;
      content = (
        <Result
          type="success"
          title="Thank you for your contribution!"
          description={
            <>
              Your transaction should be confirmed in about 20 minutes.{' '}
              {isAnonymous ? (
                'Once it’s confirmed, it’ll show up in the contributions tab.'
              ) : (
                <>
                  You can keep an eye on it at the{' '}
                  <Link to="/profile?tab=funded">funded tab on your profile</Link>.
                </>
              )}
            </>
          }
          style={{ width: '90%' }}
        />
      );
    } else {
      if (error) {
        okText = 'Done';
        onOk = handleClose;
        // This should probably key on non-display text, but oh well.
        let title;
        let description;
        if (error.includes('too many times')) {
          title = 'Take it easy!';
          description = `
            We appreciate your enthusiasm, but you've made too many
            contributions too fast. Please wait for your other contributions,
            and try again later.
          `;
        } else {
          title = 'Something went wrong';
          description = `
            We were unable to get your contribution started. Please check back
            soon, we're working to fix the problem as soon as possible.
          `;
        }
        content = <Result type="error" title={title} description={description} />;
      } else {
        okText = 'I’ve sent it';
        onOk = this.confirmSend;
        content = <PaymentInfo contribution={contribution} text={text} />;
      }
    }

    return (
      <Modal
        title="Make your contribution"
        visible={isVisible}
        closable={hasSent || hasNoButtons}
        maskClosable={hasSent || hasNoButtons}
        okText={okText}
        onOk={onOk}
        onCancel={handleClose}
        footer={hasNoButtons ? '' : undefined}
        centered
      >
        {content}
      </Modal>
    );
  }

  private async fetchAddresses(
    proposalId: number,
    contributionId?: number,
    noRefund?: boolean,
  ) {
    this.setState({ isFetchingContribution: true });
    try {
      const { amount, isAnonymous, authUser } = this.props;

      // Ensure auth'd users have a refund address unless they've confirmed
      if (!isAnonymous && !noRefund) {
        // This should never happen, but make Typescript happy
        if (!authUser) {
          throw new Error('You must be logged in to contribute non-anonymously');
        }
        const { data: settings } = await getUserSettings(authUser.userid);
        if (!settings.refundAddress) {
          this.setState({ needsRefundAddress: true });
          return;
        }
      }

      let res;
      if (contributionId) {
        res = await getProposalContribution(proposalId, contributionId);
      } else {
        res = await postProposalContribution(
          proposalId,
          amount || '0',
          isAnonymous,
          noRefund,
        );
      }
      this.setState({ contribution: res.data });
    } catch (err) {
      this.setState({ error: err.message });
    }
    this.setState({ isFetchingContribution: false });
  }

  private confirmAnonymous = () => {
    this.setState({ hasConfirmedAnonymous: true }, () => {
      const { state, props } = this;
      if (!state.contribution && !props.contribution && props.proposalId) {
        this.fetchAddresses(props.proposalId, props.contributionId, state.noRefund);
      }
    });
  };

  private confirmSend = () => {
    this.setState({ hasSent: true });
  };

  private confirmRefundAddressSet = () => {
    this.setState(
      {
        needsRefundAddress: false,
        noRefund: false,
      },
      () => {
        const { state, props } = this;
        if (!state.contribution && !props.contribution && props.proposalId) {
          this.fetchAddresses(props.proposalId, props.contributionId, state.noRefund);
        }
      },
    );
  };

  private confirmNoRefund = () => {
    this.setState(
      {
        needsRefundAddress: false,
        noRefund: true,
      },
      () => {
        const { state, props } = this;
        if (!state.contribution && !props.contribution && props.proposalId) {
          this.fetchAddresses(props.proposalId, props.contributionId, state.noRefund);
        }
      },
    );
  };
}

export default connect<StateProps, {}, OwnProps, AppState>(state => ({
  authUser: state.auth.user,
}))(ContributionModal);
