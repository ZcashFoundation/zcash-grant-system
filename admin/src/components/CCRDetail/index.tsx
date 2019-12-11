import React from 'react';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import { Alert, Button, Card, Col, Collapse, message, Row } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import store from 'src/store';
import { formatDateSeconds } from 'util/time';
import { CCR_STATUS } from 'src/types';
import Back from 'components/Back';
import Markdown from 'components/Markdown';
import FeedbackModal from '../FeedbackModal';
import './index.less';
import { Link } from 'react-router-dom';

type Props = RouteComponentProps<any>;

const STATE = {
  paidTxId: '',
  showCancelAndRefundPopover: false,
  showChangeToAcceptedWithFundingPopover: false,
};

type State = typeof STATE;

class CCRDetailNaked extends React.Component<Props, State> {
  state = STATE;
  rejectInput: null | TextArea = null;

  componentDidMount() {
    this.loadDetail();
  }

  render() {
    const id = this.getIdFromQuery();
    const { ccrDetail: c, ccrDetailFetching } = store;

    if (!c || (c && c.ccrId !== id) || ccrDetailFetching) {
      return 'loading ccr...';
    }

    const renderApproved = () =>
      c.status === CCR_STATUS.APPROVED && (
        <Alert
          showIcon
          type="success"
          message={`Approved on ${formatDateSeconds(c.dateApproved)}`}
          description={`
            This ccr has been approved.
          `}
        />
      );

    const renderReview = () =>
      c.status === CCR_STATUS.PENDING && (
        <Alert
          showIcon
          type="warning"
          message="Review Pending"
          description={
            <div>
              <p>
                Please review this Community Created Request and render your judgment.
              </p>
              <Button
                className="CCRDetail-review"
                loading={store.ccrDetailApproving}
                icon="check"
                type="primary"
                onClick={() => this.handleApprove()}
              >
                Generate RFP from CCR
              </Button>
              <Button
                className="CCRDetail-review"
                loading={store.ccrDetailApproving}
                icon="close"
                type="danger"
                onClick={() => {
                  FeedbackModal.open({
                    title: 'Request changes for this Request?',
                    label: 'Please provide a reason:',
                    okText: 'Request changes',
                    onOk: this.handleReject,
                  });
                }}
              >
                Request changes
              </Button>
            </div>
          }
        />
      );

    const renderRejected = () =>
      c.status === CCR_STATUS.REJECTED && (
        <Alert
          showIcon
          type="error"
          message="Changes requested"
          description={
            <div>
              <p>
                This CCR has changes requested. The team will be able to re-submit it for
                approval should they desire to do so.
              </p>
              <b>Reason:</b>
              <br />
              <i>{c.rejectReason}</i>
            </div>
          }
        />
      );

    const renderDeetItem = (name: string, val: any) => (
      <div className="CCRDetail-deet">
        <span>{name}</span>
        {val} &nbsp;
      </div>
    );

    return (
      <div className="CCRDetail">
        <Back to="/ccrs" text="CCRs" />
        <h1>{c.title}</h1>
        <Row gutter={16}>
          {/* MAIN */}
          <Col span={18}>
            {renderApproved()}
            {renderReview()}
            {renderRejected()}

            <Collapse defaultActiveKey={['brief', 'content', 'target']}>
              <Collapse.Panel key="brief" header="brief">
                {c.brief}
              </Collapse.Panel>

              <Collapse.Panel key="content" header="content">
                <Markdown source={c.content} />
              </Collapse.Panel>

              <Collapse.Panel key="target" header="target">
                <Markdown source={c.target} />
              </Collapse.Panel>

              <Collapse.Panel key="json" header="json">
                <pre>{JSON.stringify(c, null, 4)}</pre>
              </Collapse.Panel>
            </Collapse>
          </Col>

          {/* RIGHT SIDE */}
          <Col span={6}>
            {c.rfp && (
              <Alert
                message="Linked to RFP"
                description={
                  <React.Fragment>
                    This CCR has been accepted and is instantiated as an RFP{' '}
                    <Link to={`/rfps/${c.rfp.id}`}>here</Link>.
                  </React.Fragment>
                }
                type="info"
                showIcon
              />
            )}

            {/* DETAILS */}
            <Card title="Details" size="small">
              {renderDeetItem('id', c.ccrId)}
              {renderDeetItem('created', formatDateSeconds(c.dateCreated))}
              {renderDeetItem(
                'published',
                c.datePublished ? formatDateSeconds(c.datePublished) : 'n/a',
              )}

              {renderDeetItem(
                'status',
                c.status === CCR_STATUS.LIVE ? 'Accepted/Generated RFP' : c.status,
              )}
              {renderDeetItem('target', c.target)}
            </Card>

            <Card title="Author" size="small">
              <div key={c.author.userid}>
                <Link to={`/users/${c.author.userid}`}>{c.author.displayName}</Link>
              </div>
            </Card>

          </Col>
        </Row>
      </div>
    );
  }

  private getIdFromQuery = () => {
    return Number(this.props.match.params.id);
  };

  private loadDetail = () => {
    store.fetchCCRDetail(this.getIdFromQuery());
  };

  private handleApprove = async () => {
    await store.approveCCR(true);
    if (store.ccrCreatedRFPId) {
      message.success('Successfully created RFP from CCR!', 1);
      setTimeout(
        () => this.props.history.replace(`/rfps/${store.ccrCreatedRFPId}/edit`),
        1500,
      );
    }
  };

  private handleReject = async (reason: string) => {
    await store.approveCCR(false, reason);
    message.info('CCR changes requested');
  };
}

const CCRDetail = withRouter(view(CCRDetailNaked));
export default CCRDetail;
