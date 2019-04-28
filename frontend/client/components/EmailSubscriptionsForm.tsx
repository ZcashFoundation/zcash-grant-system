import React from 'react';
import { Form, Button, Checkbox, Divider } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { EmailSubscriptions } from 'types';
import { groupEmailSubscriptionsByCategory } from 'utils/email';
import './EmailSubscriptionsForm.less';

interface OwnProps {
  emailSubscriptions: EmailSubscriptions;
  loading: boolean;
  onSubmit: (settings: EmailSubscriptions) => void;
  isAdmin: boolean;
}

type Props = OwnProps & FormComponentProps;

class EmailSubscriptionsForm extends React.Component<Props, {}> {
  componentDidMount() {
    this.props.form.setFieldsValue(this.props.emailSubscriptions);
  }
  render() {
    const { emailSubscriptions, loading, isAdmin } = this.props;
    const { getFieldDecorator } = this.props.form;
    const groupedSubs = groupEmailSubscriptionsByCategory(emailSubscriptions, isAdmin);

    const fields = Object.entries(this.props.form.getFieldsValue());
    const numChecked = fields.map(([_, v]) => v).filter(v => v).length;
    const numUnchecked = fields.map(([_, v]) => v).filter(v => !v).length;

    const indeterminate = numChecked !== 0 && numUnchecked !== 0;
    const isAllChecked = numChecked === fields.length;

    return (
      <div className="EmailSubscriptionsForm">
        <Form className="EmailSubscriptionsForm-form" onSubmit={this.handleSubmit}>
          {groupedSubs.map(gs => (
            <div key={gs.category.key}>
              <Divider orientation="left">{gs.category.description}</Divider>
              {gs.subscriptionSettings.map(ss => (
                <div key={ss.key}>
                  <Form.Item>
                    {getFieldDecorator(ss.key, {
                      valuePropName: 'checked',
                    })(<Checkbox>{ss.description}</Checkbox>)}
                  </Form.Item>
                </div>
              ))}
            </div>
          ))}
          <div>
            <Divider />
            <Form.Item>
              <Checkbox
                indeterminate={indeterminate}
                onChange={this.handleCheckAll}
                checked={isAllChecked}
              >
                <b>{isAllChecked ? 'uncheck all' : 'check all'}</b>
              </Checkbox>
            </Form.Item>
          </div>
          <div>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Save settings
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  private handleCheckAll = () => {
    const fields = Object.entries(this.props.form.getFieldsValue());
    const numChecked = fields.map(([_, v]) => v).filter(v => v).length;
    const checked = numChecked !== fields.length;
    const newSettings = fields.reduce((a: any, [k, _]) => {
      a[k] = checked;
      return a;
    }, {});
    this.props.form.setFieldsValue(newSettings);
  };

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    this.props.onSubmit(this.props.form.getFieldsValue() as EmailSubscriptions);
  };
}

const FormWrappedEmailSubscriptionsForm = Form.create()(EmailSubscriptionsForm);

export default FormWrappedEmailSubscriptionsForm;
