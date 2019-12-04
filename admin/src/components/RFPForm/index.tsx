import React from 'react';
import moment from 'moment';
import { view } from 'react-easy-state';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Form, Input, Select, Button, message, Spin, Row, Col, DatePicker } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';
import { FormComponentProps } from 'antd/lib/form';
import { RFP_STATUS, RFPArgs } from 'src/types';
import { typedKeys } from 'util/ts';
import { RFP_STATUSES, getStatusById } from 'util/statuses';
import Markdown from 'components/Markdown';
import Back from 'components/Back';
import store from 'src/store';
import './index.less';

type Props = FormComponentProps & RouteComponentProps<{ id?: string }>;

interface State {
  isShowingPreview: boolean;
}

class RFPForm extends React.Component<Props, State> {
  state: State = {
    isShowingPreview: false,
  };

  constructor(props: Props) {
    super(props);
    const rfpId = this.getRFPId();
    if (rfpId && !store.rfpsFetched) {
      store.fetchRFPs();
    }
  }

  render() {
    const { isShowingPreview } = this.state;
    const { getFieldDecorator, getFieldValue, isFieldsTouched } = this.props.form;

    let defaults: RFPArgs = {
      title: '',
      brief: '',
      content: '',
      status: '',
      matching: false,
      bounty: undefined,
      dateCloses: undefined,
    };
    const rfpId = this.getRFPId();
    let isVersionTwo = true;

    if (rfpId) {
      if (!store.rfpsFetched) {
        return <Spin />;
      }

      const rfp = store.rfps.find(r => r.id === rfpId);
      if (rfp) {
        defaults = {
          title: rfp.title,
          brief: rfp.brief,
          content: rfp.content,
          status: rfp.status,
          matching: rfp.matching,
          bounty: rfp.bounty,
          dateCloses: rfp.dateCloses || undefined,
        };
        isVersionTwo = rfp.isVersionTwo;
      } else {
        return <Exception type="404" desc="This RFP does not exist" />;
      }
    }

    const dateCloses = isFieldsTouched(['dateCloses'])
      ? getFieldValue('dateCloses')
      : defaults.dateCloses && moment(defaults.dateCloses * 1000);
    const forceClosed = dateCloses && dateCloses.isBefore(moment.now());

    const bountyMatchRule = isVersionTwo
      ? { pattern: /^[^.]*$/, message: 'Cannot contain a decimal' }
      : {};

    return (
      <Form className="RFPForm" layout="vertical" onSubmit={this.handleSubmit}>
        <Back to="/rfps" text="RFPs" />
        <Form.Item label="Title">
          {getFieldDecorator('title', {
            initialValue: defaults.title,
            rules: [
              { required: true, message: 'Title is required' },
              { max: 60, message: 'Max 60 chars' },
            ],
          })(
            <Input
              autoComplete="off"
              name="title"
              placeholder="Max 60 chars"
              size="large"
              autoFocus
            />,
          )}
        </Form.Item>

        {rfpId && (
          <Form.Item
            label="Status"
            help={
              forceClosed && 'Status is forced to "Closed" when close date is in the past'
            }
          >
            {getFieldDecorator('status', {
              initialValue: defaults.status,
              rules: [{ required: true, message: 'Status is required' }],
            })(
              <Select size="large" placeholder="Select a status" disabled={forceClosed}>
                {typedKeys(RFP_STATUS).map(c => (
                  <Select.Option value={c} key={c}>
                    {getStatusById(RFP_STATUSES, c).tagDisplay}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
        )}

        <Form.Item label="Brief description">
          {getFieldDecorator('brief', {
            initialValue: defaults.brief,
            rules: [
              { required: true, message: 'Title is required' },
              { max: 200, message: 'Max 200 chars' },
            ],
          })(<Input.TextArea rows={3} name="brief" placeholder="Max 200 chars" />)}
        </Form.Item>

        <Form.Item className="RFPForm-content" label="Content" required>
          {/* Keep rendering even while hiding to not reset value */}
          <div style={{ display: isShowingPreview ? 'none' : 'block' }}>
            {getFieldDecorator('content', {
              initialValue: defaults.content,
              rules: [{ required: true, message: 'Content is required' }],
            })(
              <Input.TextArea
                rows={8}
                name="content"
                placeholder="Preview will appear on the right"
                autosize={{ minRows: 6, maxRows: 15 }}
              />,
            )}
          </div>
          {isShowingPreview ? (
            <>
              <div className="RFPForm-content-preview">
                <Markdown source={getFieldValue('content') || '_No content_'} />
              </div>
              <a className="RFPForm-content-previewToggle" onClick={this.togglePreview}>
                Edit content
              </a>
            </>
          ) : (
            <a className="RFPForm-content-previewToggle" onClick={this.togglePreview}>
              Preview content
            </a>
          )}
        </Form.Item>

        <Row>
          <Col sm={12} xs={12}>
            <Form.Item className="RFPForm-bounty" label="Bounty">
              {getFieldDecorator('bounty', {
                initialValue: defaults.bounty,
                rules: [
                  { required: true, message: 'Bounty is required' },
                  bountyMatchRule,
                ],
              })(
                <Input
                  autoComplete="off"
                  name="bounty"
                  placeholder="1000"
                  addonBefore={isVersionTwo ? '$' : undefined}
                  addonAfter={isVersionTwo ? undefined : 'ZEC'}
                  size="large"
                />,
              )}
            </Form.Item>
          </Col>
          <Col sm={12} xs={24}>
            <Form.Item
              className="RFPForm-date"
              label="Close date"
              help="Date that proposals will stop being submittable by"
            >
              {getFieldDecorator('dateCloses', {
                initialValue: defaults.dateCloses
                  ? moment(defaults.dateCloses * 1000)
                  : undefined,
              })(<DatePicker size="large" />)}
            </Form.Item>
          </Col>
        </Row>

        <div className="RFPForm-buttons">
          <Button type="primary" htmlType="submit" size="large">
            Submit
          </Button>
          <Link to="/rfps">
            <Button type="ghost" size="large">
              Cancel
            </Button>
          </Link>
        </div>
      </Form>
    );
  }

  private getRFPId = () => {
    const rfpId = this.props.match.params.id;
    if (rfpId) {
      return parseInt(rfpId, 10);
    }
  };

  private togglePreview = () => {
    this.setState({ isShowingPreview: !this.state.isShowingPreview });
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err: any, rawValues: any) => {
      if (err) return;

      const rfpId = this.getRFPId();
      const values = {
        ...rawValues,
        dateCloses: rawValues.dateCloses && rawValues.dateCloses.unix(),
      };
      let msg;
      if (rfpId) {
        await store.editRFP(rfpId, values);
        msg = 'Successfully updated RFP';
      } else {
        await store.createRFP(values);
        msg = 'Successfully created RFP. To publish, edit it and set status to "Live"';
      }

      if (store.rfpSaved) {
        message.success(msg, 3);
        this.props.history.replace('/rfps');
      }
    });
  };
}

export default Form.create()(withRouter(view(RFPForm)));
