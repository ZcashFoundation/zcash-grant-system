import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Icon, Tag } from 'antd';
import ExceptionPage from 'components/ExceptionPage';
import { fetchRfp } from 'modules/rfps/actions';
import { getRfp } from 'modules/rfps/selectors';
import { RFP } from 'types';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';
import Markdown from 'components/Markdown';
import ProposalCard from 'components/Proposals/ProposalCard';
import UnitDisplay from 'components/UnitDisplay';
import HeaderDetails from 'components/HeaderDetails';
import Like from 'components/Like';
import { RFP_STATUS } from 'api/constants';
import { formatUsd } from 'utils/formatters';
import './index.less';

interface OwnProps {
  rfpId: number;
}

interface StateProps {
  rfp: RFP | undefined;
  isFetchingRfps: AppState['rfps']['isFetchingRfps'];
  fetchRfpsError: AppState['rfps']['fetchRfpsError'];
}

interface DispatchProps {
  fetchRfp: typeof fetchRfp;
}

type Props = OwnProps & StateProps & DispatchProps;

export class RFPDetail extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchRfp(this.props.rfpId);
  }

  render() {
    const { rfp, isFetchingRfps } = this.props;

    // Optimistically render rfp if we have it, but are updating it
    if (!rfp) {
      if (isFetchingRfps) {
        return <Loader size="large" />;
      } else {
        return <ExceptionPage code="404" desc="No request could be found" />;
      }
    }

    const isLive = rfp.status === RFP_STATUS.LIVE;
    const tags = [];

    if (rfp.matching) {
      tags.push(
        <Tag key="matching" color="#1890ff">
          x2 matching
        </Tag>,
      );
    }

    if (rfp.bounty) {
      if (rfp.isVersionTwo) {
        tags.push(
          <Tag key="bounty" color="#CF8A00">
            {formatUsd(rfp.bounty.toString(10))} bounty
          </Tag>,
        );
      } else {
        tags.push(
          <Tag key="bounty" color="#CF8A00">
            <UnitDisplay value={rfp.bounty} symbol="ZEC" /> bounty
          </Tag>,
        );
      }
    }

    if (!isLive) {
      tags.push(
        <Tag key="closed" color="#f5222d">
          Closed
        </Tag>,
      );
    }

    return (
      <div className="RFPDetail">
        <HeaderDetails title={rfp.title} description={rfp.brief} />
        <div className="RFPDetail-top">
          <Link className="RFPDetail-top-back" to="/requests">
            <Icon type="arrow-left" /> Back to Requests
          </Link>

          <div className="RFPDetail-top-date">
            Opened {moment(rfp.dateOpened * 1000).format('LL')}
          </div>
          <Like rfp={rfp} />
        </div>

        <h1 className="RFPDetail-title">{rfp.title}</h1>
        <div className="RFPDetail-tags">{tags}</div>
        <p className="RFPDetail-brief">{rfp.brief}</p>

        <Markdown className="RFPDetail-content" source={rfp.content} />
        <div className="RFPDetail-rules">
          <ul>
            {rfp.bounty &&
              rfp.isVersionTwo && (
                <li>
                  Accepted proposals will be funded up to{' '}
                  <strong>{formatUsd(rfp.bounty.toString(10))}</strong> in ZEC
                </li>
              )}
            {rfp.bounty &&
              !rfp.isVersionTwo && (
                <li>
                  Accepted proposals will be funded up to{' '}
                  <strong>
                    <UnitDisplay value={rfp.bounty} symbol="ZEC" />
                  </strong>
                </li>
              )}
            {rfp.matching && (
              <li>
                Contributions will have their <strong>funding matched</strong> by the
                Zcash Foundation
              </li>
            )}
            {rfp.dateCloses && (
              <li>
                Proposal submissions end {moment(rfp.dateCloses * 1000).format('LL')}
              </li>
            )}
            {rfp.ccr && (
              <li>
                Submitted by{' '}
                <Link to={`/profile/${rfp.ccr.author.userid}`}>
                  {rfp.ccr.author.displayName}
                </Link>
              </li>
            )}
          </ul>
        </div>

        {!!rfp.acceptedProposals.length && (
          <div className="RFPDetail-proposals">
            <h2 className="RFPDetail-proposals-title">Accepted Proposals</h2>
            {rfp.acceptedProposals.map(p => (
              <ProposalCard key={p.proposalId} {...p} />
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  (state, ownProps) => ({
    rfp: getRfp(state, ownProps.rfpId),
    isFetchingRfps: state.rfps.isFetchingRfps,
    fetchRfpsError: state.rfps.fetchRfpsError,
  }),
  { fetchRfp },
)(RFPDetail);
