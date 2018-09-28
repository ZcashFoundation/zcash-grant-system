import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Button } from 'antd';
import { BaseButtonProps } from 'antd/lib/button/button';

interface OwnProps {
  to: string;
}

type Props = OwnProps & BaseButtonProps & RouteComponentProps<any>;

class LinkButton extends React.Component<Props> {
  render() {
    const { history, to, staticContext, ...rest } = this.props;
    return (
      <Button
        {...rest}
        onClick={(_: React.MouseEvent<any>) => {
          history.push(to);
        }}
      />
    );
  }
}

export default withRouter(LinkButton);
