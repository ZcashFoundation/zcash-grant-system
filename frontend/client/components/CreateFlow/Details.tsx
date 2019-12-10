import React from 'react';
import { Form, Alert } from 'antd';
import MarkdownEditor from 'components/MarkdownEditor';
import { ProposalDraft } from 'types';
import { getCreateErrors } from 'modules/create/utils';

interface State {
  content: string;
}

interface Props {
  initialState?: Partial<State>;
  updateForm(form: Partial<ProposalDraft>): void;
}

export default class CreateFlowTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      content: '',
      ...(props.initialState || {}),
    };
  }

  render() {
    const errors = getCreateErrors(this.state, true);

    return (
      <Form layout="vertical" style={{ maxWidth: 980, margin: '0 auto' }}>
        <MarkdownEditor
          onChange={this.handleChange}
          initialMarkdown={this.state.content}
          minHeight={400}
        />
        {errors.content && <Alert type="error" message={errors.content} showIcon />}
      </Form>
    );
  }

  private handleChange = (markdown: string) => {
    if (markdown !== this.state.content) {
      this.setState({ content: markdown }, () => {
        this.props.updateForm(this.state);
      });
    }
  };
}
