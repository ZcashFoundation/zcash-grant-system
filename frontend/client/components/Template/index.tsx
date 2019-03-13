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
        {!isHeaderTransparent && (
          <noscript className="noScript is-banner">
            It looks like you have Javascript disabled. You may experience issues with
            interactive parts of the site.
          </noscript>
        )}
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
