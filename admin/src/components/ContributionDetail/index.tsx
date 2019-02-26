import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import { Row, Col, Card, Button, Collapse, Input, Alert, message } from 'antd';
import store from 'src/store';
import { formatDateSeconds } from 'util/time';
import { Link } from 'react-router-dom';
import Back from 'components/Back';
import UserItem from 'components/Users/UserItem';
import ProposalItem from 'components/Proposals/ProposalItem';
import { toZat, fromZat } from 'src/util/units';
import './index.less';

type Props = RouteComponentProps<any>;

interface State {
  refundTxId: string;
}

class ContributionDetail extends React.Component<Props, State> {
  state: State = {
    refundTxId: '',
  };

  componentDidMount() {
    store.fetchContributionDetail(this.getIdFromQuery());
  }

  render() {
    const id = this.getIdFromQuery();
    const { contributionDetail: c, contributionDetailFetching } = store;

    if (!c || (c && c.id !== id) || contributionDetailFetching) {
      return 'loading proposal...';
    }

    const renderDeetItem = (label: string, val: React.ReactNode) => (
      <div className="ContributionDetail-deet">
        <div className="ContributionDetail-deet-value">{val}</div>
        <div className="ContributionDetail-deet-label">{label}</div>
      </div>
    );

    const renderSendRefund = () => {
      if (
        c.staking ||
        !c.refundAddress ||
        c.refundTxId ||
        !c.proposal.isFailed ||
        !c.user
      ) {
        return;
      }
      const percent = c.proposal.milestones.reduce((prev, m) => {
        return m.datePaid ? prev - parseFloat(m.payoutPercent) : prev;
      }, 100);
      const amount = toZat(c.amount)
        .muln(percent)
        .divn(100);
      return (
        <Alert
          className="ContributionDetail-alert"
          showIcon
          type="warning"
          message={null}
          description={
            <div>
              <p>
                The proposal this contribution was made towards has failed, and is ready
                to be refunded to <strong>{c.user.displayName}</strong> for{' '}
                <strong>{percent}%</strong> of the contribution amount. Please Make a
                payment of <strong>{fromZat(amount)} ZEC</strong> to:
              </p>
              <pre>{c.refundAddress}</pre>
              <p>
                They will be sent an email notifying them of the refund when you enter the
                txid below.
              </p>
              <Input.Search
                placeholder="Enter payment txid"
                value={this.state.refundTxId}
                enterButton="Mark Refunded"
                onChange={e => this.setState({ refundTxId: e.target.value })}
                onSearch={this.handleRefund}
              />
            </div>
          }
        />
      );
    };

    return (
      <div className="ContributionDetail">
        <Back to="/contributions" text="Contributions" />
        <Row gutter={16}>
          {/* MAIN */}
          <Col span={18}>
            {renderSendRefund()}

            <Collapse defaultActiveKey={['addresses', 'user', 'proposal']}>
              <Collapse.Panel key="addresses" header="addresses">
                <pre>{JSON.stringify(c.addresses, null, 4)}</pre>
              </Collapse.Panel>

              <Collapse.Panel key="user" header="user">
                {c.user ? <UserItem {...c.user} /> : <em>Anonymous contribution</em>}
              </Collapse.Panel>

              <Collapse.Panel key="proposal" header="proposal">
                <ProposalItem {...c.proposal} />
              </Collapse.Panel>

              <Collapse.Panel key="json" header="json">
                <pre>{JSON.stringify(c, null, 4)}</pre>
              </Collapse.Panel>
            </Collapse>
          </Col>

          {/* RIGHT SIDE */}
          <Col span={6}>
            {/* ACTIONS */}
            <Card size="small" className="ContributionDetail-controls">
              <Link to={`/contributions/${id}/edit`}>
                <Button type="primary" block>
                  Edit
                </Button>
              </Link>
            </Card>

            {/* DETAILS */}
            <Card title="Details" size="small">
              {renderDeetItem('id', c.id)}
              {renderDeetItem('created', formatDateSeconds(c.dateCreated))}
              {renderDeetItem('status', c.status)}
              {renderDeetItem('amount', c.amount)}
              {renderDeetItem(
                'txid',
                c.txId ? <Input size="small" value={c.txId} readOnly /> : <em>N/A</em>,
              )}
              {renderDeetItem(
                'refund txid',
                c.refundTxId ? (
                  <Input size="small" value={c.refundTxId} readOnly />
                ) : (
                  <em>N/A</em>
                ),
              )}
              {renderDeetItem('staking tx', JSON.stringify(c.staking))}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  private getIdFromQuery = () => {
    return Number(this.props.match.params.id);
  };

  private handleRefund = async () => {
    const { contributionDetail } = store;
    const { refundTxId } = this.state;
    if (!contributionDetail) {
      return;
    }
    if (!refundTxId) {
      return message.error('Must enter a txid');
    }
    await store.editContribution(contributionDetail.id, { refundTxId });
    if (store.contributionSaved) {
      message.success('Saved refund txid');
    }
    store.fetchContributionDetail(this.getIdFromQuery());
  };
}

export default withRouter(view(ContributionDetail));
