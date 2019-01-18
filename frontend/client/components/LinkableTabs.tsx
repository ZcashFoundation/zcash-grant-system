import React from 'react';
import { findDOMNode } from 'react-dom';
import qs from 'query-string';
import { withRouter, RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';
import { TabsProps } from 'antd/lib/tabs';

interface OwnProps extends TabsProps {
  scrollToTabs?: boolean;
}

type Props = OwnProps & RouteComponentProps;

interface State {
  defaultActiveKey: string | undefined;
}

class LinkableTabs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let { defaultActiveKey } = props;
    const tab = this.getTabFromUrl(props.location);
    if (tab) {
      defaultActiveKey = tab;
    }
    this.state = { defaultActiveKey };
  }

  componentDidMount() {
    const tab = this.getTabFromUrl(this.props.location);
    if (tab && this.props.scrollToTabs) {
      setTimeout(() => {
        // Don't wrestle control from the user
        if (window.scrollY !== 0) {
          return;
        }

        const node = findDOMNode(this);
        if (node instanceof HTMLElement) {
          window.scrollTo({
            top: node.offsetTop,
            behavior: 'smooth',
          });
        }
      }, 500);
    }
  }

  render() {
    const { defaultActiveKey } = this.state;
    return <Tabs {...this.props} defaultActiveKey={defaultActiveKey} />;
  }

  private getTabFromUrl(location: RouteComponentProps['location']): string | undefined {
    const args = qs.parse(location.search);
    return args.tab;
  }
}

export default withRouter(LinkableTabs);
