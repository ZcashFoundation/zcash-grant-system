import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'antd';
import { Link } from 'react-router-dom';
import Result from 'ant-design-pro/lib/Result';
import Loader from 'components/Loader';
import { createActions } from 'modules/create';
import { AppState } from 'store/reducers';
import { getProposalStakingContribution } from 'api/api';
import './Final.less';
import PaymentInfo from 'components/ContributionModal/PaymentInfo';
import { ContributionWithAddresses } from 'types';

interface OwnProps {
  goBack(): void;
}

interface StateProps {
  form: AppState['create']['form'];
  submittedProposal: AppState['create']['submittedProposal'];
  submitError: AppState['create']['submitError'];
}

interface DispatchProps {
  submitProposal: typeof createActions['submitProposal'];
}

type Props = OwnProps & StateProps & DispatchProps;

const STATE = {
  contribution: null as null | ContributionWithAddresses,
  contributionError: null as null | Error,
};

type State = typeof STATE;

class CreateFinal extends React.Component<Props, State> {
  state = STATE;
  componentDidMount() {
    this.submit();
  }

  componentDidUpdate(prev: Props) {
    const { submittedProposal } = this.props;
    if (!prev.submittedProposal && submittedProposal) {
      if (!submittedProposal.isStaked) {
        this.getStakingContribution();
      }
    }
  }

  render() {
    const { submittedProposal, submitError, goBack } = this.props;
    const { contribution, contributionError } = this.state;

    const ready = submittedProposal && (submittedProposal.isStaked || contribution);
    const staked = submittedProposal && submittedProposal.isStaked;

    let content;
    if (submitError) {
      content = (
        <div className="CreateFinal-message is-error">
          <Icon type="close-circle" />
          <div className="CreateFinal-message-text">
            <h3>
              <b>Something went wrong during creation</b>
            </h3>
            <h5>{submitError}</h5>
            <a onClick={goBack}>Click here</a> to go back to the form and try again.
          </div>
        </div>
      );
    } else if (ready) {
      content = (
        <>
          <div className="CreateFinal-message is-success">
            <Icon type="check-circle" />
            {staked && (
              <div className="CreateFinal-message-text">
                Your proposal has been staked and submitted! Check your{' '}
                <Link to={`/profile?tab=pending`}>profile's pending proposals tab</Link>{' '}
                to check its status.
              </div>
            )}
            {!staked && (
              <div className="CreateFinal-message-text">
                Your proposal has been submitted! Please send the staking contribution of{' '}
                <b>{contribution && contribution.amount} ZEC</b> using the instructions
                below.
              </div>
            )}
          </div>
          {!staked && (
            <>
              <div className="CreateFinal-contribute">
                <PaymentInfo
                  text={
                    <>
                      <p>
                        If you cannot send the payment now, you may bring up these
                        instructions again by visiting your{' '}
                        <Link to={`/profile?tab=funded`}>profile's funded tab</Link>.
                      </p>
                      <p>
                        Once your payment has been sent and processed with 6
                        confirmations, you will receive an email. Visit your{' '}
                        <Link to={`/profile?tab=pending`}>
                          profile's pending proposals tab
                        </Link>{' '}
                        at any time to check its status.
                      </p>
                    </>
                  }
                  contribution={contribution}
                />
              </div>
              <p className="CreateFinal-staked">
                I'm finished, take me to{' '}
                <Link to="/profile?tab=pending">my pending proposals</Link>!
              </p>
            </>
          )}
        </>
      );
    } else if (contributionError) {
      content = (
        <Result
          type="error"
          title="Something went wrong"
          description={
            <>
              We were unable to get your staking contribution started. You can finish
              staking from <Link to="/profile?tab=pending">your profile</Link>, please try
              again from there soon.
            </>
          }
        />
      );
    } else {
      content = <Loader size="large" tip="Submitting your proposal..." />;
    }

    return <div className="CreateFinal">{content}</div>;
  }

  private submit = () => {
    if (this.props.form) {
      this.props.submitProposal(this.props.form);
    }
  };

  private getStakingContribution = async () => {
    const { submittedProposal } = this.props;
    if (submittedProposal) {
      try {
        const res = await getProposalStakingContribution(submittedProposal.proposalId);
        this.setState({ contribution: res.data });
      } catch (err) {
        this.setState({ contributionError: err });
      }
    }
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state: AppState) => ({
    form: state.create.form,
    submittedProposal: state.create.submittedProposal,
    submitError: state.create.submitError,
  }),
  {
    submitProposal: createActions.submitProposal,
  },
)(CreateFinal);
