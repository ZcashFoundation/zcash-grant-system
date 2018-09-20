import React from 'react';
import moment from 'moment';
import { Spin, Form, Input, Button, Icon } from 'antd';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import * as Styled from './styled';
import * as ProposalStyled from '../styled';

import { connect } from 'react-redux';
import { compose } from 'recompose';
import { AppState } from 'store/reducers';
import { web3Actions } from 'modules/web3';
import { withRouter } from 'react-router';
import Web3Container, { Web3RenderProps } from 'lib/Web3Container';
import ShortAddress from 'components/ShortAddress';
import UnitDisplay from 'components/UnitDisplay';
import { getAmountError } from 'utils/validators';
import { CATEGORY_UI } from 'api/constants';

interface OwnProps {
  proposal: ProposalWithCrowdFund;
  isPreview?: boolean;
}

interface StateProps {
  sendLoading: AppState['web3']['sendLoading'];
}

interface ActionProps {
  fundCrowdFund: typeof web3Actions['fundCrowdFund'];
}

interface Web3Props {
  web3: Web3RenderProps['web3'];
}

type Props = OwnProps & StateProps & ActionProps & Web3Props;

interface State {
  amountToRaise: string;
  amountError: string | null;
}

class CampaignBlock extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      amountToRaise: '',
      amountError: null,
    };
  }

  handleAmountChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = event.currentTarget;
    if (!value) {
      this.setState({ amountToRaise: '', amountError: null });
      return;
    }

    const { proposal, web3 } = this.props;
    const { crowdFund } = proposal;
    const remainingTarget = crowdFund.target.sub(crowdFund.funded);
    const amount = parseFloat(value);
    let amountError = null;

    if (Number.isNaN(amount)) {
      // They're entering some garbage, they’ll work it out
    } else {
      const remainingEthNum = parseFloat(web3.utils.fromWei(remainingTarget, 'ether'));
      amountError = getAmountError(amount, remainingEthNum);
    }

    this.setState({ amountToRaise: value, amountError });
  };

  sendTransaction = () => {
    const { proposal, fundCrowdFund } = this.props;
    fundCrowdFund(proposal.crowdFundContract, this.state.amountToRaise);

    this.setState({ amountToRaise: '' });
  };

  render() {
    const { proposal, sendLoading, web3, isPreview } = this.props;
    const { amountToRaise, amountError } = this.state;
    const amountFloat = parseFloat(amountToRaise) || 0;
    let content;
    if (proposal) {
      const { crowdFund } = proposal;
      const isFundingOver =
        crowdFund.isRaiseGoalReached || crowdFund.deadline < Date.now();
      const isDisabled = isFundingOver || !!amountError || !amountFloat || isPreview;
      const remainingEthNum = parseFloat(
        web3.utils.fromWei(crowdFund.target.sub(crowdFund.funded), 'ether'),
      );

      content = (
        <React.Fragment>
          <Styled.Info>
            <Styled.InfoLabel>Started</Styled.InfoLabel>
            <Styled.InfoValue>
              {moment(proposal.dateCreated * 1000).fromNow()}
            </Styled.InfoValue>
          </Styled.Info>
          <Styled.Info>
            <Styled.InfoLabel>Category</Styled.InfoLabel>
            <Styled.InfoValue>
              <Icon
                type={CATEGORY_UI[proposal.category].icon}
                style={{ color: CATEGORY_UI[proposal.category].color }}
              />{' '}
              {CATEGORY_UI[proposal.category].label}
            </Styled.InfoValue>
          </Styled.Info>
          {!isFundingOver && (
            <Styled.Info>
              <Styled.InfoLabel>Deadline</Styled.InfoLabel>
              <Styled.InfoValue>{moment(crowdFund.deadline).fromNow()}</Styled.InfoValue>
            </Styled.Info>
          )}
          <Styled.Info>
            <Styled.InfoLabel>Beneficiary</Styled.InfoLabel>
            <Styled.InfoValue>
              <ShortAddress address={crowdFund.beneficiary} />
            </Styled.InfoValue>
          </Styled.Info>
          <Styled.Info>
            <Styled.InfoLabel>Funding</Styled.InfoLabel>
            <Styled.InfoValue>
              <UnitDisplay value={crowdFund.funded} /> /{' '}
              <UnitDisplay value={crowdFund.target} symbol="ETH" />
            </Styled.InfoValue>
          </Styled.Info>

          {isFundingOver ? (
            <Styled.FundingOverMessage isSuccess={crowdFund.isRaiseGoalReached}>
              {crowdFund.isRaiseGoalReached ? (
                <>
                  <Icon type="check-circle-o" />
                  <span>Proposal has been funded</span>
                </>
              ) : (
                <>
                  <Icon type="close-circle-o" />
                  <span>Proposal didn’t reach target</span>
                </>
              )}
            </Styled.FundingOverMessage>
          ) : (
            <>
              <Styled.Bar>
                <Styled.BarInner
                  style={{
                    width: `${crowdFund.percentFunded}%`,
                  }}
                />
              </Styled.Bar>
              <Form layout="vertical">
                <Form.Item
                  validateStatus={amountError ? 'error' : undefined}
                  help={amountError}
                  style={{ marginBottom: '0.5rem', paddingBottom: 0 }}
                >
                  <Input
                    size="large"
                    name="amountToRaise"
                    type="number"
                    value={amountToRaise}
                    placeholder="0.5"
                    min={0}
                    max={remainingEthNum}
                    step={0.1}
                    onChange={this.handleAmountChange}
                    addonAfter="ETH"
                    disabled={isPreview}
                  />
                </Form.Item>

                <Button
                  onClick={this.sendTransaction}
                  size="large"
                  type="primary"
                  disabled={isDisabled}
                  loading={sendLoading}
                  block
                >
                  Fund this project
                </Button>
              </Form>
            </>
          )}
        </React.Fragment>
      );
    } else {
      content = <Spin />;
    }

    return (
      <ProposalStyled.SideBlock>
        <ProposalStyled.BlockTitle>Campaign</ProposalStyled.BlockTitle>
        <ProposalStyled.Block>{content}</ProposalStyled.Block>
      </ProposalStyled.SideBlock>
    );
  }
}

function mapStateToProps(state: AppState) {
  return {
    sendLoading: state.web3.sendLoading,
  };
}

const withConnect = connect(
  mapStateToProps,
  { fundCrowdFund: web3Actions.fundCrowdFund },
);

const ConnectedCampaignBlock = compose<Props, OwnProps & Web3Props>(
  withRouter,
  withConnect,
)(CampaignBlock);

export default (props: OwnProps) => (
  <Web3Container
    renderLoading={() => (
      <ProposalStyled.SideBlock>
        <ProposalStyled.BlockTitle>Campaign</ProposalStyled.BlockTitle>
        <ProposalStyled.Block>
          <Spin />
        </ProposalStyled.Block>
      </ProposalStyled.SideBlock>
    )}
    render={({ web3 }) => <ConnectedCampaignBlock {...props} web3={web3} />}
  />
);
