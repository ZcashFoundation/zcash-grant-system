import React from 'react';
import { Alert } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Loader from 'components/Loader';
import { RFPDetail } from 'components/RFP';
import { AppState } from 'store/reducers';
import { makeRfpPreviewFromCcrDraft } from 'modules/create/utils';
import { CCRDraft, CCR, CCRSTATUS } from 'types';
import { getCCR } from 'api/api';
import './CCRPreview.less';

interface StateProps {
  form: CCRDraft;
}

interface OwnProps {
  id?: number;
}

type Props = StateProps & OwnProps;

interface State {
  loading: boolean;
  ccr?: CCR;
  error?: string;
}

class CCRFlowPreview extends React.Component<Props, State> {
  state: State = {
    loading: false,
  };

  async componentWillMount() {
    const { id } = this.props;

    if (id) {
      this.setState({ loading: true });
      try {
        const { data } = await getCCR(id);
        this.setState({ ccr: data });
      } catch (e) {
        this.setState({ error: e.message || e.toString()})
      }
      this.setState({ loading: false });
    }
  }

  render() {
    const { ccr, loading, error } = this.state;

    if (loading) {
      return (
        <div className="CCRPreview-loader">
          <Loader size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="CCRPreview-banner">
          <Alert type={'error'} message={`An error occurred while fetching request: ${error}`} showIcon={false} banner />
        </div>
      );
    }

    const { form } = this.props;
    const previewData = ccr ? ccr : form;
    const rfp = makeRfpPreviewFromCcrDraft(previewData);

    // BANNER
    const statusBanner = {
      [CCRSTATUS.DRAFT]: {
        blurb: <>This is a preview of your request. It has not yet been published.</>,
        type: 'warning',
      },
      [CCRSTATUS.PENDING]: {
        blurb: (
          <>Your request is being reviewed. You will get an email when it is complete.</>
        ),
        type: 'warning',
      },
      [CCRSTATUS.APPROVED]: {
        blurb: (
          <>
            Your request has been approved! It will be made live to the community sometime
            soon.
          </>
        ),
        type: 'success',
      },
      [CCRSTATUS.REJECTED]: {
        blurb: (
          <>
            Your request has changes requested. Visit your profile's pending tab for more
            information.
          </>
        ),
        type: 'error',
      },
      [CCRSTATUS.LIVE]: {
        blurb: (
          <>
            Your request has been approved and is live! You can find it on the{' '}
            <Link to="/requests">requests page</Link>.
          </>
        ),
        type: 'success',
      },
    } as any;

    const banner = statusBanner[previewData.status];

    return (
      <div>
        {banner && (
          <div className="CCRPreview-banner">
            <Alert type={banner.type} message={banner.blurb} showIcon={false} banner />
          </div>
        )}

        <div className="CCRPreview-preview">
          <RFPDetail
            rfp={rfp}
            rfpId={0}
            isFetchingRfps={false}
            fetchRfpsError={null}
            fetchRfp={(() => null) as any}
          />
        </div>
      </div>
    );
  }
}

export default connect<StateProps, {}, {}, AppState>(state => ({
  form: state.ccr.form as CCRDraft,
}))(CCRFlowPreview);
