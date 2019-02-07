import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import { Row, Col, Card, Button, Collapse, Input } from 'antd';
import store from 'src/store';
import { formatDateSeconds } from 'util/time';
import { Link } from 'react-router-dom';
import Back from 'components/Back';
import UserItem from 'components/Users/UserItem';
import ProposalItem from 'components/Proposals/ProposalItem';
import './index.less';

type Props = RouteComponentProps<any>;

class ContributionDetail extends React.Component<Props> {
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
        <div className="ContributionDetail-deet-value">
          {val}
        </div>
        <div className="ContributionDetail-deet-label">
          {label}
        </div>
      </div>
    );

    return (
      <div className="ContributionDetail">
        <Back to="/contributions" text="Contributions" />
        <Row gutter={16}>
          {/* MAIN */}
          <Col span={18}>
            <Collapse defaultActiveKey={['addresses', 'user', 'proposal']}>
              <Collapse.Panel key="addresses" header="addresses">
                <pre>{JSON.stringify(c.addresses, null, 4)}</pre>
              </Collapse.Panel>

              <Collapse.Panel key="user" header="user">
                <UserItem {...c.user} />
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
                <Button type="primary" block>Edit</Button>
              </Link>
            </Card>

            {/* DETAILS */}
            <Card title="Details" size="small">
              {renderDeetItem('id', c.id)}
              {renderDeetItem('created', formatDateSeconds(c.dateCreated))}
              {renderDeetItem('status', c.status)}
              {renderDeetItem('amount', c.amount)}
              {renderDeetItem('txid', c.txId
                ? <Input size="small" value={c.txId} readOnly />
                : <em>N/A</em>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  private getIdFromQuery = () => {
    return Number(this.props.match.params.id);
  };
}

export default withRouter(view(ContributionDetail));
