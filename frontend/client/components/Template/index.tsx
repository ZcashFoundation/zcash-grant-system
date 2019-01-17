import React from 'react';
import { Layout } from 'antd';
import classnames from 'classnames';
import BasicHead from 'components/BasicHead';
import Header from 'components/Header';
import Footer from 'components/Footer';
import './index.less';

export interface TemplateProps {
  title: string;
  isHeaderTransparent?: boolean;
  isFullScreen?: boolean;
  hideFooter?: boolean;
}

type Props = TemplateProps;

export default class Template extends React.PureComponent<Props> {
  render() {
    const { children, title, isHeaderTransparent, isFullScreen, hideFooter } = this.props;

    const content = children;
    const isCentered = false;

    const className = classnames(
      'Template',
      isFullScreen && 'is-fullscreen',
      isCentered && 'is-centered',
    );
    return (
      <BasicHead title={title}>
        <div className={className}>
          <Header isTransparent={isHeaderTransparent} />
          <Layout.Content className="Template-content">
            <div className="Template-content-inner">{content}</div>
          </Layout.Content>
          {!hideFooter && <Footer />}
        </div>
      </BasicHead>
    );
  }
}
