import React from 'react';
import { Form } from 'antd';
import MarkdownEditor from 'components/MarkdownEditor';
import { ProposalDraft } from 'types';

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
    return (
      <Form layout="vertical" style={{ maxWidth: 980, margin: '0 auto' }}>
        <MarkdownEditor
          onChange={this.handleChange}
          initialMarkdown={this.state.content}
        />
      </Form>
    );
  }

  private handleChange = (markdown: string) => {
    this.setState({ content: markdown }, () => {
      this.props.updateForm(this.state);
    });
  };
}
