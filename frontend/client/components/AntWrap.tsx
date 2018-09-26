import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import BasicHead from './BasicHead';
import Header from './Header';
import Footer from './Footer';

export interface Props {
  title: string;
  isHeaderTransparent?: boolean;
  isFullScreen?: boolean;
  hideFooter?: boolean;
  withBreadcrumb?: boolean | null;
  centerContent?: boolean;
}

const { Content } = Layout;

class AntWrap extends React.Component<Props> {
  render() {
    const {
      children,
      withBreadcrumb,
      title,
      isHeaderTransparent,
      isFullScreen,
      hideFooter,
      centerContent,
    } = this.props;
    return (
      <BasicHead title={title}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header isTransparent={isHeaderTransparent} />
          <Content
            style={{
              display: 'flex',
              justifyContent: 'center',
              flex: 1,
              padding: isFullScreen ? '0' : '0 2.5rem',
            }}
          >
            {withBreadcrumb && (
              <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>List</Breadcrumb.Item>
                <Breadcrumb.Item>App</Breadcrumb.Item>
              </Breadcrumb>
            )}
            <div
              style={{
                width: '100%',
                paddingTop: isFullScreen ? 0 : 50,
                paddingBottom: isFullScreen ? 0 : 50,
                minHeight: 280,
                alignSelf: centerContent ? 'center' : 'initial',
              }}
            >
              {children}
            </div>
          </Content>
          {!hideFooter && <Footer />}
        </div>
      </BasicHead>
    );
  }
}
export default AntWrap;
