import React from 'react';
import { connect } from 'react-redux';
import { Alert, Form, Input, message, Modal, Popconfirm, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { ProposalDraft, RFP } from 'types';
import { getCreateErrors } from 'modules/create/utils';
import { Link } from 'react-router-dom';
import { unlinkProposalRFP } from 'modules/create/actions';
import { AppState } from 'store/reducers';
import './Basics.less';

interface OwnProps {
  proposalId: number;
  initialState?: Partial<State>;

  updateForm(form: Partial<ProposalDraft>): void;
}

interface StateProps {
  isUnlinkingProposalRFP: AppState['create']['isUnlinkingProposalRFP'];
  unlinkProposalRFPError: AppState['create']['unlinkProposalRFPError'];
}

interface DispatchProps {
  unlinkProposalRFP: typeof unlinkProposalRFP;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State extends Partial<ProposalDraft> {
  title: string;
  brief: string;
  target: string;
  rfp?: RFP;
  visible: boolean;
  postAgreementOptIn: boolean;
}

class CreateFlowBasics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: '',
      brief: '',
      target: '',
      visible: false,
      postAgreementOptIn: false,
      ...(props.initialState || {}),
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  componentDidUpdate(prevProps: Props) {
    const { unlinkProposalRFPError, isUnlinkingProposalRFP } = this.props;
    if (
      unlinkProposalRFPError &&
      unlinkProposalRFPError !== prevProps.unlinkProposalRFPError
    ) {
      console.error('Failed to unlink request:', unlinkProposalRFPError);
      message.error('Failed to unlink request');
    } else if (!isUnlinkingProposalRFP && prevProps.isUnlinkingProposalRFP) {
      this.setState({ rfp: undefined });
      message.success('Unlinked proposal from request');
    }
  }

  render() {
    const { isUnlinkingProposalRFP } = this.props;
    const { title, brief, target, rfp, rfpOptIn, postAgreementOptIn } = this.state;
    if (rfp && rfp.bounty && (target === null || target === '0')) {
      this.setState({ target: rfp.bounty.toString() });
    }
    const errors = getCreateErrors(this.state, true);

    // Don't show target error at zero since it defaults to that
    // Error just shows up at the end to prevent submission
    if (target === '0') {
      errors.target = undefined;
    }

    return (
      <Form layout='vertical' style={{ maxWidth: 600, margin: '0 auto' }}>
        {rfp && (
          <Alert
            className='CreateFlow-rfpAlert'
            type='info'
            message='This proposal is linked to a request'
            description={
              <>
                This proposal is for the open request{' '}
                <Link to={`/requests/${rfp.id}`} target='_blank'>
                  {rfp.title}
                </Link>
                . If you didn’t mean to do this, or want to unlink it,{' '}
                <Popconfirm
                  title='Are you sure? This cannot be undone.'
                  onConfirm={this.unlinkRfp}
                  okButtonProps={{ loading: isUnlinkingProposalRFP }}
                >
                  <a>click here</a>
                </Popconfirm>{' '}
                to do so.
              </>
            }
            showIcon
          />
        )}

        <Alert
          className='CreateFlow-rfpAlert'
          type='warning'
          message='Terms & Conditions and KYC (know your customer)'
          description={
            <>
              <div>
                In the event your proposal is accepted with funding, you will need to
                provide identifying information to the Zcash Foundation.
                <Radio.Group onChange={this.handleRfpOptIn}>
                  <Radio value={true} checked={rfpOptIn && rfpOptIn === true}>
                    <b>Yes</b>, I agree to all terms and conditions in the Grant Agreement and am willing to provide KYC
                    information as outlined in the <a target={'_blank'}
                                                      href={'https://www.zfnd.org/about/grant-agreement/'}>Grant
                    Agreement</a>
                  </Radio>
                  <Radio value={false} checked={rfpOptIn !== null && rfpOptIn === false}>
                    <b>No</b>, I do not agree to the <a target={'_blank'}
                                                        href={'https://www.zfnd.org/about/grant-agreement/'}>Grant
                    Agreement</a> and/or I do not wish to provide KYC information and understand I will not be able to
                    submit my proposal.
                  </Radio>
                </Radio.Group>
              </div>
            </>
          }
        />

        <Alert
          className='CreateFlow-rfpAlert'
          type='warning'
          message='Zcash Community Forum Post Agreement'
          description={
            <>
              <div>
                I acknowledge it is my responsibility to post the details of this request on the <a
                href={'https://forum.zcashcommunity.com/'}>Zcash Community Forum</a> for community input prior to ZOMG
                discussing and voting on this request.
                <Radio.Group onChange={this.handlePostAgreementOptIn}>
                  <Radio value={true} checked={postAgreementOptIn && postAgreementOptIn === true}>
                    <b>Yes</b>
                  </Radio>
                  <Radio value={false} checked={postAgreementOptIn !== null && postAgreementOptIn === false}>
                    <b>No</b>
                  </Radio>
                </Radio.Group>
              </div>
            </>
          }
        />

        <Modal
          title='Know Your Customer (KYC) Compliance'
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className={'KYCModal'}
        >
          <ol>
            <li>To execute a transfer of funds, the Zcash Foundation is legally required to obtain the following
              information
              from you: [Privacy guarantee]
              <ol>
                <li>A photocopy of your state-issued identification (passport, driver's license, etc.)</li>

                <li>A filled-out form <a href={'https://www.irs.gov/pub/irs-pdf/fw9.pdf'}>W-9</a> (if US taxpayer) or <a
                  href={'https://www.irs.gov/pub/irs-pdf/fw8ben.pdf'}>W-8BEN</a> (if nonresident alien individual), or
                  a <a href={'https://www.irs.gov/pub/irs-pdf/fw8bene.pdf'}>W-8BEN-E</a> (if foreign corporation)
                </li>

                <li>The Foundation will run a Sanctions Screening and Fraud Monitoring on each recipient of its funds.
                  As a condition of receiving the funds you represent to us, now and until the latter of the submission
                  of a
                  report on the status of the work covered by the proposal or the use of all of the funds, (i) that you
                  are not
                  in violation of any law relating to terrorism or money laundering (“Anti-Terrorism Laws”), including
                  Executive Order No. 13224 on Terrorist Financing, effective September 24, 2001 (the “Executive
                  Order”), and the
                  Uniting and Strengthening America by Providing Appropriate Tools Required to Intercept and Obstruct
                  Terrorism Act of 2001(Title III of P.L. No. 107-56) (known as the “PATRIOT Act”). (ii) neither you or
                  any affiliated
                  person or entity is a person that is listed in the annex to, or is otherwise subject to the provisions
                  of,
                  the Executive Order or a person that is named as a “specially designated national and blocked person”
                  on
                  the most current list published by the US Department of the Treasury, Office of Foreign Assets Control
                  (“OFAC”) at its
                  official website or any replacement website or other replacement official publication of such list;
                  (iii) neither you or any affiliated person or entity is subject to blocking provisions or otherwise a
                  target of
                  sanctions imposed under any sanctions program administered by OFAC; and (iv) neither you or any
                  affiliate person
                  or entity deals in, or otherwise engages in any transaction relating to any property or interests in
                  property blocked pursuant to the Executive Order.
                </li>

                <li>With certain limited exceptions, in the following January the Zcash Foundation will report the value
                  of the funds as taxable income on either US tax form 1099-MISC (for US taxpayers) or 1042-S (for
                  foreign
                  persons). These forms will report the value of the award in USD at the date it was distributed. You
                  may need to
                  include this income when filing your taxes, and it may affect your total tax due and estimated tax
                  payments. Here are more details on <a href={'https://www.irs.gov/forms-pubs/about-form-1099-misc'}>filing
                    the
                    1099-MISC</a> in the US, and its tax implications.
                </li>
              </ol>
            </li>
            <li>Your funds will be disbursed in a shielded Zcash cryptocurrency (ZEC), then it will be via an
              on-blockchain
              fund transfer transaction. The Foundation will use this third-party service and market for converting ZEC
              to
              other currencies are listed here based on the price of the agreed-upon date close of day at :
              <a href={'https://messari.io/asset/zcash'}>https://messari.io/asset/zcash</a>. For all grants, the
              agreed-upon date will be the date that the grant was
              approved, as noted in the grant platform. Note that the Zcash Foundation understands the regulatory and
              compliance risks associated with transacting in cryptocurrencies.
            </li>

            <li>Tax Implications: Please be aware that in some countries, taxes will be due on the ZEC grant you receive
              (for the receipt of ZEC, when you sell/exchange it, or both). Specifically:

              <ol>
                <li>Capital gain tax may be due if you later sell/exchange your ZEC for a higher price</li>
              </ol>
            </li>
          </ol>
        </Modal>

        <Form.Item
          label='Title'
          validateStatus={errors.title ? 'error' : undefined}
          help={errors.title}
        >
          <Input
            size='large'
            name='title'
            placeholder='Short and sweet'
            type='text'
            value={title}
            onChange={this.handleInputChange}
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label='Brief'
          validateStatus={errors.brief ? 'error' : undefined}
          help={errors.brief}
        >
          <Input.TextArea
            name='brief'
            placeholder='A one-liner elevator-pitch version of your proposal, max 140 chars.'
            value={brief}
            onChange={this.handleInputChange}
            rows={3}
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label='Target amount'
          validateStatus={errors.target ? 'error' : undefined}
          help={
            errors.target ||
            'You will be paid out in ZEC based in USD market price at payout time. This cannot be changed once your proposal starts'
          }
        >
          <Input
            size='large'
            name='target'
            placeholder='1.5'
            type='number'
            value={target}
            onChange={this.handleInputChange}
            addonBefore='$'
            maxLength={16}
          />
        </Form.Item>
      </Form>
    );
  }

  handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value, name } = event.currentTarget;
    this.setState({ [name]: value } as any, () => {
      this.props.updateForm(this.state);
    });
  };

  handleRfpOptIn = (e: RadioChangeEvent) => {
    this.setState({ rfpOptIn: e.target.value }, () => {
      this.props.updateForm(this.state);
    });
  };

  handlePostAgreementOptIn = (e: RadioChangeEvent) => {
    this.setState({ postAgreementOptIn: e.target.value }, () => {
      this.props.updateForm(this.state);
    });
  };


  unlinkRfp = () => {
    this.props.unlinkProposalRFP(this.props.proposalId);
  };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>(
  state => ({
    isUnlinkingProposalRFP: state.create.isUnlinkingProposalRFP,
    unlinkProposalRFPError: state.create.unlinkProposalRFPError,
  }),
  { unlinkProposalRFP },
)(CreateFlowBasics);
