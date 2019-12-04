import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Row, Col, Collapse, Card, Button, Popconfirm, Spin } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';
import Back from 'components/Back';
import Markdown from 'components/Markdown';
import { formatDateSeconds } from 'util/time';
import store from 'src/store';
import { PROPOSAL_STATUS } from 'src/types';
import { formatUsd } from 'src/util/formatters';
import './index.less';

type Props = RouteComponentProps<{ id?: string }>;

class RFPDetail extends React.Component<Props> {
  componentDidMount() {
    if (!store.rfpsFetched) {
      store.fetchRFPs();
    }
  }

  render() {
    if (!store.rfpsFetched) {
      return <Spin />;
    }

    const rfp = this.getRFP();
    if (!rfp) {
      return <Exception type="404" desc="This RFP does not exist" />;
    }

    const renderDeetItem = (name: string, val: any) => (
      <div className="RFPDetail-deet">
        <span>{name}</span>
        {val}
      </div>
    );

    const pendingProposals = rfp.proposals.filter(
      p => p.status === PROPOSAL_STATUS.PENDING,
    );
    const acceptedProposals = rfp.proposals.filter(
      p => p.status === PROPOSAL_STATUS.LIVE || p.status === PROPOSAL_STATUS.APPROVED,
    );

    return (
      <div className="RFPDetail">
        <Back to="/rfps" text="RFPs" />
        <h1>{rfp.title}</h1>
        <Row gutter={16}>
          {/* MAIN */}
          <Col span={18}>
            <Collapse defaultActiveKey={['brief', 'content']}>
              <Collapse.Panel key="brief" header="brief">
                {rfp.brief}
              </Collapse.Panel>

              <Collapse.Panel key="content" header="content">
                <Markdown source={rfp.content} />
              </Collapse.Panel>

              <Collapse.Panel key="json" header="json">
                <pre>{JSON.stringify(rfp, null, 4)}</pre>
              </Collapse.Panel>
            </Collapse>
          </Col>

          {/* RIGHT SIDE */}
          <Col span={6}>
            {/* ACTIONS */}
            <Card className="RFPDetail-actions" size="small">
              <Link to={`/rfps/${rfp.id}/edit`}>
                <Button type="primary" icon="edit" block>
                  Edit
                </Button>
              </Link>
              <Popconfirm
                onConfirm={this.handleDelete}
                title="Delete proposal?"
                okText="delete"
                cancelText="cancel"
              >
                <Button icon="delete" block>
                  Delete
                </Button>
              </Popconfirm>
            </Card>

            {/* DETAILS */}
            <Card title="details" size="small">
              {renderDeetItem('id', rfp.id)}
              {renderDeetItem('created', formatDateSeconds(rfp.dateCreated))}
              {renderDeetItem('status', rfp.status)}
              {renderDeetItem('matching', String(rfp.matching))}
              {renderDeetItem(
                'bounty',
                rfp.isVersionTwo ? formatUsd(rfp.bounty) : `${rfp.bounty} ZEC`,
              )}
              {renderDeetItem(
                'dateCloses',
                rfp.dateCloses && formatDateSeconds(rfp.dateCloses),
              )}
            </Card>

            {/* PROPOSALS */}
            <Card title="Approved Proposals" size="small">
              {acceptedProposals.map(p => (
                <Link
                  key={p.proposalId}
                  className="RFPDetails-proposal"
                  to={`/proposals/${p.proposalId}`}
                >
                  <div>{p.title}</div>
                  <small>{p.brief}</small>
                </Link>
              ))}
              {!acceptedProposals.length && <em>No proposals accepted</em>}
            </Card>
            <Card title="Pending Proposals" size="small">
              {pendingProposals.map(p => (
                <Link
                  key={p.proposalId}
                  className="RFPDetail-proposal"
                  to={`/proposals/${p.proposalId}`}
                >
                  <div>{p.title}</div>
                  <small>{p.brief}</small>
                </Link>
              ))}
              {!pendingProposals.length && <em>No proposals pending</em>}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  private getRFP = () => {
    const rfpId = this.props.match.params.id;
    if (rfpId) {
      return store.rfps.find(rfp => rfp.id.toString() === rfpId);
    }
  };

  private handleDelete = () => {
    console.log('Delete');
  };
}

export default withRouter(view(RFPDetail));
